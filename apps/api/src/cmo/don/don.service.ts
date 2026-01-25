import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DonService {
  constructor(private prisma: PrismaService) {}

  private getDonPersonality(): string {
    return `You are Don, the Chief Marketing Officer (CMO) AI assistant for Zander. You're a confident, suave marketing executive with old-school advertising wisdom meets modern digital strategy. You speak with conviction, use compelling storytelling, and believe deeply in the power of emotional connection in marketing. Occasionally drop timeless advertising philosophy - think classic Madison Avenue creative director energy.

Your style:
- Direct and insightful, with a certain charm
- You see marketing as both art and science
- You believe every brand has a story worth telling
- You push clients to be bolder, more authentic
- You know that people don't buy products, they buy feelings
- You occasionally reference advertising legends or timeless campaigns

Your expertise spans:
- Brand strategy and positioning
- Storytelling and narrative marketing
- Campaign development and creative direction
- Content marketing and copywriting
- Digital marketing and social media
- Marketing automation and workflows
- Funnel optimization and conversion
- Customer personas and targeting
- Email marketing and nurture sequences

When responding:
- Lead with insight, not platitudes
- Connect marketing tactics to business outcomes
- Challenge weak thinking, encourage bold moves
- Use vivid language and concrete examples
- Reference their actual marketing data to personalize advice
- Keep responses focused and actionable`;
  }

  private async getCampaignsSummary(tenantId: string): Promise<string> {
    const campaigns = await this.prisma.campaign.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    if (campaigns.length === 0) {
      return '- No campaigns created yet';
    }

    const active = campaigns.filter(c => c.status === 'active');
    const draft = campaigns.filter(c => c.status === 'draft');
    const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0);

    let summary = `- ${active.length} active, ${draft.length} drafts`;
    if (active.length > 0) {
      summary += `\n- Active: ${active.slice(0, 3).map(c => `"${c.name}"`).join(', ')}`;
    }
    if (totalBudget > 0) {
      summary += `\n- Total Budget: $${totalBudget.toLocaleString()}`;
    }

    return summary;
  }

  private async getWorkflowsSummary(tenantId: string): Promise<string> {
    const workflows = await this.prisma.workflow.findMany({
      where: { tenantId },
      orderBy: { completionCount: 'desc' },
      take: 10,
    });

    if (workflows.length === 0) {
      return '- No workflows created yet';
    }

    const active = workflows.filter(w => w.status === 'active');
    const draft = workflows.filter(w => w.status === 'draft');

    let summary = `- ${active.length} active, ${draft.length} drafts`;

    const withMetrics = workflows.filter(w => w.entryCount > 0);
    if (withMetrics.length > 0) {
      const topPerformer = withMetrics.sort((a, b) => {
        const rateA = a.completionCount / a.entryCount;
        const rateB = b.completionCount / b.entryCount;
        return rateB - rateA;
      })[0];
      const completionRate = Math.round((topPerformer.completionCount / topPerformer.entryCount) * 100);
      summary += `\n- Top performer: "${topPerformer.name}" (${completionRate}% completion)`;
    }

    return summary;
  }

  private async getFunnelsSummary(tenantId: string): Promise<string> {
    const funnels = await this.prisma.funnel.findMany({
      where: { tenantId },
      include: { stages: { orderBy: { stageOrder: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    if (funnels.length === 0) {
      return '- No funnels set up yet';
    }

    const activeFunnels = funnels.filter(f => f.status === 'active');
    let summary = `- ${funnels.length} funnel${funnels.length !== 1 ? 's' : ''} (${activeFunnels.length} active)`;

    const withConversions = funnels.filter(f => f.totalVisits > 0);
    if (withConversions.length > 0) {
      const best = withConversions.sort((a, b) => {
        const rateA = a.totalConversions / a.totalVisits;
        const rateB = b.totalConversions / b.totalVisits;
        return rateB - rateA;
      })[0];
      const conversionRate = Math.round((best.totalConversions / best.totalVisits) * 100);
      summary += `\n- "${best.name}": ${conversionRate}% conversion (${best.totalVisits.toLocaleString()} visits)`;
    }

    return summary;
  }

  private async getPersonasSummary(tenantId: string): Promise<string> {
    const personas = await this.prisma.persona.findMany({
      where: { tenantId },
      take: 10,
    });

    if (personas.length === 0) {
      return '- No buyer personas defined yet';
    }

    return `- ${personas.length} persona${personas.length !== 1 ? 's' : ''}: ${personas.map(p => `"${p.name}"`).join(', ')}`;
  }

  private async getSegmentsSummary(tenantId: string): Promise<string> {
    const segments = await this.prisma.segment.findMany({
      where: { tenantId },
      orderBy: { contactCount: 'desc' },
      take: 5,
    });

    if (segments.length === 0) {
      return '- No audience segments created yet';
    }

    const totalContacts = segments.reduce((sum, s) => sum + s.contactCount, 0);
    let summary = `- ${segments.length} segment${segments.length !== 1 ? 's' : ''}, ${totalContacts.toLocaleString()} total contacts`;

    const top3 = segments.slice(0, 3);
    if (top3.length > 0) {
      summary += `\n- Largest: ${top3.map(s => `"${s.name}" (${s.contactCount})`).join(', ')}`;
    }

    return summary;
  }

  private async getCurrentTheme(tenantId: string): Promise<string> {
    const now = new Date();
    const theme = await this.prisma.monthlyTheme.findFirst({
      where: {
        tenantId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    });

    if (!theme) {
      return '- No theme set for this month';
    }

    let summary = `- "${theme.name}"`;
    if (theme.focusAreas && theme.focusAreas.length > 0) {
      summary += ` | Focus: ${theme.focusAreas.join(', ')}`;
    }

    return summary;
  }

  private async getBrandProfile(tenantId: string): Promise<string> {
    const brand = await this.prisma.brandProfile.findUnique({
      where: { tenantId },
    });

    if (!brand) {
      return '- No brand profile configured';
    }

    const parts = [];
    if (brand.tagline) parts.push(`Tagline: "${brand.tagline}"`);
    if (brand.voiceTone) parts.push(`Voice: ${brand.voiceTone}`);
    if (brand.mission) parts.push(`Mission: ${brand.mission.substring(0, 80)}${brand.mission.length > 80 ? '...' : ''}`);

    return parts.length > 0 ? `- ${parts.join(' | ')}` : '- Brand profile exists but incomplete';
  }

  private async getContactStats(tenantId: string): Promise<string> {
    const contacts = await this.prisma.contact.findMany({
      where: { tenantId },
      select: { lifecycleStage: true, leadScore: true },
    });

    if (contacts.length === 0) {
      return '- No contacts in the system';
    }

    const byStage: Record<string, number> = {};
    contacts.forEach(c => {
      const stage = c.lifecycleStage || 'subscriber';
      byStage[stage] = (byStage[stage] || 0) + 1;
    });

    const stageSummary = Object.entries(byStage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([stage, count]) => `${stage}: ${count}`)
      .join(', ');

    return `- ${contacts.length} contacts | ${stageSummary}`;
  }

  private async getCalendarSummary(tenantId: string): Promise<string> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await this.prisma.calendarEvent.findMany({
      where: {
        tenantId,
        startTime: { gte: now, lte: nextWeek },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    });

    if (events.length === 0) {
      return '- No upcoming events this week';
    }

    return `- ${events.length} upcoming event${events.length !== 1 ? 's' : ''}: ${events.slice(0, 3).map(e => `"${e.title}"`).join(', ')}`;
  }

  private async queryKnowledge(query: string, limit: number = 3) {
    try {
      const articles = await this.prisma.knowledgeArticle.findMany({
        where: {
          isPublished: true,
          OR: [
            { searchTerms: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { title: true, summary: true, content: true, category: true },
        take: limit,
        orderBy: { viewCount: 'desc' },
      });
      return articles;
    } catch {
      return [];
    }
  }

  private async buildMarketingContext(tenantId: string): Promise<string> {
    const [
      campaigns,
      workflows,
      funnels,
      personas,
      segments,
      currentTheme,
      brandProfile,
      contactStats,
      calendar,
    ] = await Promise.all([
      this.getCampaignsSummary(tenantId),
      this.getWorkflowsSummary(tenantId),
      this.getFunnelsSummary(tenantId),
      this.getPersonasSummary(tenantId),
      this.getSegmentsSummary(tenantId),
      this.getCurrentTheme(tenantId),
      this.getBrandProfile(tenantId),
      this.getContactStats(tenantId),
      this.getCalendarSummary(tenantId),
    ]);

    return `
CURRENT MARKETING DATA:

Campaigns: ${campaigns}
Workflows: ${workflows}
Funnels: ${funnels}
Personas: ${personas}
Segments: ${segments}
This Month's Theme: ${currentTheme}
Brand: ${brandProfile}
Contacts: ${contactStats}
Calendar: ${calendar}`;
  }

  async chat(tenantId: string, message: string, conversationHistory: any[] = []) {
    // Build marketing context from user's actual data
    const marketingContext = await this.buildMarketingContext(tenantId);

    // Query knowledge base for platform help questions
    const knowledgeArticles = await this.queryKnowledge(message);
    const knowledgeContext = knowledgeArticles.length > 0
      ? `\nPLATFORM HELP:\n${knowledgeArticles.map(a => `- ${a.title}: ${a.summary || a.content.substring(0, 200)}`).join('\n')}`
      : '';

    // Build system prompt with personality + context
    const systemPrompt = `${this.getDonPersonality()}

${marketingContext}
${knowledgeContext}

Use this context to personalize your advice. Reference specific campaigns, workflows, or metrics when relevant.`;

    // Build messages array for Claude
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return {
        content: 'AI assistant is not configured. Please contact support.',
        executive: { id: 'cmo', name: 'Don', role: 'Chief Marketing Officer' },
      };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Claude API error:', error);
        throw new Error('Claude API request failed');
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        executive: {
          id: 'cmo',
          name: 'Don',
          role: 'Chief Marketing Officer',
        },
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      return {
        content: 'I encountered an issue processing your request. Please try again.',
        executive: { id: 'cmo', name: 'Don', role: 'Chief Marketing Officer' },
      };
    }
  }
}
