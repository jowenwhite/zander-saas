import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HeadwindPriority, TicketStatus } from '@prisma/client';

export type SLAStatus = 'on_track' | 'at_risk' | 'breached';

export interface SLAInfo {
  firstResponse: {
    targetHours: number;
    elapsedHours: number;
    remainingHours: number;
    status: SLAStatus;
    respondedAt: Date | null;
    breached: boolean;
  };
  resolution: {
    targetHours: number;
    elapsedHours: number;
    remainingHours: number;
    status: SLAStatus;
    resolvedAt: Date | null;
    breached: boolean;
  };
  overallStatus: SLAStatus;
}

export interface SLAStats {
  total: number;
  onTrack: number;
  atRisk: number;
  breached: number;
  avgFirstResponseTime: number | null;
  avgResolutionTime: number | null;
  firstResponseBreachRate: number;
  resolutionBreachRate: number;
}

@Injectable()
export class TicketSLAService {
  private readonly logger = new Logger(TicketSLAService.name);

  // Default SLA targets by priority (in hours)
  private readonly DEFAULT_SLA_BY_PRIORITY: Record<HeadwindPriority, { firstResponse: number; resolution: number }> = {
    P1: { firstResponse: 4, resolution: 24 },     // High: 4hr response, 24hr resolution
    P2: { firstResponse: 8, resolution: 48 },     // Medium: 8hr response, 48hr resolution
    P3: { firstResponse: 24, resolution: 72 },    // Low: 24hr response, 72hr resolution
  };

  // At-risk threshold: warn when X% of SLA time has elapsed
  private readonly AT_RISK_THRESHOLD = 0.75; // 75%

  constructor(private prisma: PrismaService) {}

  /**
   * Get default SLA targets based on ticket priority
   */
  getDefaultSLA(priority: HeadwindPriority): { firstResponse: number; resolution: number } {
    return this.DEFAULT_SLA_BY_PRIORITY[priority] || this.DEFAULT_SLA_BY_PRIORITY.P3;
  }

  /**
   * Calculate SLA info for a ticket
   */
  calculateSLAInfo(ticket: {
    createdAt: Date;
    firstResponseAt: Date | null;
    firstResponseSLA: number | null;
    resolvedAt: Date | null;
    resolutionSLA: number | null;
    priority: HeadwindPriority;
    status: TicketStatus;
  }): SLAInfo {
    const now = new Date();
    const createdAt = new Date(ticket.createdAt);

    // Get SLA targets (use ticket-specific or default based on priority)
    const defaultSLA = this.getDefaultSLA(ticket.priority);
    const firstResponseTargetHours = ticket.firstResponseSLA ?? defaultSLA.firstResponse;
    const resolutionTargetHours = ticket.resolutionSLA ?? defaultSLA.resolution;

    // Calculate first response SLA
    const firstResponseInfo = this.calculateFirstResponseSLA(
      createdAt,
      ticket.firstResponseAt,
      firstResponseTargetHours,
      now
    );

    // Calculate resolution SLA
    const resolutionInfo = this.calculateResolutionSLA(
      createdAt,
      ticket.resolvedAt,
      resolutionTargetHours,
      ticket.status,
      now
    );

    // Overall status is the worst of the two
    const overallStatus = this.getWorstStatus(firstResponseInfo.status, resolutionInfo.status);

    return {
      firstResponse: firstResponseInfo,
      resolution: resolutionInfo,
      overallStatus,
    };
  }

  private calculateFirstResponseSLA(
    createdAt: Date,
    firstResponseAt: Date | null,
    targetHours: number,
    now: Date
  ): SLAInfo['firstResponse'] {
    const targetMs = targetHours * 60 * 60 * 1000;
    const deadlineTime = createdAt.getTime() + targetMs;

    if (firstResponseAt) {
      // Already responded
      const responseTime = new Date(firstResponseAt);
      const elapsedMs = responseTime.getTime() - createdAt.getTime();
      const elapsedHours = elapsedMs / (60 * 60 * 1000);
      const breached = responseTime.getTime() > deadlineTime;

      return {
        targetHours,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        remainingHours: 0,
        status: breached ? 'breached' : 'on_track',
        respondedAt: responseTime,
        breached,
      };
    }

    // Not yet responded
    const elapsedMs = now.getTime() - createdAt.getTime();
    const elapsedHours = elapsedMs / (60 * 60 * 1000);
    const remainingMs = deadlineTime - now.getTime();
    const remainingHours = Math.max(0, remainingMs / (60 * 60 * 1000));

    let status: SLAStatus = 'on_track';
    if (remainingMs <= 0) {
      status = 'breached';
    } else if (elapsedMs / targetMs >= this.AT_RISK_THRESHOLD) {
      status = 'at_risk';
    }

    return {
      targetHours,
      elapsedHours: Math.round(elapsedHours * 10) / 10,
      remainingHours: Math.round(remainingHours * 10) / 10,
      status,
      respondedAt: null,
      breached: status === 'breached',
    };
  }

