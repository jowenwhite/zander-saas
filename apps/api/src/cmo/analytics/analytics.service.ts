import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive analytics overview with real database counts
   */
  async getOverview(tenantId: string, dateRange: '7d' | '30d' | '90d' = '30d') {
    const now = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[dateRange];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for better performance
    const [
      totalCampaigns,
      activeCampaigns,
      totalContacts,
      contactsThisMonth,
      totalSocialPosts,
      emailStats,
      campaigns,
      funnels,
      emailsByWeek,
    ] = await Promise.all([
      // Campaign counts
      this.prisma.campaign.count({ where: { tenantId } }),
      this.prisma.campaign.count({ where: { tenantId, status: 'active' } }),

      // Contact counts
      this.prisma.contact.count({ where: { tenantId } }),
      this.prisma.contact.count({
        where: { tenantId, createdAt: { gte: monthStart } },
      }),

      // Social post count
      this.prisma.socialPost.count({ where: { tenantId } }),

      // Email stats (sent and opened)
      this.prisma.emailMessage.aggregate({
        where: { tenantId, sentAt: { gte: startDate } },
        _count: { id: true },
      }).then(async (sent) => {
        const opened = await this.prisma.emailMessage.count({
          where: { tenantId, sentAt: { gte: startDate }, openedAt: { not: null } },
        });
        return { sent: sent._count.id, opened };
      }),

      // Campaigns with enrollment counts
      this.prisma.campaign.findMany({
        where: { tenantId },
        include: {
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Funnels with stages
      this.prisma.funnel.findMany({
        where: { tenantId },
        include: {
          stages: {
            orderBy: { stageOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Emails grouped by week for the chart
      this.getEmailsByWeek(tenantId, startDate),
    ]);

    // Calculate email metrics
    const avgOpenRate = emailStats.sent > 0 ? (emailStats.opened / emailStats.sent) * 100 : null;

    // Build campaign metrics with real data
    const campaignMetrics = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      businessUnit: c.businessUnit,
      enrollments: c._count.enrollments,
      // These would come from email tracking - return null if no data
      sent: null as number | null,
      openRate: null as number | null,
      clickRate: null as number | null,
      conversionRate: null as number | null,
    }));

    // Build funnel metrics with real stage data
    const funnelMetrics = funnels.map((f) => ({
      id: f.id,
      name: f.name,
      status: f.status,
      totalVisits: f.totalVisits,
      totalConversions: f.totalConversions,
      conversionRate: f.totalVisits > 0 ? (f.totalConversions / f.totalVisits) * 100 : 0,
      stages: f.stages.map((s, i, arr) => ({
        name: s.name,
        entryCount: s.entryCount,
        exitCount: s.exitCount,
        dropoffRate:
          i < arr.length - 1 && s.entryCount > 0
            ? ((s.entryCount - (arr[i + 1]?.entryCount || 0)) / s.entryCount) * 100
            : 0,
      })),
    }));

    return {
      overview: {
        totalCampaigns,
        activeCampaigns,
        totalContacts,
        contactsThisMonth,
        emailsSent: emailStats.sent,
        emailsOpened: emailStats.opened,
        avgOpenRate,
        avgClickRate: null, // No click tracking in current schema
        totalSocialPosts,
        totalConversions: funnels.reduce((sum, f) => sum + f.totalConversions, 0),
      },
      campaigns: campaignMetrics,
      funnels: funnelMetrics,
      emailPerformance: emailsByWeek,
      dateRange,
      hasData: {
        campaigns: totalCampaigns > 0,
        contacts: totalContacts > 0,
        emails: emailStats.sent > 0,
        funnels: funnels.length > 0,
        socialPosts: totalSocialPosts > 0,
      },
    };
  }

  /**
   * Get email counts grouped by week for chart display
   */
  private async getEmailsByWeek(tenantId: string, startDate: Date) {
    const emails = await this.prisma.emailMessage.findMany({
      where: { tenantId, sentAt: { gte: startDate } },
      select: { sentAt: true, openedAt: true },
      orderBy: { sentAt: 'asc' },
    });

    if (emails.length === 0) {
      return [];
    }

    // Group by week
    const weekMap = new Map<string, { sent: number; opened: number; clicked: number }>();

    emails.forEach((email) => {
      const weekStart = this.getWeekStart(email.sentAt);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { sent: 0, opened: 0, clicked: 0 });
      }

      const week = weekMap.get(weekKey)!;
      week.sent++;
      if (email.openedAt) week.opened++;
      // No click tracking in current schema
    });

    // Convert to array with readable labels
    const weeks = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-4) // Last 4 weeks
      .map(([, data], i) => ({
        period: `Week ${i + 1}`,
        ...data,
      }));

    return weeks;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get detailed email performance analytics
   */
  async getEmailAnalytics(tenantId: string, dateRange: '7d' | '30d' | '90d' = '30d') {
    const now = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[dateRange];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get all email counts by status
    const [
      totalSent,
      deliveredCount,
      openedCount,
      bouncedCount,
      complainedCount,
      delayedCount,
      dailyTrend,
      topEmails,
    ] = await Promise.all([
      // Total sent
      this.prisma.emailMessage.count({
        where: { tenantId, sentAt: { gte: startDate }, direction: 'outbound' },
      }),

      // Delivered (status = delivered or opened means delivered)
      this.prisma.emailMessage.count({
        where: {
          tenantId,
          sentAt: { gte: startDate },
          direction: 'outbound',
          status: { in: ['delivered', 'opened'] },
        },
      }),

      // Opened
      this.prisma.emailMessage.count({
        where: {
          tenantId,
          sentAt: { gte: startDate },
          direction: 'outbound',
          openedAt: { not: null },
        },
      }),

      // Bounced
      this.prisma.emailMessage.count({
        where: {
          tenantId,
          sentAt: { gte: startDate },
          direction: 'outbound',
          status: 'bounced',
        },
      }),

      // Complained (spam)
      this.prisma.emailMessage.count({
        where: {
          tenantId,
          sentAt: { gte: startDate },
          direction: 'outbound',
          status: 'complained',
        },
      }),

      // Delayed
      this.prisma.emailMessage.count({
        where: {
          tenantId,
          sentAt: { gte: startDate },
          direction: 'outbound',
          status: 'delayed',
        },
      }),

      // Daily trend
      this.getEmailDailyTrend(tenantId, startDate),

      // Top performing emails by subject (open rate)
      this.getTopPerformingEmails(tenantId, startDate),
    ]);

    // Calculate rates
    const deliveryRate = totalSent > 0 ? (deliveredCount / totalSent) * 100 : 0;
    const openRate = deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
    const bounceRate = totalSent > 0 ? (bouncedCount / totalSent) * 100 : 0;
    const complaintRate = totalSent > 0 ? (complainedCount / totalSent) * 100 : 0;

    return {
      summary: {
        totalSent,
        delivered: deliveredCount,
        opened: openedCount,
        bounced: bouncedCount,
        complained: complainedCount,
        delayed: delayedCount,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
        openRate: Math.round(openRate * 10) / 10,
        bounceRate: Math.round(bounceRate * 10) / 10,
        complaintRate: Math.round(complaintRate * 100) / 100, // More precision for complaints
      },
      trend: dailyTrend,
      topEmails,
      dateRange,
      hasData: totalSent > 0,
    };
  }

  /**
   * Get email stats grouped by day for trend chart
   */
  private async getEmailDailyTrend(tenantId: string, startDate: Date) {
    const emails = await this.prisma.emailMessage.findMany({
      where: {
        tenantId,
        sentAt: { gte: startDate },
        direction: 'outbound',
      },
      select: {
        sentAt: true,
        status: true,
        openedAt: true,
      },
      orderBy: { sentAt: 'asc' },
    });

    if (emails.length === 0) {
      return [];
    }

    // Group by day
    const dayMap = new Map<string, { sent: number; delivered: number; opened: number; bounced: number }>();

    emails.forEach((email) => {
      const dayKey = email.sentAt.toISOString().split('T')[0];

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, { sent: 0, delivered: 0, opened: 0, bounced: 0 });
      }

      const day = dayMap.get(dayKey)!;
      day.sent++;
      if (email.status === 'delivered' || email.status === 'opened' || email.openedAt) {
        day.delivered++;
      }
      if (email.openedAt) {
        day.opened++;
      }
      if (email.status === 'bounced') {
        day.bounced++;
      }
    });

    // Convert to array
    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        ...data,
        openRate: data.delivered > 0 ? Math.round((data.opened / data.delivered) * 1000) / 10 : 0,
      }));
  }

  /**
   * Get top performing emails by open rate
   */
  private async getTopPerformingEmails(tenantId: string, startDate: Date) {
    // Group emails by subject
    const emails = await this.prisma.emailMessage.groupBy({
      by: ['subject'],
      where: {
        tenantId,
        sentAt: { gte: startDate },
        direction: 'outbound',
      },
      _count: { id: true },
    });

    if (emails.length === 0) {
      return [];
    }

    // Get open counts per subject
    const results = await Promise.all(
      emails.map(async (email) => {
        const [delivered, opened] = await Promise.all([
          this.prisma.emailMessage.count({
            where: {
              tenantId,
              sentAt: { gte: startDate },
              direction: 'outbound',
              subject: email.subject,
              status: { in: ['delivered', 'opened'] },
            },
          }),
          this.prisma.emailMessage.count({
            where: {
              tenantId,
              sentAt: { gte: startDate },
              direction: 'outbound',
              subject: email.subject,
              openedAt: { not: null },
            },
          }),
        ]);

        return {
          subject: email.subject,
          sent: email._count.id,
          delivered,
          opened,
          openRate: delivered > 0 ? Math.round((opened / delivered) * 1000) / 10 : 0,
        };
      })
    );

    // Sort by open rate then by sent count
    return results
      .filter((r) => r.sent >= 3) // Only show subjects with at least 3 sends
      .sort((a, b) => {
        if (b.openRate !== a.openRate) return b.openRate - a.openRate;
        return b.sent - a.sent;
      })
      .slice(0, 10);
  }

  async getTopContent(tenantId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get top performing campaigns by enrollment
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        tenantId,
        status: { in: ['active', 'completed'] },
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get email stats per campaign
    const emailStats = await this.prisma.emailMessage.groupBy({
      by: ['subject'],
      where: {
        tenantId,
        sentAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    });

    // Build top content list
    const topContent = campaigns
      .filter((c) => c._count.enrollments > 0)
      .slice(0, 5)
      .map((campaign, index) => ({
        id: campaign.id,
        name: campaign.name,
        type: 'campaign' as const,
        metric: `${campaign._count.enrollments} enrolled`,
        metricValue: campaign._count.enrollments,
        trend: index === 0 ? 12 : index === 1 ? 8 : 5, // Placeholder trends
      }));

    return {
      topContent,
      period: 'Last 30 days',
      hasData: topContent.length > 0,
    };
  }
}
