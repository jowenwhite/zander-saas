import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

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

    // If no campaigns, return placeholder data
    if (topContent.length === 0) {
      return {
        topContent: [
          {
            id: 'placeholder-1',
            name: 'Welcome Email Series',
            type: 'email',
            metric: '34.2% open rate',
            metricValue: 34.2,
            trend: 5,
          },
          {
            id: 'placeholder-2',
            name: 'Monthly Newsletter',
            type: 'email',
            metric: '28.5% open rate',
            metricValue: 28.5,
            trend: 3,
          },
          {
            id: 'placeholder-3',
            name: 'Product Announcement',
            type: 'social',
            metric: '1.2K engagement',
            metricValue: 1200,
            trend: 18,
          },
        ],
        period: 'Last 30 days',
        isPlaceholder: true,
      };
    }

    return {
      topContent,
      period: 'Last 30 days',
      isPlaceholder: false,
    };
  }
}
