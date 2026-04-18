import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultingEmailService } from './consulting-email.service';

/**
 * Consulting Email Controller
 *
 * API endpoints for manually triggering consulting lifecycle emails.
 * SuperAdmin only.
 *
 * Endpoints:
 * - POST /consulting/emails/contract-ready
 * - POST /consulting/emails/intake-available
 * - POST /consulting/emails/engagement-expiring
 */
@Controller('consulting/emails')
@UseGuards(JwtAuthGuard)
export class ConsultingEmailController {
  private readonly logger = new Logger(ConsultingEmailController.name);

  constructor(
    private prisma: PrismaService,
    private consultingEmailService: ConsultingEmailService,
  ) {}

  /**
   * POST /consulting/emails/contract-ready
   * Send notification that a contract is ready for signature
   */
  @Post('contract-ready')
  async sendContractReadyEmail(
    @Request() req: any,
    @Body() body: { documentId: string },
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can trigger emails');
    }

    const document = await this.prisma.signedDocument.findUnique({
      where: { id: body.documentId },
      include: {
        lead: {
          select: { name: true, email: true },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document ${body.documentId} not found`);
    }

    if (!document.lead) {
      throw new ForbiddenException('Document has no associated lead');
    }

    const signUrl = `https://app.zanderos.com/documents/sign/${document.id}`;

    await this.consultingEmailService.sendContractReadyEmail(
      document.lead.email,
      document.lead.name,
      document.type,
      signUrl,
    );

    this.logger.log(`Contract ready email triggered for document ${body.documentId}`);

    return {
      success: true,
      message: `Contract ready email sent to ${document.lead.email}`,
    };
  }

  /**
   * POST /consulting/emails/intake-available
   * Send notification that intake survey is ready
   */
  @Post('intake-available')
  async sendIntakeAvailableEmail(
    @Request() req: any,
    @Body() body: { engagementId: string },
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can trigger emails');
    }

    const engagement = await this.prisma.consultingEngagement.findUnique({
      where: { id: body.engagementId },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${body.engagementId} not found`);
    }

    const user = engagement.tenant?.users?.[0];
    if (!user) {
      throw new ForbiddenException('No user found for engagement tenant');
    }

    const intakeUrl = `https://app.zanderos.com/headquarters?tab=intake`;

    await this.consultingEmailService.sendIntakeAvailableEmail(
      user.email,
      user.firstName || engagement.tenant.companyName || 'Client',
      intakeUrl,
    );

    this.logger.log(`Intake available email triggered for engagement ${body.engagementId}`);

    return {
      success: true,
      message: `Intake available email sent to ${user.email}`,
    };
  }

  /**
   * POST /consulting/emails/engagement-expiring
   * Send warning that engagement is about to expire
   */
  @Post('engagement-expiring')
  async sendEngagementExpiringEmail(
    @Request() req: any,
    @Body() body: { engagementId: string },
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can trigger emails');
    }

    const engagement = await this.prisma.consultingEngagement.findUnique({
      where: { id: body.engagementId },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${body.engagementId} not found`);
    }

    if (!engagement.endDate) {
      throw new ForbiddenException('Engagement has no end date set');
    }

    const user = engagement.tenant?.users?.[0];
    if (!user) {
      throw new ForbiddenException('No user found for engagement tenant');
    }

    const hoursRemaining = engagement.totalHours - engagement.hoursUsed;

    await this.consultingEmailService.sendEngagementExpiringEmail(
      user.email,
      user.firstName || engagement.tenant.companyName || 'Client',
      new Date(engagement.endDate),
      hoursRemaining,
    );

    this.logger.log(`Engagement expiring email triggered for engagement ${body.engagementId}`);

    return {
      success: true,
      message: `Engagement expiring email sent to ${user.email}`,
    };
  }

  /**
   * POST /consulting/emails/hours-low
   * Manually send hours low warning
   */
  @Post('hours-low')
  async sendHoursLowEmail(
    @Request() req: any,
    @Body() body: { engagementId: string },
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can trigger emails');
    }

    const engagement = await this.prisma.consultingEngagement.findUnique({
      where: { id: body.engagementId },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${body.engagementId} not found`);
    }

    const user = engagement.tenant?.users?.[0];
    if (!user) {
      throw new ForbiddenException('No user found for engagement tenant');
    }

    const hoursRemaining = engagement.totalHours - engagement.hoursUsed;

    await this.consultingEmailService.sendHoursLowEmail(
      user.email,
      user.firstName || engagement.tenant.companyName || 'Client',
      hoursRemaining,
      engagement.totalHours,
      engagement.packageType,
    );

    this.logger.log(`Hours low email triggered for engagement ${body.engagementId}`);

    return {
      success: true,
      message: `Hours low email sent to ${user.email}`,
    };
  }

  /**
   * POST /consulting/emails/deliverable-ready
   * Manually send deliverable ready notification
   */
  @Post('deliverable-ready')
  async sendDeliverableReadyEmail(
    @Request() req: any,
    @Body() body: { deliverableId: string },
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can trigger emails');
    }

    const deliverable = await this.prisma.consultingDeliverable.findUnique({
      where: { id: body.deliverableId },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!deliverable) {
      throw new NotFoundException(`Deliverable ${body.deliverableId} not found`);
    }

    const user = deliverable.tenant?.users?.[0];
    if (!user) {
      throw new ForbiddenException('No user found for deliverable tenant');
    }

    await this.consultingEmailService.sendDeliverableReadyEmail(
      user.email,
      user.firstName || deliverable.tenant.companyName || 'Client',
      deliverable.name,
    );

    this.logger.log(`Deliverable ready email triggered for ${body.deliverableId}`);

    return {
      success: true,
      message: `Deliverable ready email sent to ${user.email}`,
    };
  }
}
