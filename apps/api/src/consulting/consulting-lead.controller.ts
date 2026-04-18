import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from './dto/create-lead.dto';
import { LeadStatus, ConsultingEventType, EngagementStatus } from '@prisma/client';

@Controller('consulting/leads')
@UseGuards(JwtAuthGuard)
export class ConsultingLeadController {
  private readonly logger = new Logger(ConsultingLeadController.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new consulting lead (superadmin only)
   */
  @Post()
  async createLead(
    @Request() req: any,
    @Body() dto: CreateLeadDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can create leads');
    }

    const lead = await this.prisma.consultingLead.create({
      data: {
        source: dto.source,
        name: dto.name,
        email: dto.email.toLowerCase(),
        company: dto.company,
        phone: dto.phone,
        interestedPackage: dto.interestedPackage,
        message: dto.message,
        calendlyEventUri: dto.calendlyEventUri,
        meetingScheduledAt: dto.meetingScheduledAt ? new Date(dto.meetingScheduledAt) : null,
        estimatedValue: dto.estimatedValue,
        notes: dto.notes,
      },
    });

    // Create INQUIRY_RECEIVED event
    await this.prisma.consultingEvent.create({
      data: {
        type: ConsultingEventType.INQUIRY_RECEIVED,
        leadId: lead.id,
        description: `Lead created from ${dto.source.toLowerCase()} source`,
        actorType: 'user',
        actorId: req.user.id,
      },
    });

    this.logger.log(`Created lead ${lead.id} for ${dto.email}`);
    return lead;
  }

  /**
   * List all leads (superadmin only)
   */
  @Get()
  async listLeads(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('limit') limit?: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can view leads');
    }

    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;

    const leads = await this.prisma.consultingLead.findMany({
      where,
      include: {
        proposals: {
          select: {
            id: true,
            status: true,
            packageType: true,
            totalAmount: true,
          },
        },
        signedDocuments: {
          select: {
            id: true,
            type: true,
            isSigned: true,
          },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit, 10) : 50,
    });

    return leads;
  }

  /**
   * Get a specific lead with full details
   */
  @Get(':id')
  async getLead(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can view leads');
    }

    const lead = await this.prisma.consultingLead.findUnique({
      where: { id },
      include: {
        proposals: {
          orderBy: { createdAt: 'desc' },
        },
        signedDocuments: {
          orderBy: { createdAt: 'desc' },
        },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    return lead;
  }

  /**
   * Update a lead (superadmin only)
   */
  @Patch(':id')
  async updateLead(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can update leads');
    }

    const existing = await this.prisma.consultingLead.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    const updateData: any = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.interestedPackage !== undefined) updateData.interestedPackage = dto.interestedPackage;
    if (dto.calendlyEventUri !== undefined) updateData.calendlyEventUri = dto.calendlyEventUri;
    if (dto.meetingScheduledAt !== undefined) updateData.meetingScheduledAt = new Date(dto.meetingScheduledAt);
    if (dto.meetingCompletedAt !== undefined) updateData.meetingCompletedAt = new Date(dto.meetingCompletedAt);
    if (dto.estimatedValue !== undefined) updateData.estimatedValue = dto.estimatedValue;
    if (dto.lostReason !== undefined) updateData.lostReason = dto.lostReason;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const lead = await this.prisma.consultingLead.update({
      where: { id },
      data: updateData,
    });

    // Log status change event
    if (dto.status && dto.status !== existing.status) {
      await this.prisma.consultingEvent.create({
        data: {
          type: ConsultingEventType.STATUS_CHANGED,
          leadId: id,
          description: `Status changed from ${existing.status} to ${dto.status}`,
          metadata: { previousStatus: existing.status, newStatus: dto.status },
          actorType: 'user',
          actorId: req.user.id,
        },
      });
    }

    this.logger.log(`Updated lead ${id}`);
    return lead;
  }

  /**
   * Convert a lead to an engagement (superadmin only)
   * Creates or uses existing tenant, creates engagement, marks lead as WON
   */
  @Post(':id/convert')
  async convertLead(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ConvertLeadDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can convert leads');
    }

    const lead = await this.prisma.consultingLead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    if (lead.status === LeadStatus.WON) {
      throw new ForbiddenException('Lead has already been converted');
    }

    let tenantId = dto.tenantId;

    // Create new tenant if none provided
    if (!tenantId) {
      const companyName = dto.companyName || lead.company || lead.name;
      const subdomain = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

      const tenant = await this.prisma.tenant.create({
        data: {
          companyName,
          subdomain,
          email: lead.email,
          consultingStatus: 'ACTIVE',
        },
      });

      tenantId = tenant.id;
      this.logger.log(`Created new tenant ${tenantId} for lead conversion`);
    }

    // Calculate expiration (6 months from now)
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 6);

    // Create consulting engagement
    const engagement = await this.prisma.consultingEngagement.create({
      data: {
        tenantId,
        packageType: dto.packageType,
        startDate: new Date(),
        totalHours: dto.totalHours,
        hoursUsed: 0,
        billableHours: 0,
        status: EngagementStatus.ACTIVE,
        notes: `Converted from lead ${id}`,
      },
    });

    // Update lead to WON status
    await this.prisma.consultingLead.update({
      where: { id },
      data: {
        status: LeadStatus.WON,
        tenantId,
        convertedToEngagementId: engagement.id,
        convertedAt: new Date(),
      },
    });

    // Update tenant with consulting fields
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        consultingStatus: 'ACTIVE',
        packageType: dto.packageType,
        hoursRemaining: dto.totalHours,
        hoursUsed: 0,
        packagePurchaseDate: new Date(),
        packageExpirationDate: expirationDate,
      },
    });

    // Log conversion event
    await this.prisma.consultingEvent.create({
      data: {
        type: ConsultingEventType.ENGAGEMENT_STARTED,
        leadId: id,
        engagementId: engagement.id,
        description: `Lead converted to ${dto.packageType} engagement`,
        metadata: {
          packageType: dto.packageType,
          totalHours: dto.totalHours,
          tenantId,
        },
        actorType: 'user',
        actorId: req.user.id,
      },
    });

    this.logger.log(`Converted lead ${id} to engagement ${engagement.id}`);

    return {
      lead: await this.prisma.consultingLead.findUnique({ where: { id } }),
      engagement,
      tenantId,
    };
  }

  /**
   * Find lead by email (useful for Calendly webhook matching)
   */
  @Get('by-email/:email')
  async getLeadByEmail(
    @Request() req: any,
    @Param('email') email: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can search leads');
    }

    const lead = await this.prisma.consultingLead.findFirst({
      where: {
        email: email.toLowerCase(),
        status: { not: LeadStatus.LOST },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return lead; // May be null
  }
}
