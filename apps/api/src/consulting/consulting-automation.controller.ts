import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultingAutomationService } from './consulting-automation.service';
import { ConsultingEmailService } from './consulting-email.service';
import { EmailService } from '../integrations/email/email.service';
import { Public } from '../auth/jwt-auth.decorator';
import { randomUUID } from 'crypto';

/**
 * D-4: Deliverable Approval Endpoints
 * D-7: Survey Endpoints
 *
 * Includes both JWT-protected (internal) and public token-based endpoints.
 */
@Controller('consulting')
export class ConsultingAutomationController {
  private readonly logger = new Logger(ConsultingAutomationController.name);

  constructor(
    private prisma: PrismaService,
    private automationService: ConsultingAutomationService,
    private consultingEmailService: ConsultingEmailService,
    private emailService: EmailService,
  ) {}

  // ============================================
  // D-4: DELIVERABLE APPROVAL - PROTECTED ENDPOINTS
  // ============================================

  /**
   * POST /consulting/deliverables/:id/submit
   * Submit a deliverable for client review (JWT auth required)
   */
  @Post('deliverables/:id/submit')
  async submitDeliverable(
    @Param('id') deliverableId: string,
    @Req() req: any,
  ) {
    const deliverable = await this.prisma.consultingDeliverable.findUnique({
      where: { id: deliverableId },
      include: {
        tenant: {
          include: {
            users: { take: 1, orderBy: { createdAt: 'asc' } },
          },
        },
        engagement: { select: { packageType: true } },
      },
    });

    if (!deliverable) {
      throw new NotFoundException(`Deliverable ${deliverableId} not found`);
    }

    // Generate review token
    const reviewToken = randomUUID();

    // Update deliverable with submission info
    const updated = await this.prisma.consultingDeliverable.update({
      where: { id: deliverableId },
      data: {
        approvalStatus: 'submitted',
        submittedAt: new Date(),
        reviewToken,
      },
    });

    // Log event
    await this.prisma.consultingEvent.create({
      data: {
        type: 'DELIVERABLE_SUBMITTED',
        engagementId: deliverable.engagementId,
        description: `Deliverable "${deliverable.name}" submitted for client review`,
        metadata: {
          deliverableId,
          reviewToken,
        },
        actorType: 'user',
        actorId: req.user?.userId,
      },
    });

    // Create L3 DRAFT email to client with review link
    const recipientEmail = deliverable.tenant?.users?.[0]?.email || deliverable.tenant?.email;
    const recipientName = deliverable.tenant?.users?.[0]?.firstName || deliverable.tenant?.companyName || 'Client';
    const reviewUrl = `https://app.zanderos.com/consulting/review/${reviewToken}`;

    if (recipientEmail) {
      await this.prisma.scheduledCommunication.create({
        data: {
          tenantId: deliverable.tenantId,
          type: 'deliverable_review_request',
          subject: `Please Review: ${deliverable.name}`,
          body: JSON.stringify({
            action: 'send_deliverable_review_request',
            deliverableId,
            deliverableName: deliverable.name,
            recipientEmail,
            recipientName,
            reviewUrl,
            packageType: deliverable.engagement?.packageType,
          }),
          recipientEmail,
          recipientName,
          scheduledFor: new Date(),
          status: 'DRAFT',
          needsApproval: true,
          metadata: {
            deliverableId,
            reviewToken,
          },
        },
      });
    }

    this.logger.log(`Deliverable ${deliverableId} submitted for review, token: ${reviewToken}`);

    return {
      success: true,
      deliverable: updated,
      reviewUrl,
      message: `Deliverable submitted. Review link email drafted for approval.`,
    };
  }

  // ============================================
  // D-4: DELIVERABLE APPROVAL - PUBLIC TOKEN ENDPOINTS
  // ============================================

  /**
   * GET /consulting/review/:token
   * Fetch deliverable for client review (PUBLIC - token is auth)
   */
  @Public()
  @Get('review/:token')
  async getDeliverableForReview(@Param('token') token: string) {
    const deliverable = await this.prisma.consultingDeliverable.findFirst({
      where: { reviewToken: token },
      include: {
        engagement: {
          select: {
            packageType: true,
            tenant: { select: { companyName: true } },
          },
        },
        tenant: { select: { companyName: true } },
      },
    });

    if (!deliverable) {
      throw new NotFoundException('Review link is invalid or expired');
    }

    if (deliverable.approvalStatus === 'approved') {
      return {
        success: false,
        error: 'already_approved',
        message: 'This deliverable has already been approved.',
        deliverable: {
          name: deliverable.name,
          approvedAt: deliverable.approvedAt,
        },
      };
    }

    return {
      success: true,
      deliverable: {
        id: deliverable.id,
        name: deliverable.name,
        description: deliverable.description,
        documentUrl: deliverable.documentUrl,
        approvalStatus: deliverable.approvalStatus,
        submittedAt: deliverable.submittedAt,
        revisionNotes: deliverable.revisionNotes,
        revisionRequestedAt: deliverable.revisionRequestedAt,
        engagement: {
          packageType: deliverable.engagement?.packageType,
          companyName: deliverable.engagement?.tenant?.companyName || deliverable.tenant?.companyName,
        },
      },
    };
  }