  private calculateResolutionSLA(
    createdAt: Date,
    resolvedAt: Date | null,
    targetHours: number,
    status: TicketStatus,
    now: Date
  ): SLAInfo['resolution'] {
    const targetMs = targetHours * 60 * 60 * 1000;
    const deadlineTime = createdAt.getTime() + targetMs;

    // If ticket is resolved or closed
    if (resolvedAt || status === 'RESOLVED' || status === 'CLOSED') {
      const resolutionTime = resolvedAt ? new Date(resolvedAt) : now;
      const elapsedMs = resolutionTime.getTime() - createdAt.getTime();
      const elapsedHours = elapsedMs / (60 * 60 * 1000);
      const breached = resolutionTime.getTime() > deadlineTime;

      return {
        targetHours,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        remainingHours: 0,
        status: breached ? 'breached' : 'on_track',
        resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
        breached,
      };
    }

    // Not yet resolved
    const elapsedMs = now.getTime() - createdAt.getTime();
    const elapsedHours = elapsedMs / (60 * 60 * 1000);
    const remainingMs = deadlineTime - now.getTime();
    const remainingHours = Math.max(0, remainingMs / (60 * 60 * 1000));

    let slaStatus: SLAStatus = 'on_track';
    if (remainingMs <= 0) {
      slaStatus = 'breached';
    } else if (elapsedMs / targetMs >= this.AT_RISK_THRESHOLD) {
      slaStatus = 'at_risk';
    }

    return {
      targetHours,
      elapsedHours: Math.round(elapsedHours * 10) / 10,
      remainingHours: Math.round(remainingHours * 10) / 10,
      status: slaStatus,
      resolvedAt: null,
      breached: slaStatus === 'breached',
    };
  }

  private getWorstStatus(status1: SLAStatus, status2: SLAStatus): SLAStatus {
    const priority: Record<SLAStatus, number> = {
      breached: 3,
      at_risk: 2,
      on_track: 1,
    };
    return priority[status1] >= priority[status2] ? status1 : status2;
  }

  /**
   * Get SLA statistics for a tenant or all tickets
   */
  async getSLAStats(tenantId?: string): Promise<SLAStats> {
    const where = tenantId ? { tenantId } : {};

    const tickets = await this.prisma.supportTicket.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        firstResponseAt: true,
        firstResponseSLA: true,
        resolvedAt: true,
        resolutionSLA: true,
        priority: true,
        status: true,
      },
    });

    if (tickets.length === 0) {
      return {
        total: 0,
        onTrack: 0,
        atRisk: 0,
        breached: 0,
        avgFirstResponseTime: null,
        avgResolutionTime: null,
        firstResponseBreachRate: 0,
        resolutionBreachRate: 0,
      };
    }

    let onTrack = 0;
    let atRisk = 0;
    let breached = 0;
    let firstResponseBreaches = 0;
    let resolutionBreaches = 0;
    let totalFirstResponseTime = 0;
    let firstResponseCount = 0;
    let totalResolutionTime = 0;
    let resolutionCount = 0;

    for (const ticket of tickets) {
      const slaInfo = this.calculateSLAInfo(ticket);

      // Count by overall status
      switch (slaInfo.overallStatus) {
        case 'on_track':
          onTrack++;
          break;
        case 'at_risk':
          atRisk++;
          break;
        case 'breached':
          breached++;
          break;
      }

      // Track breaches
      if (slaInfo.firstResponse.breached) {
        firstResponseBreaches++;
      }
      if (slaInfo.resolution.breached) {
        resolutionBreaches++;
      }

      // Calculate averages for responded/resolved tickets
      if (ticket.firstResponseAt) {
        totalFirstResponseTime += slaInfo.firstResponse.elapsedHours;
        firstResponseCount++;
      }
      if (ticket.resolvedAt) {
        totalResolutionTime += slaInfo.resolution.elapsedHours;
        resolutionCount++;
      }
    }

    return {
      total: tickets.length,
      onTrack,
      atRisk,
      breached,
      avgFirstResponseTime: firstResponseCount > 0
        ? Math.round((totalFirstResponseTime / firstResponseCount) * 10) / 10
        : null,
      avgResolutionTime: resolutionCount > 0
        ? Math.round((totalResolutionTime / resolutionCount) * 10) / 10
        : null,
      firstResponseBreachRate: Math.round((firstResponseBreaches / tickets.length) * 100),
      resolutionBreachRate: Math.round((resolutionBreaches / tickets.length) * 100),
    };
  }

  /**
   * Get tickets that are at risk or breached (for alerts)
   */
  async getAtRiskTickets(tenantId?: string): Promise<Array<{
    id: string;
    ticketNumber: string;
    subject: string;
    priority: HeadwindPriority;
    status: TicketStatus;
    slaInfo: SLAInfo;
  }>> {
    const where: any = {
      status: {
        notIn: ['RESOLVED', 'CLOSED'],
      },
    };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const tickets = await this.prisma.supportTicket.findMany({
      where,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        createdAt: true,
        firstResponseAt: true,
        firstResponseSLA: true,
        resolvedAt: true,
        resolutionSLA: true,
        priority: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const atRiskTickets: Array<{
      id: string;
      ticketNumber: string;
      subject: string;
      priority: HeadwindPriority;
      status: TicketStatus;
      slaInfo: SLAInfo;
    }> = [];

    for (const ticket of tickets) {
      const slaInfo = this.calculateSLAInfo(ticket);
      if (slaInfo.overallStatus === 'at_risk' || slaInfo.overallStatus === 'breached') {
        atRiskTickets.push({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          priority: ticket.priority,
          status: ticket.status,
          slaInfo,
        });
      }
    }

    // Sort by status (breached first) then by remaining time
    atRiskTickets.sort((a, b) => {
      if (a.slaInfo.overallStatus === 'breached' && b.slaInfo.overallStatus !== 'breached') return -1;
      if (b.slaInfo.overallStatus === 'breached' && a.slaInfo.overallStatus !== 'breached') return 1;
      return a.slaInfo.resolution.remainingHours - b.slaInfo.resolution.remainingHours;
    });

    return atRiskTickets;
  }

  /**
   * Record first response for a ticket
   */
  async recordFirstResponse(ticketId: string): Promise<void> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { firstResponseAt: true },
    });

    // Only set first response if not already set
    if (!ticket?.firstResponseAt) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { firstResponseAt: new Date() },
      });
      this.logger.log(`First response recorded for ticket ${ticketId}`);
    }
  }
}
