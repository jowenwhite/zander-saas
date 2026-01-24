import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get new leads (contacts created in last 30 days)
    const [currentLeads, previousLeads] = await Promise.all([
      this.prisma.contact.count({
        where: {
          tenantId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.contact.count({
        where: {
          tenantId,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
    ]);

    const leadsTrend = previousLeads > 0
      ? Math.round(((currentLeads - previousLeads) / previousLeads) * 100)
      : currentLeads > 0 ? 100 : 0;

    // Get email metrics
    const [totalSent, totalOpened] = await Promise.all([
      this.prisma.emailMessage.count({
        where: {
          tenantId,
          status: { in: ['sent', 'delivered', 'opened', 'clicked'] },
          sentAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.emailMessage.count({
        where: {
          tenantId,
          status: { in: ['opened', 'clicked'] },
          sentAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    const emailOpenRate = totalSent > 0
      ? Math.round((totalOpened / totalSent) * 1000) / 10
      : 0;

    // Get funnel conversion rate
    const [funnelEnrollments, funnelCompletions] = await Promise.all([
      this.prisma.campaignEnrollment.count({
        where: {
          campaign: { tenantId },
          enrolledAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.campaignEnrollment.count({
        where: {
          campaign: { tenantId },
          status: 'completed',
          completedAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    const conversionRate = funnelEnrollments > 0
      ? Math.round((funnelCompletions / funnelEnrollments) * 1000) / 10
      : 0;

    // Get pipeline value (active deals)
    const pipelineDeals = await this.prisma.deal.findMany({
      where: {
        tenantId,
        stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] },
      },
      select: { dealValue: true },
    });

    const pipelineValue = pipelineDeals.reduce(
      (sum, deal) => sum + (deal.dealValue || 0),
      0,
    );

    // Get active workflows count
    const activeWorkflows = await this.prisma.workflow.count({
      where: {
        tenantId,
        status: 'active',
      },
    });

    // Get active campaigns count
    const activeCampaigns = await this.prisma.campaign.count({
      where: {
        tenantId,
        status: 'active',
      },
    });

    return {
      newLeads: {
        count: currentLeads,
        trend: leadsTrend,
        trendUp: leadsTrend >= 0,
        trendPeriod: 'month',
        detail: 'This month',
      },
      emailOpenRate: {
        rate: emailOpenRate,
        trend: 5, // Placeholder - would need historical comparison
        trendUp: true,
        industryAvg: 21.5,
        detail: emailOpenRate > 21.5 ? 'Above industry avg' : 'Below industry avg',
      },
      conversionRate: {
        rate: conversionRate,
        trend: 0.3, // Placeholder
        trendUp: true,
        detail: 'Last 30 days',
      },
      pipelineValue: {
        amount: pipelineValue,
        trend: 8, // Placeholder
        trendUp: true,
        dealCount: pipelineDeals.length,
        detail: `${pipelineDeals.length} active deals`,
      },
      summary: {
        activeWorkflows,
        activeCampaigns,
        totalContacts: await this.prisma.contact.count({ where: { tenantId } }),
      },
    };
  }
}