  /**
   * POST /consulting/review/:token/approve
   * Client approves deliverable (PUBLIC - token is auth)
   */
  @Public()
  @Post('review/:token/approve')
  async approveDeliverable(@Param('token') token: string) {
    const deliverable = await this.prisma.consultingDeliverable.findFirst({
      where: { reviewToken: token },
      include: {
        engagement: { select: { id: true, packageType: true } },
        tenant: { select: { companyName: true } },
      },
    });

    if (!deliverable) {
      throw new NotFoundException('Review link is invalid or expired');
    }

    if (deliverable.approvalStatus === 'approved') {
      throw new BadRequestException('This deliverable has already been approved');
    }

    // Update deliverable
    await this.prisma.consultingDeliverable.update({
      where: { id: deliverable.id },
      data: {
        approvalStatus: 'approved',
        approvedAt: new Date(),
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });

    // Log event
    await this.prisma.consultingEvent.create({
      data: {
        type: 'DELIVERABLE_APPROVED',
        engagementId: deliverable.engagement?.id,
        description: `Client approved deliverable: ${deliverable.name}`,
        metadata: {
          deliverableId: deliverable.id,
          approvedAt: new Date().toISOString(),
        },
        actorType: 'client',
      },
    });

    // Send direct notification to Jonathan (not draft - this is inbound client action)
    await this.emailService.sendEmail({
      to: 'jonathan@zanderos.com',
      subject: `Deliverable Approved: ${deliverable.name}`,
      text: `Client (${deliverable.tenant?.companyName}) approved the deliverable "${deliverable.name}".

Package: ${deliverable.engagement?.packageType}
Approved at: ${new Date().toLocaleString()}

The deliverable has been marked as DELIVERED.`,
    });

    this.logger.log(`Deliverable ${deliverable.id} approved by client`);

    return {
      success: true,
      message: 'Thank you! The deliverable has been approved.',
    };
  }

  /**
   * POST /consulting/review/:token/revise
   * Client requests revisions (PUBLIC - token is auth)
   */
  @Public()
  @Post('review/:token/revise')
  async requestRevision(
    @Param('token') token: string,
    @Body() body: { notes: string },
  ) {
    if (!body.notes || body.notes.trim().length === 0) {
      throw new BadRequestException('Please provide revision notes');
    }

    const deliverable = await this.prisma.consultingDeliverable.findFirst({
      where: { reviewToken: token },
      include: {
        engagement: { select: { id: true, packageType: true } },
        tenant: { select: { companyName: true } },
      },
    });

    if (!deliverable) {
      throw new NotFoundException('Review link is invalid or expired');
    }

    if (deliverable.approvalStatus === 'approved') {
      throw new BadRequestException('This deliverable has already been approved');
    }

    // Update deliverable
    await this.prisma.consultingDeliverable.update({
      where: { id: deliverable.id },
      data: {
        approvalStatus: 'revision_requested',
        revisionNotes: body.notes,
        revisionRequestedAt: new Date(),
        status: 'REVISION_REQUESTED',
      },
    });

    // Log event
    await this.prisma.consultingEvent.create({
      data: {
        type: 'DELIVERABLE_REVISION_REQUESTED',
        engagementId: deliverable.engagement?.id,
        description: `Client requested revisions for: ${deliverable.name}`,
        metadata: {
          deliverableId: deliverable.id,
          revisionNotes: body.notes,
          requestedAt: new Date().toISOString(),
        },
        actorType: 'client',
      },
    });

    // Send direct notification to Jonathan (not draft - this is inbound client action)
    await this.emailService.sendEmail({
      to: 'jonathan@zanderos.com',
      subject: `Revision Requested: ${deliverable.name}`,
      text: `Client (${deliverable.tenant?.companyName}) requested revisions for "${deliverable.name}".

Package: ${deliverable.engagement?.packageType}
Requested at: ${new Date().toLocaleString()}

REVISION NOTES:
${body.notes}

Please address these notes and resubmit the deliverable.`,
    });

    this.logger.log(`Revision requested for deliverable ${deliverable.id}`);

    return {
      success: true,
      message: 'Thank you for your feedback. We will address your revision notes promptly.',
    };
  }

  // ============================================
  // D-7: SURVEY ENDPOINTS
  // ============================================

  /**
   * GET /consulting/survey/:token
   * Get survey context (PUBLIC - token is auth)
   */
  @Public()
  @Get('survey/:token')
  async getSurveyContext(@Param('token') token: string) {
    // Find the survey event by token in metadata
    const surveyEvent = await this.prisma.scheduledCommunication.findFirst({
      where: {
        type: 'satisfaction_survey',
        status: { in: ['DRAFT', 'pending', 'sent'] },
      },
    });

    // For simplicity, find by engagement ID from the token
    // The token is embedded in the survey URL
    const engagement = await this.prisma.consultingEngagement.findFirst({
      where: { id: token },
      include: {
        tenant: { select: { companyName: true } },
      },
    });

    if (!engagement) {
      throw new NotFoundException('Survey link is invalid or expired');
    }

    // Check if already responded
    const existingResponse = await this.prisma.consultingEvent.findFirst({
      where: {
        type: 'SURVEY_RESPONSE',
        engagementId: engagement.id,
      },
    });

    if (existingResponse) {
      return {
        success: false,
        error: 'already_submitted',
        message: 'Thank you! You have already submitted feedback for this engagement.',
      };
    }

    return {
      success: true,
      survey: {
        engagementId: engagement.id,
        companyName: engagement.tenant?.companyName,
        packageType: engagement.packageType,
        consultantName: 'Jonathan White',
      },
    };
  }

  /**
   * POST /consulting/survey/:token
   * Submit survey response (PUBLIC - token is auth)
   */
  @Public()
  @Post('survey/:token')
  async submitSurvey(
    @Param('token') token: string,
    @Body() body: {
      npsScore: number;
      mostValuable?: string;
      improvements?: string;
      testimonialConsent?: boolean;
    },
  ) {
    if (body.npsScore === undefined || body.npsScore < 0 || body.npsScore > 10) {
      throw new BadRequestException('NPS score must be between 0 and 10');
    }

    // The token is the engagement ID for simplicity
    const engagement = await this.prisma.consultingEngagement.findFirst({
      where: { id: token },
      include: {
        tenant: { select: { companyName: true } },
      },
    });

    if (!engagement) {
      throw new NotFoundException('Survey link is invalid or expired');
    }

    // Check if already responded
    const existingResponse = await this.prisma.consultingEvent.findFirst({
      where: {
        type: 'SURVEY_RESPONSE',
        engagementId: engagement.id,
      },
    });

    if (existingResponse) {
      throw new BadRequestException('You have already submitted feedback for this engagement');
    }

    // Record survey response
    await this.prisma.consultingEvent.create({
      data: {
        type: 'SURVEY_RESPONSE',
        engagementId: engagement.id,
        description: `Survey response: NPS ${body.npsScore}/10`,
        metadata: {
          npsScore: body.npsScore,
          mostValuable: body.mostValuable,
          improvements: body.improvements,
          testimonialConsent: body.testimonialConsent,
          submittedAt: new Date().toISOString(),
        },
        actorType: 'client',
      },
    });

    // If high NPS and testimonial consent, queue testimonial request (L3 DRAFT)
    if (body.npsScore >= 8 && body.testimonialConsent) {
      await this.prisma.scheduledCommunication.create({
        data: {
          tenantId: engagement.tenantId,
          type: 'testimonial_request',
          subject: `Testimonial Request: ${engagement.tenant?.companyName}`,
          body: JSON.stringify({
            action: 'request_testimonial',
            engagementId: engagement.id,
            companyName: engagement.tenant?.companyName,
            npsScore: body.npsScore,
            feedback: body.mostValuable,
          }),
          recipientEmail: 'jonathan@zanderos.com',
          scheduledFor: new Date(),
          status: 'DRAFT',
          needsApproval: true,
          metadata: {
            engagementId: engagement.id,
            npsScore: body.npsScore,
          },
        },
      });
    }

    // If low NPS, send direct alert to Jonathan (critical feedback)
    if (body.npsScore <= 5) {
      await this.emailService.sendEmail({
        to: 'jonathan@zanderos.com',
        subject: `LOW NPS Alert: ${engagement.tenant?.companyName} - ${body.npsScore}/10`,
        text: `ATTENTION: Low NPS score received!

Client: ${engagement.tenant?.companyName}
Package: ${engagement.packageType}
NPS Score: ${body.npsScore}/10

Most Valuable:
${body.mostValuable || 'Not provided'}

Improvements Requested:
${body.improvements || 'Not provided'}

This requires follow-up within 24 hours.`,
      });
    }

    this.logger.log(`Survey submitted for engagement ${engagement.id}: NPS ${body.npsScore}`);

    return {
      success: true,
      message: 'Thank you for your feedback! Your input helps us improve.',
    };
  }
}
