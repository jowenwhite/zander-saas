import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * D-1: Consulting Briefing Service for Zander
 * Provides daily briefings, pipeline insights, and priority item tracking
 * for the Zander AI to deliver to Jonathan.
 */
@Injectable()
export class ConsultingBriefingService {
  private readonly logger = new Logger(ConsultingBriefingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a comprehensive daily briefing for Zander
   * Includes pipeline status, meetings, contracts, and priority items
   */
  async getDailyBriefing() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const [
      // Pipeline data
      leads,
      activeEngagements,
      pendingContracts,
      // Meeting data
      todaysMeetings,
      upcomingMeetings,
      // Time tracking
      recentTimeEntries,
      // Deliverables
      pendingDeliverables,
      // Events
      recentEvents,
    ] = await Promise.all([
      // Active pipeline leads
      this.prisma.consultingLead.findMany({
        where: { status: { notIn: ['WON', 'LOST'] } },
        orderBy: { updatedAt: 'desc' },
        include: {
          proposals: { select: { id: true, status: true, totalAmount: true } },
          signedDocuments: { where: { isSigned: false }, select: { id: true, type: true } },
        },
      }),
      // Active engagements
      this.prisma.consultingEngagement.findMany({
        where: { status: 'ACTIVE' },
        include: {
          tenant: { select: { companyName: true, email: true } },
          deliverables: { where: { status: { not: 'DELIVERED' } } },
        },
      }),
      // Pending contracts
      this.prisma.signedDocument.findMany({
        where: { isSigned: false },
        include: { lead: { select: { name: true, company: true, email: true } } },
      }),
      // Today's meetings
      this.prisma.consultingLead.findMany({
        where: {
          meetingScheduledAt: { gte: today, lt: tomorrow },
          status: { notIn: ['WON', 'LOST'] },
        },
      }),
      // Upcoming meetings (next 7 days)
      this.prisma.consultingLead.findMany({
        where: {
          meetingScheduledAt: { gte: tomorrow, lte: weekFromNow },
          status: { notIn: ['WON', 'LOST'] },
        },
        orderBy: { meetingScheduledAt: 'asc' },
      }),
      // Time entries last 7 days
      this.prisma.consultingTimeEntry.findMany({
        where: { date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        include: { tenant: { select: { companyName: true } } },
        orderBy: { date: 'desc' },
      }),
      // Pending deliverables
      this.prisma.consultingDeliverable.findMany({
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
        include: {
          tenant: { select: { companyName: true } },
          engagement: { select: { packageType: true } },
        },
      }),
      // Recent events (3 days)
      this.prisma.consultingEvent.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { lead: { select: { name: true, company: true } } },
      }),
    ]);

    // Calculate metrics
    const pipelineValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const leadsByStatusCounts = this.groupLeadsByStatus(leads);
    const newLeads = leads.filter(l => l.status === 'NEW');
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const coldLeads = leads.filter(l =>
      l.status === 'CONTACTED' && new Date(l.updatedAt) < threeDaysAgo
    );
    const lowHoursEngagements = activeEngagements.filter(e =>
      (e.totalHours - e.hoursUsed) < 10
    );
    const billableHours7d = recentTimeEntries.reduce((sum, e) => sum + (e.billableHours || 0), 0);

    // Build priority items
    const priorityItems = this.buildPriorityItems({
      todaysMeetings,
      pendingContracts,
      newLeads,
      coldLeads,
      lowHoursEngagements,
      pendingDeliverables,
    });

