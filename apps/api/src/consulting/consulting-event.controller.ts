import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('consulting/events')
@UseGuards(JwtAuthGuard)
export class ConsultingEventController {
  private readonly logger = new Logger(ConsultingEventController.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a consulting event (for manual notes, status changes, etc.)
   * Superadmin only
   */
  @Post()
  async createEvent(
    @Request() req: any,
    @Body() dto: CreateEventDto,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can create events');
    }

    const event = await this.prisma.consultingEvent.create({
      data: {
        type: dto.type,
        leadId: dto.leadId,
        engagementId: dto.engagementId,
        description: dto.description,
        metadata: dto.metadata,
        actorType: dto.actorType || 'user',
        actorId: dto.actorId || req.user.id,
      },
    });

    this.logger.log(`Created event ${event.id}: ${dto.type}`);
    return event;
  }

  /**
   * List events (filtered by lead, engagement, or type)
   */
  @Get()
  async listEvents(
    @Request() req: any,
    @Query('leadId') leadId?: string,
    @Query('engagementId') engagementId?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can list events');
    }

    const where: any = {};
    if (leadId) where.leadId = leadId;
    if (engagementId) where.engagementId = engagementId;
    if (type) where.type = type;

    const events = await this.prisma.consultingEvent.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit, 10) : 50,
    });

    return events;
  }

  /**
   * Get recent events for Zander briefing
   * Returns the most recent consulting activity across all leads/engagements
   */
  @Get('recent')
  async getRecentEvents(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('days') days?: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can view recent events');
    }

    const daysBack = days ? parseInt(days, 10) : 7;
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const events = await this.prisma.consultingEvent.findMany({
      where: {
        createdAt: { gte: since },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            status: true,
            interestedPackage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit, 10) : 20,
    });

    // Group by type for summary
    const summary = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      events,
      summary,
      period: {
        since: since.toISOString(),
        daysBack,
      },
    };
  }

  /**
   * Get event timeline for a specific lead
   * Formatted for display in UI
   */
  @Get('timeline/:leadId')
  async getLeadTimeline(
    @Request() req: any,
    @Query('leadId') leadId: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can view timelines');
    }

    const events = await this.prisma.consultingEvent.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });

    // Format for timeline display
    const timeline = events.map(event => ({
      id: event.id,
      type: event.type,
      description: event.description,
      timestamp: event.createdAt,
      metadata: event.metadata,
      actor: event.actorType,
    }));

    return timeline;
  }

  /**
   * Get consulting activity stats for dashboard
   */
  @Get('stats')
  async getEventStats(
    @Request() req: any,
    @Query('days') days?: string,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only superadmins can view stats');
    }

    const daysBack = days ? parseInt(days, 10) : 30;
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    // Get lead counts by status
    const leadsByStatus = await this.prisma.consultingLead.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Get recent events count by type
    const eventsByType = await this.prisma.consultingEvent.groupBy({
      by: ['type'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
    });

    // Get new leads in period
    const newLeads = await this.prisma.consultingLead.count({
      where: { createdAt: { gte: since } },
    });

    // Get conversions in period
    const conversions = await this.prisma.consultingLead.count({
      where: {
        status: 'WON',
        convertedAt: { gte: since },
      },
    });

    return {
      period: { since: since.toISOString(), daysBack },
      leads: {
        byStatus: leadsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        newInPeriod: newLeads,
        conversionsInPeriod: conversions,
      },
      events: {
        byType: eventsByType.reduce((acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }
}
