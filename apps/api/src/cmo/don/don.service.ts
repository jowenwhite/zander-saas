import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MeetingIntelligenceService } from '../../meeting-intelligence/meeting-intelligence.service';

// Don (CMO) meeting tools - 3 tools (no process_meeting_recording, that's EA/CRO territory)
const DON_MEETING_TOOLS = [
  {
    name: 'get_meeting_recordings',
    description: 'List recent meeting recordings for this business with transcription and summary status. Useful for finding marketing-related discussions.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of meetings to return (default 5, max 20)' },
        engagementId: { type: 'string', description: 'Filter by consulting engagement ID' },
        dateFrom: { type: 'string', description: 'Filter meetings from this date (ISO format)' },
        dateTo: { type: 'string', description: 'Filter meetings until this date (ISO format)' },
      },
      required: [],
    },
  },
  {
    name: 'get_meeting_summary',
    description: 'Get the full AI-generated summary for a specific meeting including topics discussed, decisions made, and marketing-related insights.',
    input_schema: {
      type: 'object',
      properties: {
        meetingId: { type: 'string', description: 'The ID of the meeting to get summary for' },
      },
      required: ['meetingId'],
    },
  },
  {
    name: 'share_meeting_summary',
    description: 'Email a meeting summary to specified recipients. REQUIRES APPROVAL - this is an L3 DRAFT action that creates a ScheduledCommunication for Jonathan to review.',
    input_schema: {
      type: 'object',
      properties: {
        meetingId: { type: 'string', description: 'The ID of the meeting' },
        recipientEmails: { type: 'string', description: 'Comma-separated list of recipient email addresses' },
      },
      required: ['meetingId', 'recipientEmails'],
    },
  },
];

/**
 * Sanitize response text to remove any raw XML/function call tags
 * that Claude might accidentally output in its text response.
 * This prevents internal tool orchestration markup from leaking to the user.
 */
function sanitizeResponse(text: string): string {
  if (!text) return text;

  // Patterns for raw XML/tool markup that should never reach the client
  const patterns = [
    // Function call tags
    /<\/?function_call[^>]*>/gi,
    /<function_calls>[\s\S]*?<\/function_calls>/gi,
    // Tool use tags (Anthropic format)
    /<\/?tool_use[^>]*>/gi,
    /<\/?tool_result[^>]*>/gi,
    /<tool_use>[\s\S]*?<\/tool_use>/gi,
    /<tool_result>[\s\S]*?<\/tool_result>/gi,
    // Anthropic XML namespace tags
    /<\/?antml:[^>]*>/gi,
    /<[^>]+>[\s\S]*?<\/antml:[^>]+>/gi,
    // Invoke/parameter tags (MCP format)
    /<\/?invoke[^>]*>/gi,
    /<\/?parameter[^>]*>/gi,
    /<invoke[^>]*>[\s\S]*?<\/invoke>/gi,
    // Generic thinking/scratchpad tags
    /<\/?thinking[^>]*>/gi,
    /<thinking>[\s\S]*?<\/thinking>/gi,
    /<\/?scratchpad[^>]*>/gi,
    /<scratchpad>[\s\S]*?<\/scratchpad>/gi,
  ];

  let sanitized = text;
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Clean up excessive whitespace that might result from removals
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n').trim();

  return sanitized;
}

@Injectable()
export class DonService {
  private readonly logger = new Logger(DonService.name);

  constructor(
    private prisma: PrismaService,
    private meetingService: MeetingIntelligenceService,
  ) {}