    // Build briefing
    return {
      generatedAt: new Date().toISOString(),
      greeting: this.getTimeBasedGreeting(),

      // Summary metrics
      summary: {
        pipelineLeads: leads.length,
        pipelineValue,
        activeEngagements: activeEngagements.length,
        pendingContracts: pendingContracts.length,
        meetingsToday: todaysMeetings.length,
        meetingsThisWeek: upcomingMeetings.length,
        billableHours7d,
      },

      // Priority items needing attention
      priorityItems,

      // Pipeline breakdown
      pipeline: {
        byStatus: leadsByStatusCounts,
        totalValue: pipelineValue,
        averageValue: leads.length > 0 ? Math.round(pipelineValue / leads.length) : 0,
      },

      // Meeting details
      meetings: {
        today: todaysMeetings.map(m => ({
          name: m.name,
          company: m.company,
          email: m.email,
          time: m.meetingScheduledAt,
          package: m.interestedPackage,
        })),
        thisWeek: upcomingMeetings.map(m => ({
          name: m.name,
          company: m.company,
          time: m.meetingScheduledAt,
          package: m.interestedPackage,
        })),
      },

      // Engagement health
      engagements: {
        active: activeEngagements.map(e => ({
          id: e.id,
          company: e.tenant?.companyName,
          package: e.packageType,
          hoursUsed: e.hoursUsed,
          hoursTotal: e.totalHours,
          hoursRemaining: e.totalHours - e.hoursUsed,
          pendingDeliverables: e.deliverables?.length || 0,
        })),
        lowHours: lowHoursEngagements.map(e => ({
          company: e.tenant?.companyName,
          hoursRemaining: e.totalHours - e.hoursUsed,
        })),
      },

      // Contracts
      contracts: {
        pending: pendingContracts.map(d => ({
          type: d.type,
          leadName: d.lead?.name,
          company: d.lead?.company,
          email: d.lead?.email,
          createdAt: d.createdAt,
        })),
      },

      // Deliverables
      deliverables: {
        pending: pendingDeliverables.map(d => ({
          id: d.id,
          name: d.name,
          company: d.tenant?.companyName,
          package: d.engagement?.packageType,
          status: d.status,
        })),
      },

      // Recent activity
      recentActivity: recentEvents.slice(0, 10).map(e => ({
        type: e.type,
        description: e.description,
        lead: e.lead?.name,
        company: e.lead?.company,
        timestamp: e.createdAt,
      })),
    };
  }

  /**
   * Get pipeline insights with trends and recommendations
   */
  async getPipelineInsights() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [currentLeads, last30DaysWon, last60DaysWon, last30DaysLost] = await Promise.all([
      this.prisma.consultingLead.findMany({
        where: { status: { notIn: ['WON', 'LOST'] } },
      }),
      this.prisma.consultingLead.findMany({
        where: {
          status: 'WON',
          updatedAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.consultingLead.findMany({
        where: {
          status: 'WON',
          updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      this.prisma.consultingLead.findMany({
        where: {
          status: 'LOST',
          updatedAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    const pipelineValue = currentLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const wonValue30d = last30DaysWon.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const wonValue60d = last60DaysWon.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

    // Calculate conversion rate
    const totalClosed30d = last30DaysWon.length + last30DaysLost.length;
    const conversionRate = totalClosed30d > 0
      ? Math.round((last30DaysWon.length / totalClosed30d) * 100)
      : 0;

    // Calculate trends
    const wonTrend = wonValue60d > 0
      ? Math.round(((wonValue30d - wonValue60d) / wonValue60d) * 100)
      : wonValue30d > 0 ? 100 : 0;

    // Package interest breakdown
    const packageInterest = this.groupByPackageInterest(currentLeads);

    // Source analysis
    const sourceBreakdown = this.groupBySource(currentLeads);

    return {
      currentPipeline: {
        totalLeads: currentLeads.length,
        totalValue: pipelineValue,
        byStatus: this.groupLeadsByStatus(currentLeads),
      },
      last30Days: {
        won: last30DaysWon.length,
        lost: last30DaysLost.length,
        wonValue: wonValue30d,
        conversionRate,
      },
      trends: {
        revenueDirection: wonTrend > 0 ? 'up' : wonTrend < 0 ? 'down' : 'flat',
        revenueChange: wonTrend,
      },
      packageInterest,
      sourceBreakdown,
      recommendations: this.generatePipelineRecommendations({
        currentLeads,
        conversionRate,
        wonTrend,
      }),
    };
  }

  /**
   * Get current priority items requiring attention
   */
  async getPriorityItems() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const [
      todaysMeetings,
      pendingContracts,
      newLeads,
      coldLeads,
      lowHoursEngagements,
      pendingDeliverables,
    ] = await Promise.all([
      this.prisma.consultingLead.findMany({
        where: {
          meetingScheduledAt: { gte: today, lt: tomorrow },
          status: { notIn: ['WON', 'LOST'] },
        },
      }),
      this.prisma.signedDocument.findMany({
        where: { isSigned: false },
        include: { lead: { select: { name: true, company: true } } },
      }),
      this.prisma.consultingLead.findMany({
        where: { status: 'NEW' },
      }),
      this.prisma.consultingLead.findMany({
        where: {
          status: 'CONTACTED',
          updatedAt: { lt: threeDaysAgo },
        },
      }),
      this.prisma.consultingEngagement.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: { tenant: { select: { companyName: true } } },
      }).then(engagements => engagements.filter(e => (e.totalHours - e.hoursUsed) < 10)),
      this.prisma.consultingDeliverable.findMany({
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
        include: { tenant: { select: { companyName: true } } },
      }),
    ]);

    return this.buildPriorityItems({
      todaysMeetings,
      pendingContracts,
      newLeads,
      coldLeads,
      lowHoursEngagements,
      pendingDeliverables,
    });
  }

  /**
   * Get weekly digest summary
   */
  async getWeeklyDigest() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      newLeadsThisWeek,
      wonThisWeek,
      lostThisWeek,
      meetingsThisWeek,
      timeEntriesThisWeek,
      deliverablesCompleted,
    ] = await Promise.all([
      this.prisma.consultingLead.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      this.prisma.consultingLead.findMany({
        where: { status: 'WON', updatedAt: { gte: weekAgo } },
      }),
      this.prisma.consultingLead.count({
        where: { status: 'LOST', updatedAt: { gte: weekAgo } },
      }),
      this.prisma.consultingEvent.count({
        where: { type: 'MEETING_COMPLETED', createdAt: { gte: weekAgo } },
      }),
      this.prisma.consultingTimeEntry.findMany({
        where: { date: { gte: weekAgo } },
        select: { hours: true, billableHours: true },
      }),
      this.prisma.consultingDeliverable.count({
        where: { status: 'DELIVERED', deliveredAt: { gte: weekAgo } },
      }),
    ]);

    const totalHours = timeEntriesThisWeek.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = timeEntriesThisWeek.reduce((sum, e) => sum + e.billableHours, 0);
    const wonValue = wonThisWeek.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

    return {
      period: {
        start: weekAgo.toISOString(),
        end: new Date().toISOString(),
      },
      leads: {
        new: newLeadsThisWeek,
        won: wonThisWeek.length,
        lost: lostThisWeek,
        wonValue,
      },
      meetings: {
        completed: meetingsThisWeek,
      },
      time: {
        totalHours,
        billableHours,
        utilizationRate: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0,
      },
      deliverables: {
        completed: deliverablesCompleted,
      },
    };
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Jonathan.';
    if (hour < 17) return 'Good afternoon, Jonathan.';
    return 'Good evening, Jonathan.';
  }

  private groupLeadsByStatus(leads: any[]): Record<string, number> {
    return leads.reduce((acc, lead) => {
      const status = lead.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByPackageInterest(leads: any[]): Record<string, number> {
    return leads.reduce((acc, lead) => {
      const pkg = lead.interestedPackage || 'UNDECIDED';
      acc[pkg] = (acc[pkg] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupBySource(leads: any[]): Record<string, number> {
    return leads.reduce((acc, lead) => {
      const source = lead.source || 'UNKNOWN';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private buildPriorityItems(data: {
    todaysMeetings: any[];
    pendingContracts: any[];
    newLeads: any[];
    coldLeads: any[];
    lowHoursEngagements: any[];
    pendingDeliverables: any[];
  }) {
    const items: any[] = [];

    // Priority 1: Meetings today
    if (data.todaysMeetings.length > 0) {
      items.push({
        type: 'MEETING_TODAY',
        priority: 'HIGH',
        count: data.todaysMeetings.length,
        message: `${data.todaysMeetings.length} meeting(s) scheduled today`,
        details: data.todaysMeetings.map(m => ({
          name: m.name,
          company: m.company,
          time: m.meetingScheduledAt,
          package: m.interestedPackage,
        })),
      });
    }

    // Priority 2: Pending contracts
    if (data.pendingContracts.length > 0) {
      items.push({
        type: 'PENDING_CONTRACTS',
        priority: 'HIGH',
        count: data.pendingContracts.length,
        message: `${data.pendingContracts.length} contract(s) awaiting signature`,
        details: data.pendingContracts.map(d => ({
          type: d.type,
          lead: d.lead?.name,
          company: d.lead?.company,
        })),
      });
    }

    // Priority 3: New leads needing follow-up
    if (data.newLeads.length > 0) {
      items.push({
        type: 'NEW_LEADS',
        priority: 'MEDIUM',
        count: data.newLeads.length,
        message: `${data.newLeads.length} new lead(s) need follow-up`,
        details: data.newLeads.map(l => ({
          name: l.name,
          company: l.company,
          estimatedValue: l.estimatedValue,
          createdAt: l.createdAt,
        })),
      });
    }

    // Priority 4: Cold leads
    if (data.coldLeads.length > 0) {
      items.push({
        type: 'COLD_LEADS',
        priority: 'MEDIUM',
        count: data.coldLeads.length,
        message: `${data.coldLeads.length} lead(s) going cold (no activity 3+ days)`,
        details: data.coldLeads.map(l => ({
          name: l.name,
          company: l.company,
          daysSinceUpdate: Math.floor((Date.now() - new Date(l.updatedAt).getTime()) / (24 * 60 * 60 * 1000)),
        })),
      });
    }

    // Priority 5: Engagements with low hours
    if (data.lowHoursEngagements.length > 0) {
      items.push({
        type: 'LOW_HOURS',
        priority: 'MEDIUM',
        count: data.lowHoursEngagements.length,
        message: `${data.lowHoursEngagements.length} engagement(s) running low on hours`,
        details: data.lowHoursEngagements.map(e => ({
          company: e.tenant?.companyName,
          hoursRemaining: e.totalHours - e.hoursUsed,
        })),
      });
    }

    // Priority 6: Pending deliverables
    if (data.pendingDeliverables.length > 0) {
      items.push({
        type: 'PENDING_DELIVERABLES',
        priority: 'LOW',
        count: data.pendingDeliverables.length,
        message: `${data.pendingDeliverables.length} deliverable(s) pending/in-progress`,
        details: data.pendingDeliverables.map(d => ({
          name: d.name,
          company: d.tenant?.companyName,
          status: d.status,
        })),
      });
    }

    return items;
  }

  private generatePipelineRecommendations(data: {
    currentLeads: any[];
    conversionRate: number;
    wonTrend: number;
  }): string[] {
    const recommendations: string[] = [];

    // Check for stale leads
    const staleLeads = data.currentLeads.filter(l => {
      const daysSinceUpdate = (Date.now() - new Date(l.updatedAt).getTime()) / (24 * 60 * 60 * 1000);
      return daysSinceUpdate > 7;
    });
    if (staleLeads.length > 0) {
      recommendations.push(`${staleLeads.length} lead(s) haven't been touched in 7+ days - consider follow-up or close`);
    }

    // Conversion rate feedback
    if (data.conversionRate < 30) {
      recommendations.push('Conversion rate is below 30% - consider reviewing qualification criteria');
    } else if (data.conversionRate > 60) {
      recommendations.push('Strong conversion rate - could be room to increase lead volume');
    }

    // Revenue trend feedback
    if (data.wonTrend < -20) {
      recommendations.push('Revenue trending down significantly - focus on closing existing pipeline');
    } else if (data.wonTrend > 20) {
      recommendations.push('Great momentum - maintain follow-up cadence');
    }

    // Pipeline volume feedback
    if (data.currentLeads.length < 5) {
      recommendations.push('Pipeline is thin - consider increasing lead generation activities');
    }

    return recommendations;
  }
}
