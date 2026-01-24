import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export type RecommendationType = 'insight' | 'action' | 'warning';
export type Priority = 'high' | 'medium' | 'low';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  icon: string;
  title: string;
  description: string;
  actionUrl?: string;
  priority: Priority;
}

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(tenantId: string): Promise<{ recommendations: Recommendation[] }> {
    const recommendations: Recommendation[] = [];

    // Check for inactive workflows
    const draftWorkflows = await this.prisma.workflow.count({
      where: { tenantId, status: 'draft' },
    });
    if (draftWorkflows > 0) {
      recommendations.push({
        id: 'draft-workflows',
        type: 'action',
        icon: '⚡',
        title: `${draftWorkflows} workflow${draftWorkflows > 1 ? 's' : ''} waiting to be activated`,
        description: 'Review and activate your draft workflows to start automating your marketing.',
        actionUrl: '/cmo/workflows',
        priority: 'medium',
      });
    }

    // Check for missing personas
    const personaCount = await this.prisma.persona.count({
      where: { tenantId },
    });
    if (personaCount === 0) {
      recommendations.push({
        id: 'no-personas',
        type: 'action',
        icon: '👥',
        title: 'Create your first buyer persona',
        description: 'Personas help you target your marketing to the right audience. Start by defining your ideal customer.',
        actionUrl: '/cmo/people',
        priority: 'high',
      });
    }

    // Check contact growth
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newContacts = await this.prisma.contact.count({
      where: {
        tenantId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });
    if (newContacts > 10) {
      recommendations.push({
        id: 'contact-growth',
        type: 'insight',
        icon: '📈',
        title: `${newContacts} new contacts this month`,
        description: 'Your lead generation is performing well. Consider creating a nurture sequence to engage these new leads.',
        priority: 'low',
      });
    }

    // Check for active campaigns
    const activeCampaigns = await this.prisma.campaign.count({
      where: { tenantId, status: 'active' },
    });
    if (activeCampaigns === 0) {
      recommendations.push({
        id: 'no-campaigns',
        type: 'action',
        icon: '📣',
        title: 'Launch your first marketing campaign',
        description: 'Campaigns help you coordinate your marketing efforts across channels.',
        actionUrl: '/cmo/workflows',
        priority: 'high',
      });
    }

    // Check funnel setup
    const funnelCount = await this.prisma.funnel.count({
      where: { tenantId },
    });
    if (funnelCount === 0) {
      recommendations.push({
        id: 'no-funnels',
        type: 'action',
        icon: '🎯',
        title: 'Set up your marketing funnel',
        description: 'Define your customer journey stages to track conversions from visitor to customer.',
        actionUrl: '/cmo/funnels',
        priority: 'medium',
      });
    }

    // Always include a positive insight if we have few recommendations
    if (recommendations.length < 2) {
      recommendations.push({
        id: 'getting-started',
        type: 'insight',
        icon: '💡',
        title: 'Welcome to your Marketing Command Center',
        description: 'Use the quick actions to start creating campaigns, schedules, and automations.',
        priority: 'low',
      });
    }

    // Sort by priority
    const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return { recommendations: recommendations.slice(0, 3) };
  }
}