  private getDonPersonality(): string {
    return `You are Don, the Chief Marketing Officer (CMO) AI assistant for Zander. You're a confident, suave marketing executive with classic advertising wisdom meets modern digital strategy. You speak with conviction, use compelling storytelling, and believe deeply in the power of emotional connection in marketing. Occasionally share timeless advertising philosophy.

Your style:
- Direct and insightful, with a certain charm
- You see marketing as both art and science
- You believe every brand has a story worth telling
- You push clients to be bolder, more authentic
- You know that people don't buy products, they buy feelings
- You appreciate timeless advertising principles

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

  /**
   * Get meeting intelligence context for Don (CMO)
   * Focuses on marketing discussions and client feedback from meetings
   */
  private async getMeetingIntelligenceContext(tenantId: string): Promise<string> {
    try {
      const meetings = await this.prisma.meetingRecord.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          lead: { select: { name: true, company: true } },
        },
      });

      if (meetings.length === 0) {
        return '';
      }

      const processed = meetings.filter(m => m.summaryStatus === 'completed');
      if (processed.length === 0) {
        return `\nMeeting Intelligence: ${meetings.length} meetings recorded, summaries processing`;
      }

      // Extract marketing-related insights from meetings
      const marketingInsights: string[] = [];
      const clientFeedback: string[] = [];

      processed.forEach(m => {
        const summary = m.summaryJson as any;
        const client = m.lead?.company || 'Unknown client';

        // Look for marketing-related topics
        const topicsSummary = summary?.topicsSummary || '';
        const marketingKeywords = ['marketing', 'brand', 'campaign', 'content', 'social', 'advertising', 'website', 'seo', 'email'];
        const hasMarketingTopics = marketingKeywords.some(k => topicsSummary.toLowerCase().includes(k));

        if (hasMarketingTopics) {
          marketingInsights.push(`- "${m.title}" (${client}): ${topicsSummary.substring(0, 150)}...`);
        }

        // Extract client concerns related to marketing
        const concerns = summary?.clientConcerns || [];
        concerns.forEach((c: any) => {
          if (marketingKeywords.some(k => c.concern.toLowerCase().includes(k))) {
            clientFeedback.push(`- [${c.severity || 'MEDIUM'}] ${c.concern} (${client})`);
          }
        });
      });

      let context = `
MEETING INTELLIGENCE FOR MARKETING:
- ${processed.length} meetings with AI summaries`;

      if (marketingInsights.length > 0) {
        context += `

MARKETING DISCUSSIONS IN RECENT MEETINGS:
${marketingInsights.slice(0, 5).join('\n')}`;
      }

      if (clientFeedback.length > 0) {
        context += `

CLIENT MARKETING FEEDBACK/CONCERNS:
${clientFeedback.slice(0, 5).join('\n')}`;
      }

      return context;
    } catch (error) {
      console.error('Error fetching meeting intelligence for Don:', error);
      return '';
    }
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

  /**
   * Execute a meeting tool and return the result
   * Don has access to 3 tools (no process_meeting_recording)
   */
  private async executeMeetingTool(
    tenantId: string,
    userId: string,
    toolName: string,
    toolInput: any,
  ): Promise<{ success: boolean; result?: any; error?: string; needsApproval?: boolean }> {
    try {
      switch (toolName) {
        case 'get_meeting_recordings': {
          const { meetings, total } = await this.meetingService.findAll(tenantId, {
            engagementId: toolInput.engagementId,
            dateFrom: toolInput.dateFrom,
            dateTo: toolInput.dateTo,
            limit: Math.min(toolInput.limit || 5, 20),
          });
          return {
            success: true,
            result: {
              meetings: meetings.map(m => ({
                id: m.id,
                title: m.title,
                scheduledAt: m.scheduledAt,
                durationMinutes: m.durationMinutes,
                platform: m.platform,
                transcriptStatus: m.transcriptStatus,
                summaryStatus: m.summaryStatus,
                engagement: m.engagement?.packageType,
                lead: m.lead?.name,
              })),
              total,
            },
          };
        }

        case 'get_meeting_summary': {
          const meeting = await this.meetingService.findOne(tenantId, toolInput.meetingId);
          return {
            success: true,
            result: {
              id: meeting.id,
              title: meeting.title,
              scheduledAt: meeting.scheduledAt,
              summaryText: meeting.summaryText,
              summaryJson: meeting.summaryJson,
              attendees: meeting.attendees,
              transcriptText: meeting.transcriptText?.substring(0, 2000) + (meeting.transcriptText?.length > 2000 ? '...' : ''),
            },
          };
        }

        case 'share_meeting_summary': {
          const meeting = await this.meetingService.findOne(tenantId, toolInput.meetingId);

          if (!meeting.summaryText && !meeting.summaryJson) {
            return {
              success: false,
              error: 'This meeting does not have a summary available yet.',
            };
          }

          const recipients = toolInput.recipientEmails
            .split(',')
            .map((e: string) => e.trim())
            .filter((e: string) => e.includes('@'));

          // L3 DRAFT - create ScheduledCommunication for approval
          await this.prisma.scheduledCommunication.create({
            data: {
              tenantId,
              type: 'meeting_summary_share',
              subject: `Share Meeting Summary: ${meeting.title}`,
              body: JSON.stringify({
                action: 'share_meeting_summary',
                meetingId: meeting.id,
                meetingTitle: meeting.title,
                recipients: recipients.map((email: string) => ({ email, name: email.split('@')[0] })),
                requestedBy: 'Don (CMO)',
              }),
              recipientEmail: recipients[0],
              scheduledFor: new Date(),
              status: 'pending',
              needsApproval: true,
              createdBy: userId,
            },
          });

          return {
            success: true,
            result: {
              status: 'pending_approval',
              message: `Summary share request for "${meeting.title}" submitted for Jonathan's approval. Recipients: ${recipients.join(', ')}. This is an L3 DRAFT action.`,
              recipients,
            },
            needsApproval: true,
          };
        }

        default:
          return {
            success: false,
            error: `Unknown tool: ${toolName}`,
          };
      }
    } catch (error) {
      this.logger.error(`Tool execution error (${toolName}):`, error);
      return {
        success: false,
        error: error.message || 'Tool execution failed',
      };
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
      meetingIntelligence,
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
      this.getMeetingIntelligenceContext(tenantId),
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
Calendar: ${calendar}
${meetingIntelligence}`;
  }

  async chat(tenantId: string, message: string, conversationHistory: any[] = []) {
    // Build marketing context from user's actual data
    const marketingContext = await this.buildMarketingContext(tenantId);

    // Query knowledge base for platform help questions
    const knowledgeArticles = await this.queryKnowledge(message);
    const knowledgeContext = knowledgeArticles.length > 0
      ? `\nPLATFORM HELP:\n${knowledgeArticles.map(a => `- ${a.title}: ${a.summary || a.content.substring(0, 200)}`).join('\n')}`
      : '';

    // Build system prompt with personality + context + tool info
    const systemPrompt = `${this.getDonPersonality()}

${marketingContext}
${knowledgeContext}

Use this context to personalize your advice. Reference specific campaigns, workflows, or metrics when relevant.

MEETING INTELLIGENCE TOOLS:
You have access to meeting intelligence tools. Use them when:
- User asks about recent meetings, meeting summaries, or marketing discussions
- User wants to review what was discussed in client meetings
- User wants to share a meeting summary with stakeholders

Available tools:
- get_meeting_recordings: List recent meetings with status
- get_meeting_summary: Get full summary for a specific meeting
- share_meeting_summary: Email summary to recipients (L3 DRAFT - requires approval)

When using L3 DRAFT tools, inform the user that the action requires Jonathan's approval before execution.`;

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
      this.logger.error('ANTHROPIC_API_KEY not configured');
      return {
        content: 'AI assistant is not configured. Please contact support.',
        executive: { id: 'cmo', name: 'Don', role: 'Chief Marketing Officer' },
      };
    }

    // Get user ID for tool execution
    const user = await this.prisma.user.findFirst({
      where: { tenantId },
      select: { id: true },
    });
    const userId = user?.id || 'system';

    try {
      // Track total token usage across multiple API calls (for tool loops)
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let currentMessages = [...messages];
      let finalTextContent = '';
      let iterations = 0;
      const maxIterations = 5; // Prevent infinite loops

      // Tool use loop - continue until we get a final text response
      while (iterations < maxIterations) {
        iterations++;

        const requestBody: any = {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: currentMessages,
          tools: DON_MEETING_TOOLS,
        };

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.text();
          this.logger.error('Claude API error:', error);
          throw new Error('Claude API request failed');
        }

        const data = await response.json();

        // Accumulate token usage
        totalInputTokens += data.usage?.input_tokens || 0;
        totalOutputTokens += data.usage?.output_tokens || 0;

        // Check if we have tool_use blocks
        const toolUseBlocks = data.content.filter((block: any) => block.type === 'tool_use');
        const textBlocks = data.content.filter((block: any) => block.type === 'text');

        // Collect any text from this response
        if (textBlocks.length > 0) {
          finalTextContent += textBlocks.map((b: any) => b.text).join('\n');
        }

        // If stop_reason is 'end_turn' and no tool_use, we're done
        if (data.stop_reason === 'end_turn' && toolUseBlocks.length === 0) {
          break;
        }

        // If there are tool_use blocks, execute them and continue
        if (toolUseBlocks.length > 0) {
          // Add assistant message with tool calls
          currentMessages.push({
            role: 'assistant',
            content: data.content,
          });

          // Execute each tool and build tool_result message
          const toolResults: any[] = [];
          for (const toolBlock of toolUseBlocks) {
            const result = await this.executeMeetingTool(
              tenantId,
              userId,
              toolBlock.name,
              toolBlock.input,
            );

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolBlock.id,
              content: JSON.stringify(result),
            });
          }

          // Add tool results as user message
          currentMessages.push({
            role: 'user',
            content: toolResults,
          });
        } else {
          // No tool_use and no end_turn, still break to be safe
          break;
        }
      }

      // Sanitize content to remove any raw XML/tool tags that might have leaked through
      return {
        content: sanitizeResponse(finalTextContent) || 'I apologize, but I was unable to generate a response. Please try again.',
        executive: {
          id: 'cmo',
          name: 'Don',
          role: 'Chief Marketing Officer',
        },
        usage: {
          tokensUsed: totalInputTokens + totalOutputTokens,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
        },
      };
    } catch (error) {
      this.logger.error('Error calling Claude API:', error);
      return {
        content: 'I encountered an issue processing your request. Please try again.',
        executive: { id: 'cmo', name: 'Don', role: 'Chief Marketing Officer' },
      };
    }
  }
}
