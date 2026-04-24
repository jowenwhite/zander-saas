import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get new leads (contacts created in last 30 days) with real trend
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

    // Get email metrics with real trend calculation
    const [
      currentSent,
      currentOpened,
      previousSent,
      previousOpened,
    ] = await Promise.all([
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
      this.prisma.emailMessage.count({
        where: {
          tenantId,
          status: { in: ['sent', 'delivered', 'opened', 'clicked'] },
          sentAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      this.prisma.emailMessage.count({
        where: {
          tenantId,
          status: { in: ['opened', 'clicked'] },
          sentAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
    ]);

    const currentEmailOpenRate = currentSent > 0
      ? Math.round((currentOpened / currentSent) * 1000) / 10
      : 0;
    const previousEmailOpenRate = previousSent > 0
      ? Math.round((previousOpened / previousSent) * 1000) / 10
      : 0;

    // Real email trend (difference in open rate)
    const emailTrend = previousEmailOpenRate > 0
      ? Math.round((currentEmailOpenRate - previousEmailOpenRate) * 10) / 10
      : 0;

    // Get funnel conversion rate with real trend
    const [
      currentEnrollments,
      currentCompletions,
      previousEnrollments,
      previousCompletions,
    ] = await Promise.all([
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
      this.prisma.campaignEnrollment.count({
        where: {
          campaign: { tenantId },
          enrolledAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      this.prisma.campaignEnrollment.count({
        where: {
          campaign: { tenantId },
          status: 'completed',
          completedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
    ]);

    const currentConversionRate = currentEnrollments > 0
      ? Math.round((currentCompletions / currentEnrollments) * 1000) / 10
      : 0;
    const previousConversionRate = previousEnrollments > 0
      ? Math.round((previousCompletions / previousEnrollments) * 1000) / 10
      : 0;

    // Real conversion trend (difference in conversion rate)
    const conversionTrend = previousConversionRate > 0
      ? Math.round((currentConversionRate - previousConversionRate) * 10) / 10
      : 0;

    // Get pipeline value (active deals) with real trend
    const [currentDeals, previousDeals] = await Promise.all([
      this.prisma.deal.findMany({
        where: {
          tenantId,
          stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] },
        },
        select: { dealValue: true },
      }),
      // Previous period: deals that were active 30 days ago (approximation)
      this.prisma.deal.findMany({
        where: {
          tenantId,
          createdAt: { lt: thirtyDaysAgo },
          OR: [
            { stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } },
            { updatedAt: { gte: thirtyDaysAgo } }, // Closed recently, so was active before
          ],
        },
        select: { dealValue: true },
      }),
    ]);

    const currentPipelineValue = currentDeals.reduce(
      (sum, deal) => sum + (deal.dealValue || 0),
      0,
    );
    const previousPipelineValue = previousDeals.reduce(
      (sum, deal) => sum + (deal.dealValue || 0),
      0,
    );

    // Real pipeline trend
    const pipelineTrend = previousPipelineValue > 0
      ? Math.round(((currentPipelineValue - previousPipelineValue) / previousPipelineValue) * 100)
      : currentPipelineValue > 0 ? 100 : 0;

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
        rate: currentEmailOpenRate,
        trend: emailTrend,
        trendUp: emailTrend >= 0,
        industryAvg: 21.5,
        detail: currentEmailOpenRate > 21.5 ? 'Above industry avg' : currentSent > 0 ? 'Below industry avg' : 'No emails sent',
      },
      conversionRate: {
        rate: currentConversionRate,
        trend: conversionTrend,
        trendUp: conversionTrend >= 0,
        detail: currentEnrollments > 0 ? 'Last 30 days' : 'No enrollments',
      },
      pipelineValue: {
        amount: currentPipelineValue,
        trend: pipelineTrend,
        trendUp: pipelineTrend >= 0,
        dealCount: currentDeals.length,
        detail: currentDeals.length > 0 ? `${currentDeals.length} active deals` : 'No active deals',
      },
      summary: {
        activeWorkflows,
        activeCampaigns,
        totalContacts: await this.prisma.contact.count({ where: { tenantId } }),
      },
    };
  }
}
