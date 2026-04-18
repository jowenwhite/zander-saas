import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeetingIntelligenceService } from '../meeting-intelligence/meeting-intelligence.service';
import {
  TIER_TOKEN_CAPS,
  TIER_HIERARCHY,
  getTokenCapForTier,
  formatTokenCount,
} from '../common/config/tier-config';

// Tool definitions for meeting intelligence
const MEETING_TOOLS = [
  {
    name: 'get_meeting_recordings',
    description: 'List recent meeting recordings for this business with transcription and summary status',
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
    description: 'Get the full AI-generated summary for a specific meeting including action items, decisions, and follow-ups',
    input_schema: {
      type: 'object',
      properties: {
        meetingId: { type: 'string', description: 'The ID of the meeting to get summary for' },
      },
      required: ['meetingId'],
    },
  },
  {
    name: 'process_meeting_recording',
    description: 'Submit a meeting recording URL for transcription and AI analysis. REQUIRES APPROVAL - this is an L3 DRAFT action.',
    input_schema: {
      type: 'object',
      properties: {
        recordingUrl: { type: 'string', description: 'URL to the meeting recording file' },
        title: { type: 'string', description: 'Title for the meeting' },
        attendees: { type: 'string', description: 'Comma-separated list of attendee names' },
        platform: { type: 'string', description: 'Meeting platform (zoom, google_meet, teams, etc)' },
        engagementId: { type: 'string', description: 'Optional consulting engagement to link to' },
      },
      required: ['recordingUrl', 'title'],
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

interface Executive {
  id: string;
  name: string;
  role: string;
  fullTitle: string;
  personality: string;
}

/**
 * Executive tier requirements:
 * - null = coming soon, not accessible to anyone
 * - 'STARTER' = requires STARTER or higher
 * - 'PRO' = requires PRO or higher
 * - 'BUSINESS' = requires BUSINESS or higher
 */
const EXECUTIVE_TIER_REQUIREMENTS: Record<string, string | null> = {
  ea: 'STARTER',      // Pam - available to all paid tiers
  cro: 'PRO',         // Jordan - requires PRO or higher
  cmo: 'BUSINESS',    // Don - requires BUSINESS or higher
  cfo: null,          // Ben - Coming Q4 2026
  coo: null,          // Miranda - Coming Q4 2026
  cpo: null,          // Ted - Coming Q4 2026
  cio: null,          // Jarvis - Coming Q4 2026
};

const executives: Record<string, Executive> = {
  cro: {
    id: 'cro',
    name: 'Jordan',
    role: 'CRO',
    fullTitle: 'Chief Revenue Officer',
    personality: `You are Jordan, the Chief Revenue Officer (CRO) AI assistant for Zander. You are enthusiastic, warm, and persuasive. You are a dedicated sales coach who gets genuinely excited about helping users close deals and build lasting client relationships. Always encouraging and action-oriented, you focus on practical strategies that drive real results. You expect users to pick up the phone and make things happen!

Your expertise includes:
- Sales strategy and pipeline management
- Lead qualification and nurturing
- Proposal writing and pricing
- Negotiation and closing techniques
- Follow-up sequences and timing
- Objection handling
- Discovery calls and questioning techniques
- Building client relationships

When responding:
- Be enthusiastic but professional
- Give actionable, specific advice
- Use emojis sparingly but effectively
- Break down complex topics into clear steps
- Ask clarifying questions when needed
- Reference sales best practices
- Encourage action and follow-through
- Keep responses focused and practical`
  },
  cfo: {
    id: 'cfo',
    name: 'Ben',
    role: 'CFO',
    fullTitle: 'Chief Financial Officer',
    personality: `You are Ben, the Chief Financial Officer (CFO) AI assistant for Zander. You are analytical, practical, and refreshingly cautious. You genuinely love spreadsheets and get a little too excited about balanced budgets. You give careful, well-reasoned financial advice and always want to see the numbers before making any decision. You occasionally make accounting jokes that only you find funny. You are the voice of fiscal responsibility.

Your expertise includes:
- Cash flow management and forecasting
- Profit margin analysis
- Budgeting and financial planning
- Pricing strategy
- Financial health assessment
- Cost control and expense management
- Investment decisions
- Tax considerations

When responding:
- Be analytical and data-driven
- Ask for numbers when relevant
- Provide cautious, well-reasoned advice
- Use financial terminology appropriately
- Occasionally make dry accounting humor
- Focus on profitability and sustainability
- Warn about financial risks
- Suggest tracking metrics`
  },
  coo: {
    id: 'coo',
    name: 'Miranda',
    role: 'COO',
    fullTitle: 'Chief Operations Officer',
    personality: `You are Miranda, the Chief Operations Officer (COO) AI assistant for Zander. You are efficient, detail-oriented, and refreshingly direct. You have zero tolerance for inefficiency and can spot a bottleneck from a mile away. You ensure everything runs like a well-oiled machine and aren't afraid to tell users when something isn't working. You deliver actionable advice without sugarcoating.

Your expertise includes:
- Process optimization and workflows
- Project management and delivery
- Team coordination and delegation
- Systems and automation
- Quality control
- Scaling operations
- Resource allocation
- Standard operating procedures

When responding:
- Be direct and efficient
- Focus on processes and systems
- Identify bottlenecks and inefficiencies
- Provide checklists and frameworks
- Don't sugarcoat problems
- Suggest automation opportunities
- Emphasize consistency and reliability
- Push for documentation`
  },
  cmo: {
    id: 'cmo',
    name: 'Don',
    role: 'CMO',
    fullTitle: 'Chief Marketing Officer',
    personality: `You are Don, the Chief Marketing Officer (CMO) AI assistant for Zander. You are creative, confident, and a master storyteller. You see the deeper narrative behind every brand and know exactly how to make people feel something. You think in campaigns and speak in headlines. Bold ideas come naturally, but always grounded in what actually moves the needle. You push users to be braver with their marketing than they've ever been.

Your expertise includes:
- Brand strategy and messaging
- Content marketing and copywriting
- Social media strategy
- Advertising and campaigns
- Market positioning and differentiation
- Customer personas and targeting
- Marketing channels and tactics
- Storytelling and narrative

When responding:
- Be creative and inspiring
- Think in terms of stories and emotions
- Push for bold, differentiated ideas
- Focus on what makes them unique
- Use vivid language and examples
- Challenge conventional thinking
- Connect marketing to business results
- Encourage brand consistency`
  },
  cpo: {
    id: 'cpo',
    name: 'Ted',
    role: 'CPO',
    fullTitle: 'Chief People Officer',
    personality: `You are Ted, the Chief People Officer (CPO) AI assistant for Zander. You are relentlessly positive and genuinely believe in the potential of every person. You know that business success comes down to people - hiring right, treating them well, and building a culture worth showing up for. Encouraging without being naive, you focus on practical team development while never losing sight of the human element. You believe biscuits solve most problems.

Your expertise includes:
- Hiring and recruitment
- Team building and culture
- Performance management
- Employee development
- Difficult conversations
- Leadership coaching
- Workplace communication
- Retention and engagement

When responding:
- Be warm and encouraging
- Focus on the human element
- Provide practical people advice
- Emphasize clear communication
- Suggest team-building approaches
- Help with difficult conversations
- Balance empathy with accountability
- Occasionally mention biscuits/treats`
  },
  cio: {
    id: 'cio',
    name: 'Jarvis',
    role: 'CIO',
    fullTitle: 'Chief Information Officer',
    personality: `You are Jarvis, the Chief Information Officer (CIO) AI assistant for Zander. You are calm, knowledgeable, and always one step ahead. You understand technology at every level and have a gift for explaining complex systems in simple terms. Security-minded but practical, you focus on solutions that actually work for the business. Never condescending, always helpful. Like a brilliant tech advisor who actually speaks their language.

Your expertise includes:
- Technology strategy and selection
- Software and tool recommendations
- Data security and privacy
- System integrations
- Cloud vs on-premise decisions
- Technical problem-solving
- Digital transformation
- IT infrastructure

When responding:
- Be calm and reassuring
- Explain technical concepts simply
- Focus on practical solutions
- Consider security implications
- Recommend appropriate tools
- Avoid unnecessary jargon
- Think about scalability
- Balance innovation with stability`
  },
  ea: {
    id: 'ea',
    name: 'Pam',
    role: 'EA',
    fullTitle: 'Executive Assistant',
    personality: `You are Pam, the Executive Assistant (EA) AI assistant for Zander. You are warm, organized, and somehow always one step ahead of what users need. You have a remarkable ability to anticipate problems before they happen and keep everything running smoothly without making a fuss about it. Friendly and approachable, but don't mistake your warmth for lack of capability - you're the reason things actually get done. The secret weapon for productivity.

Your expertise includes:
- Time management and prioritization
- Email and communication drafting
- Meeting planning and agendas
- Task organization and tracking
- Calendar management
- Follow-up systems
- Professional correspondence
- Administrative efficiency

When responding:
- Be warm and helpful
- Anticipate their needs
- Provide organized, clear advice
- Help them prioritize ruthlessly
- Suggest systems and reminders
- Draft professional communications
- Keep things simple and actionable
- Be the calm in their chaos`
  }
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private meetingService: MeetingIntelligenceService,
  ) {}

  /**
   * Get tenant's effective tier considering overrides and trials.
   */
  private getEffectiveTier(tenant: {
    subscriptionTier: string | null;
    tierOverride: string | null;
    trialTier: string | null;
    trialStartDate: Date | null;
    trialEndDate: Date | null;
  }): string {
    let currentTier = tenant.subscriptionTier || 'FREE';

    if (tenant.tierOverride) {
      currentTier = tenant.tierOverride;
    } else if (tenant.trialTier && tenant.trialStartDate && tenant.trialEndDate) {
      const now = new Date();
      const trialStart = new Date(tenant.trialStartDate);
      const trialEnd = new Date(tenant.trialEndDate);
      if (now >= trialStart && now <= trialEnd) {
        currentTier = tenant.trialTier;
      }
    }

    return currentTier.toUpperCase();
  }

  /**
   * Check if the tenant has tokens remaining for the current month.
   * Performs lazy monthly reset if needed.
   * Returns tenant data with updated token info.
   */
  private async checkAndResetTokens(tenantId: string): Promise<{
    tenant: any;
    effectiveTier: string;
    monthlyTokensUsed: number;
    monthlyTokenLimit: number;
    tokenResetDate: Date;
  }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        subscriptionTier: true,
        tierOverride: true,
        trialTier: true,
        trialStartDate: true,
        trialEndDate: true,
        monthlyTokensUsed: true,
        tokenResetDate: true,
      },
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    const effectiveTier = this.getEffectiveTier(tenant);
    const monthlyTokenLimit = getTokenCapForTier(effectiveTier);

    // Check if we need to reset (first of current month)
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const tokenResetDate = tenant.tokenResetDate ? new Date(tenant.tokenResetDate) : null;

    let monthlyTokensUsed = tenant.monthlyTokensUsed || 0;

    // Lazy reset: if tokenResetDate is null or in a prior month, reset
    if (!tokenResetDate || tokenResetDate < firstOfMonth) {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          monthlyTokensUsed: 0,
          tokenResetDate: firstOfMonth,
        },
      });
      monthlyTokensUsed = 0;
    }

    return {
      tenant,
      effectiveTier,
      monthlyTokensUsed,
      monthlyTokenLimit,
      tokenResetDate: firstOfMonth,
    };
  }

  /**
   * Check if tenant has tokens remaining. Throws if cap exceeded.
   */
  private async enforceTokenCap(tenantId: string): Promise<{
    effectiveTier: string;
    monthlyTokensUsed: number;
    monthlyTokenLimit: number;
    tokenResetDate: Date;
  }> {
    const { effectiveTier, monthlyTokensUsed, monthlyTokenLimit, tokenResetDate } =
      await this.checkAndResetTokens(tenantId);

    if (monthlyTokensUsed >= monthlyTokenLimit) {
      // Calculate next reset date (first of next month)
      const nextReset = new Date(tokenResetDate);
      nextReset.setMonth(nextReset.getMonth() + 1);

      throw new ForbiddenException({
        statusCode: 403,
        tokenCapExceeded: true,
        monthlyTokensUsed,
        monthlyTokenLimit,
        effectiveTier,
        resetsAt: nextReset.toISOString(),
        message: `Monthly token limit reached. You've used ${formatTokenCount(monthlyTokensUsed)} of your ${formatTokenCount(monthlyTokenLimit)} token allowance. Resets on ${nextReset.toLocaleDateString()}.`,
      });
    }

    return { effectiveTier, monthlyTokensUsed, monthlyTokenLimit, tokenResetDate };
  }

  /**
   * Record token usage after a successful API call.
   * Updates both the tenant rollup and the detailed TokenUsage table.
   */
  private async recordTokenUsage(
    tenantId: string,
    executiveId: string,
    inputTokens: number,
    outputTokens: number,
  ): Promise<{ monthlyTokensUsed: number }> {
    const totalTokens = inputTokens + outputTokens;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Update tenant rollup
    const updatedTenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        monthlyTokensUsed: { increment: totalTokens },
      },
      select: { monthlyTokensUsed: true },
    });

    // Upsert to TokenUsage for per-executive analytics
    await this.prisma.tokenUsage.upsert({
      where: {
        tenantId_executive_month_year: {
          tenantId,
          executive: executiveId,
          month,
          year,
        },
      },
      update: {
        inputTokens: { increment: inputTokens },
        outputTokens: { increment: outputTokens },
        totalTokens: { increment: totalTokens },
      },
      create: {
        tenantId,
        executive: executiveId,
        month,
        year,
        inputTokens,
        outputTokens,
        totalTokens,
      },
    });

    return { monthlyTokensUsed: updatedTenant.monthlyTokensUsed };
  }

  /**
   * Verify tenant has access to the requested executive based on their subscription tier.
   * Throws ForbiddenException if access is denied.
   */
  private async checkExecutiveAccess(tenantId: string, executiveId: string, executiveName: string): Promise<void> {
    const requiredTier = EXECUTIVE_TIER_REQUIREMENTS[executiveId];

    // null means coming soon - not accessible to anyone
    if (requiredTier === null) {
      throw new ForbiddenException({
        statusCode: 403,
        comingSoon: true,
        executiveId,
        executiveName,
        message: `${executiveName} is coming soon and not yet available`,
      });
    }

    // Get tenant's effective tier
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionTier: true,
        tierOverride: true,
        trialTier: true,
        trialStartDate: true,
        trialEndDate: true,
      },
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    // Determine effective tier: tierOverride > active trial > subscriptionTier > FREE
    let currentTier = tenant.subscriptionTier || 'FREE';

    if (tenant.tierOverride) {
      currentTier = tenant.tierOverride;
    } else if (tenant.trialTier && tenant.trialStartDate && tenant.trialEndDate) {
      const now = new Date();
      const trialStart = new Date(tenant.trialStartDate);
      const trialEnd = new Date(tenant.trialEndDate);
      if (now >= trialStart && now <= trialEnd) {
        currentTier = tenant.trialTier;
      }
    }

    // Compare tier levels
    const requiredLevel = TIER_HIERARCHY.indexOf(requiredTier.toUpperCase());
    const currentLevel = TIER_HIERARCHY.indexOf(currentTier.toUpperCase());
    const effectiveCurrentLevel = currentLevel === -1 ? 0 : currentLevel;

    if (effectiveCurrentLevel >= requiredLevel) {
      return; // Access granted
    }

    // Access denied - throw with upgrade info
    const tierNames: Record<string, string> = {
      FREE: 'Free',
      STARTER: 'Starter',
      PRO: 'Pro',
      BUSINESS: 'Business',
      ENTERPRISE: 'Enterprise',
    };

    throw new ForbiddenException({
      statusCode: 403,
      locked: true,
      executiveId,
      executiveName,
      requiredTier: requiredTier.toUpperCase(),
      currentTier: currentTier.toUpperCase(),
      message: `${executiveName} requires a ${tierNames[requiredTier.toUpperCase()] || requiredTier} subscription`,
    });
  }

  /**
   * Get meeting intelligence context for executives
   * Used by Pam (EA), Jordan (CRO), and others for meeting-related queries
   */
  private async getMeetingIntelligenceContext(tenantId: string, executiveId: string): Promise<string> {
    try {
      const meetings = await this.prisma.meetingRecord.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          engagement: { select: { tenant: { select: { companyName: true } } } },
          lead: { select: { name: true, company: true } },
        },
      });

      if (meetings.length === 0) {
        return '';
      }

      const processed = meetings.filter(m => m.summaryStatus === 'completed');
      const pending = meetings.filter(m => m.transcriptStatus === 'processing' || m.summaryStatus === 'processing');

      let context = `
MEETING INTELLIGENCE:
- Total Meetings: ${meetings.length}
- Processed with AI Summary: ${processed.length}
- Processing: ${pending.length}
`;

      // Add recent meetings with summaries for context
      const recentWithSummary = processed.slice(0, 5);
      if (recentWithSummary.length > 0) {
        context += `
RECENT MEETING SUMMARIES:
${recentWithSummary.map(m => {
  const summary = m.summaryJson as any;
  const client = m.lead?.company || m.engagement?.tenant?.companyName || 'Unknown';
  return `
- "${m.title}" (${new Date(m.createdAt).toLocaleDateString()}) - ${client}
  ${summary?.topicsSummary || 'Summary pending'}
  ${summary?.keyDecisions?.length > 0 ? `Key Decisions: ${summary.keyDecisions.slice(0, 2).map((d: any) => d.decision).join('; ')}` : ''}
  ${summary?.actionItems?.length > 0 ? `Action Items: ${summary.actionItems.length} items` : ''}
`;
}).join('')}`;
      }

      // Executive-specific context additions
      if (executiveId === 'ea') {
        // Pam (EA) - focus on follow-ups and action items
        const allActionItems = processed.flatMap(m => {
          const summary = m.summaryJson as any;
          return (summary?.actionItems || []).map((a: any) => ({
            ...a,
            meetingTitle: m.title,
            meetingDate: m.createdAt,
          }));
        });

        if (allActionItems.length > 0) {
          context += `
PENDING ACTION ITEMS FROM MEETINGS:
${allActionItems.slice(0, 8).map(a => `- ${a.item} (Owner: ${a.owner || 'Unassigned'}) - from "${a.meetingTitle}"`).join('\n')}
`;
        }
      } else if (executiveId === 'cro') {
        // Jordan (CRO) - focus on deal risks and client concerns
        const clientConcerns = processed.flatMap(m => {
          const summary = m.summaryJson as any;
          return (summary?.clientConcerns || []).map((c: any) => ({
            ...c,
            meetingTitle: m.title,
            client: m.lead?.company || m.engagement?.tenant?.companyName || 'Unknown',
          }));
        });

        if (clientConcerns.length > 0) {
          context += `
CLIENT CONCERNS IDENTIFIED IN MEETINGS:
${clientConcerns.slice(0, 5).map(c => `- [${c.severity || 'MEDIUM'}] ${c.concern} (${c.client}) - Response: ${c.response || 'Pending'}`).join('\n')}
`;
        }
      }

      return context;
    } catch (error) {
      console.error('Error fetching meeting intelligence:', error);
      return '';
    }
  }

  /**
   * Execute a meeting tool and return the result
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

        case 'process_meeting_recording': {
          // L3 DRAFT - creates a ScheduledCommunication for approval
          const attendeesArray = toolInput.attendees
            ? toolInput.attendees.split(',').map((a: string) => ({ name: a.trim() }))
            : [];

          // Create a pending action for Jonathan to approve
          await this.prisma.scheduledCommunication.create({
            data: {
              tenantId,
              type: 'meeting_processing',
              subject: `Process Meeting: ${toolInput.title}`,
              body: JSON.stringify({
                action: 'process_meeting_recording',
                recordingUrl: toolInput.recordingUrl,
                title: toolInput.title,
                attendees: attendeesArray,
                platform: toolInput.platform || 'unknown',
                engagementId: toolInput.engagementId,
              }),
              recipientEmail: 'jonathan@zanderos.com',
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
              message: 'Meeting processing request submitted for Jonathan\'s approval. This is an L3 DRAFT action.',
            },
            needsApproval: true,
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

  async queryKnowledge(query: string, limit: number = 5) {
    // Search knowledge base for relevant articles
    const articles = await this.prisma.knowledgeArticle.findMany({
      where: {
        isPublished: true,
        OR: [
          { searchTerms: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: query.toLowerCase().split(' ').filter(w => w.length > 2) } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        title: true,
        summary: true,
        content: true,
        category: true,
        tags: true,
      },
      take: limit,
      orderBy: { viewCount: 'desc' },
    });
    return articles;
  }


  async chat(tenantId: string, executiveId: string, message: string, conversationHistory: any[] = []) {
    const executive = executives[executiveId];
    if (!executive) {
      throw new Error(`Executive ${executiveId} not found`);
    }

    // Check executive tier access before proceeding
    await this.checkExecutiveAccess(tenantId, executiveId, executive.name);

    // Check token cap before making API call
    const { effectiveTier, monthlyTokensUsed, monthlyTokenLimit, tokenResetDate } =
      await this.enforceTokenCap(tenantId);

    // Get context data for the tenant
    const [deals, contacts, activities, meetingContext] = await Promise.all([
      this.prisma.deal.findMany({
        where: { tenantId },
        include: { contact: true },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
      this.prisma.contact.findMany({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
      this.prisma.activity.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Include meeting intelligence for Pam (EA) and Jordan (CRO)
      (executiveId === 'ea' || executiveId === 'cro')
        ? this.getMeetingIntelligenceContext(tenantId, executiveId)
        : Promise.resolve(''),
    ]);

    // Build context about the business
    const businessContext = `
CURRENT BUSINESS CONTEXT:
- Active Deals: ${deals.length} deals in pipeline
- Total Pipeline Value: $${deals.reduce((sum, d) => sum + (d.dealValue || 0), 0).toLocaleString()}
- Recent Contacts: ${contacts.length} contacts
- Recent Activities: ${activities.length} activities logged

DEAL SUMMARY:
${deals.slice(0, 5).map(d => `- ${d.dealName}: $${d.dealValue?.toLocaleString() || 0} (${d.stage}) - Contact: ${d.contact?.firstName} ${d.contact?.lastName}`).join('\n')}
${meetingContext}`;

    
    // Query knowledge base for platform help
    const knowledgeArticles = await this.queryKnowledge(message);
    const knowledgeContext = knowledgeArticles.length > 0 
      ? `
PLATFORM KNOWLEDGE BASE (Use this to answer questions about how Zander works):
${knowledgeArticles.map(a => `
--- Article: ${a.title} ---
Category: ${a.category}
${a.summary ? 'Summary: ' + a.summary : ''}
Content: ${a.content}
---
`).join('\n')}
`
      : '';

    // Build messages for Claude
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const systemPrompt = `Today's date is ${currentDate}.

${executive.personality}

${businessContext}
${knowledgeContext}

Remember: You are ${executive.name}, the ${executive.fullTitle}. Stay in character and provide helpful, actionable advice based on your expertise. Reference the business context when relevant to personalize your advice.

IMPORTANT: If the user asks about how to use Zander, platform features, or needs help with the software, refer to the PLATFORM KNOWLEDGE BASE section above. Provide accurate information based on the knowledge articles. If you don't have relevant knowledge articles, let the user know you'll escalate to support.

${(executiveId === 'ea' || executiveId === 'cro') ? `MEETING INTELLIGENCE TOOLS:
You have access to meeting intelligence tools. Use them when:
- User asks about recent meetings, meeting summaries, or action items
- User wants to process a new recording
- User wants to share a meeting summary

Available tools:
- get_meeting_recordings: List recent meetings with status
- get_meeting_summary: Get full summary for a specific meeting
- process_meeting_recording: Submit a recording for transcription (L3 DRAFT - requires approval)
- share_meeting_summary: Email summary to recipients (L3 DRAFT - requires approval)

When using L3 DRAFT tools, inform the user that the action requires Jonathan's approval before execution.` : ''}`;

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
      // Fallback to mock response if no API key
      return this.getMockResponse(executive, message);
    }

    try {
      // Determine if this executive has access to meeting tools
      const hasMeetingTools = executiveId === 'ea' || executiveId === 'cro';

      // Get user ID for tool execution (we need it for tracking)
      const user = await this.prisma.user.findFirst({
        where: { tenantId },
        select: { id: true },
      });
      const userId = user?.id || 'system';

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
        };

        // Only include tools for executives that have them
        if (hasMeetingTools) {
          requestBody.tools = MEETING_TOOLS;
        }

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
          return this.getMockResponse(executive, message, {
            monthlyTokensUsed,
            monthlyTokenLimit,
            effectiveTier,
          });
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

      // Record usage
      const { monthlyTokensUsed: updatedMonthlyTokensUsed } = await this.recordTokenUsage(
        tenantId,
        executiveId,
        totalInputTokens,
        totalOutputTokens,
      );

      return {
        content: finalTextContent || 'I apologize, but I was unable to generate a response. Please try again.',
        executive: {
          id: executive.id,
          name: executive.name,
          role: executive.role,
        },
        usage: {
          tokensUsed: totalInputTokens + totalOutputTokens,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          monthlyTokensUsed: updatedMonthlyTokensUsed,
          monthlyTokenLimit,
          effectiveTier,
        },
      };
    } catch (error) {
      this.logger.error('Error calling Claude API:', error);
      return this.getMockResponse(executive, message, {
        monthlyTokensUsed,
        monthlyTokenLimit,
        effectiveTier,
      });
    }
  }

  private getMockResponse(
    executive: Executive,
    message: string,
    usageInfo?: { monthlyTokensUsed: number; monthlyTokenLimit: number; effectiveTier: string },
  ): any {
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (executive.id === 'cro') {
      if (lowerMessage.includes('deal') || lowerMessage.includes('focus') || lowerMessage.includes('prioritize')) {
        response = `Great question! Let me help you prioritize. 🎯

Based on solid sales principles, here's how I'd approach your week:

**Focus on these deal categories (in order):**

1. **Deals closest to closing** - Any deals in Negotiation or Proposal stage? These are your hot opportunities.

2. **Deals going stale** - Check for any deals that haven't had activity in 7+ days. Silence is a deal killer!

3. **High-value prospects** - Your biggest potential deals deserve extra attention.

**My challenge for you this week:**
Make 5 more follow-up calls than you normally would. I guarantee at least one will surprise you!

What specific deals would you like me to help you strategize on?`;
      } else if (lowerMessage.includes('email') || lowerMessage.includes('follow')) {
        response = `Absolutely! Follow-up emails are where deals are won or lost. Here's a template that works:

**Subject:** Quick question about [their project/need]

Hi [Name],

I've been thinking about our conversation regarding [specific thing they mentioned].

I wanted to share a quick thought: [one valuable insight relevant to their situation].

Would it be helpful to jump on a 15-minute call this week? I have [Day] at [Time] available.

Looking forward to hearing from you!

---

**Key principles:**
✅ Personalized subject line
✅ Reference something specific
✅ Provide value first
✅ Clear call-to-action

Want me to customize this for a specific prospect?`;
      } else {
        response = `Great question! Let me think about this from a sales and revenue perspective... 🤔

The key to success in sales is always about **understanding your customer's needs** and **providing genuine value**.

I'd love to give you more specific advice. Can you tell me more about:
- What specific challenge you're facing?
- What you've already tried?

Let's figure this out together! 💪`;
      }
    } else {
      response = `Thanks for reaching out! As ${executive.name}, your ${executive.fullTitle}, I'm here to help.

While the full AI integration is being set up, I can tell you that my expertise covers everything related to ${executive.role.toLowerCase()} functions.

Could you tell me more specifically what you'd like help with? I'm ready to dive in! 🚀`;
    }

    const result: any = {
      content: response,
      executive: {
        id: executive.id,
        name: executive.name,
        role: executive.role,
      },
    };

    // Include usage info if provided (mock responses don't consume real tokens)
    if (usageInfo) {
      result.usage = {
        tokensUsed: 0,
        inputTokens: 0,
        outputTokens: 0,
        monthlyTokensUsed: usageInfo.monthlyTokensUsed,
        monthlyTokenLimit: usageInfo.monthlyTokenLimit,
        effectiveTier: usageInfo.effectiveTier,
      };
    }

    return result;
  }


  async zanderChat(userId: string, message: string, conversationHistory: any[] = []) {
    // Zander is the master AI - Jonathan only, full platform visibility

    // Get platform-wide context including consulting data
    const [
      tickets,
      headwinds,
      tenants,
      knowledgeArticles,
      users,
      // Consulting data (Phase 5B)
      consultingLeads,
      consultingEngagements,
      pendingContracts,
      recentConsultingEvents,
      consultingTimeEntries,
    ] = await Promise.all([
      // All support tickets across platform
      this.prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          tenant: { select: { companyName: true } },
        },
      }),
      // All headwinds
      this.prisma.headwind.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // All tenants with user counts
      this.prisma.tenant.findMany({
        include: {
          _count: { select: { users: true } },
        },
      }),
      // Knowledge base
      this.prisma.knowledgeArticle.findMany({
        where: { isPublished: true },
        select: { title: true, category: true, summary: true },
        take: 20,
      }),
      // Total user count
      this.prisma.user.count(),
      // Consulting Leads Pipeline
      this.prisma.consultingLead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          proposals: { select: { id: true, status: true, packageType: true, totalAmount: true } },
          signedDocuments: { select: { id: true, type: true, isSigned: true } },
          _count: { select: { events: true } },
        },
      }),
      // Active Consulting Engagements
      this.prisma.consultingEngagement.findMany({
        where: { status: 'ACTIVE' },
        include: {
          tenant: { select: { id: true, companyName: true, email: true } },
          _count: { select: { timeEntries: true, deliverables: true } },
        },
        orderBy: { startDate: 'desc' },
      }),
      // Pending Contracts (unsigned documents)
      this.prisma.signedDocument.findMany({
        where: { isSigned: false },
        include: {
          lead: { select: { name: true, email: true, company: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Recent Consulting Events (last 7 days)
      this.prisma.consultingEvent.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        include: {
          lead: { select: { name: true, company: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Recent Time Entries (for revenue tracking)
      this.prisma.consultingTimeEntry.findMany({
        where: {
          date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        include: {
          tenant: { select: { companyName: true } },
        },
        orderBy: { date: 'desc' },
        take: 50,
      }),
    ]);

    // Calculate platform stats
    const openTickets = tickets.filter(t => t.status === 'NEW' || t.status === 'IN_PROGRESS').length;
    const p1Headwinds = headwinds.filter(h => h.priority === 'P1' && h.status !== 'CLOSED').length;
    const activeHeadwinds = headwinds.filter(h => h.status !== 'CLOSED').length;

    // ========================================
    // CONSULTING PIPELINE METRICS (Phase 5B)
    // ========================================

    // Lead Pipeline Summary
    const leadsByStatus = {
      NEW: consultingLeads.filter(l => l.status === 'NEW').length,
      CONTACTED: consultingLeads.filter(l => l.status === 'CONTACTED').length,
      MEETING_SCHEDULED: consultingLeads.filter(l => l.status === 'MEETING_SCHEDULED').length,
      MEETING_COMPLETED: consultingLeads.filter(l => l.status === 'MEETING_COMPLETED').length,
      PROPOSAL_SENT: consultingLeads.filter(l => l.status === 'PROPOSAL_SENT').length,
      NEGOTIATING: consultingLeads.filter(l => l.status === 'NEGOTIATING').length,
      WON: consultingLeads.filter(l => l.status === 'WON').length,
      LOST: consultingLeads.filter(l => l.status === 'LOST').length,
    };
    const activePipelineLeads = consultingLeads.filter(l => !['WON', 'LOST'].includes(l.status));
    const pipelineValue = activePipelineLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

    // Upcoming Meetings
    const upcomingMeetings = consultingLeads
      .filter(l => l.meetingScheduledAt && new Date(l.meetingScheduledAt) > new Date())
      .sort((a, b) => new Date(a.meetingScheduledAt!).getTime() - new Date(b.meetingScheduledAt!).getTime())
      .slice(0, 5);

    // Engagement Metrics
    const totalActiveEngagements = consultingEngagements.length;
    const totalHoursRemaining = consultingEngagements.reduce((sum, e) => sum + ((e.totalHours || 0) - (e.hoursUsed || 0)), 0);
    const totalBillableHours30d = consultingTimeEntries.reduce((sum, e) => sum + (e.billableHours || 0), 0);

    // Revenue calculation (rough estimate based on package types)
    const packageRates: Record<string, number> = {
      'BUSINESS_ANALYSIS': 2500,
      'COMPASS': 4500,
      'FOUNDATION': 7500,
      'BLUEPRINT': 15000,
    };
    const estimatedMRR = consultingEngagements.reduce((sum, e) => {
      return sum + (packageRates[e.packageType] || 0);
    }, 0);

    // Contracts needing signatures
    const pendingNDAs = pendingContracts.filter(d => d.type === 'NDA');
    const pendingCSAs = pendingContracts.filter(d => d.type === 'CSA');
    const pendingSOWs = pendingContracts.filter(d => d.type === 'SOW');

    // Build comprehensive platform context
    const platformContext = `
ZANDER PLATFORM OPERATIONS CONTEXT
==================================
You are Zander, the master operations AI for the Zander SaaS platform. You report directly to Jonathan White, the founder and CEO. Your role is to help Jonathan manage platform operations, analyze support patterns, maintain system health, and MANAGE THE CONSULTING BUSINESS.

CURRENT PLATFORM STATUS:
- Total Tenants: ${tenants.length}
- Total Users: ${users}
- Open Support Tickets: ${openTickets}
- Active Headwinds: ${activeHeadwinds} (${p1Headwinds} P1 critical)
- Knowledge Articles: ${knowledgeArticles.length}

========================================
CONSULTING BUSINESS DASHBOARD
========================================

PIPELINE OVERVIEW:
- Total Active Leads: ${activePipelineLeads.length}
- Pipeline Value: $${pipelineValue.toLocaleString()}
- Leads by Status:
  • NEW: ${leadsByStatus.NEW}
  • CONTACTED: ${leadsByStatus.CONTACTED}
  • MEETING_SCHEDULED: ${leadsByStatus.MEETING_SCHEDULED}
  • MEETING_COMPLETED: ${leadsByStatus.MEETING_COMPLETED}
  • PROPOSAL_SENT: ${leadsByStatus.PROPOSAL_SENT}
  • NEGOTIATING: ${leadsByStatus.NEGOTIATING}
  • WON (converted): ${leadsByStatus.WON}
  • LOST: ${leadsByStatus.LOST}

ACTIVE ENGAGEMENTS:
- Total Active: ${totalActiveEngagements}
- Hours Remaining (all engagements): ${totalHoursRemaining.toFixed(1)} hrs
- Billable Hours (last 30 days): ${totalBillableHours30d.toFixed(1)} hrs
- Estimated Consulting MRR: $${estimatedMRR.toLocaleString()}
${consultingEngagements.map(e => `  • ${e.tenant?.companyName || 'Unknown'}: ${e.packageType} - ${(e.totalHours - e.hoursUsed).toFixed(1)} hrs remaining`).join('\n') || '  (none active)'}

PENDING CONTRACTS (need signature):
- NDAs: ${pendingNDAs.length}${pendingNDAs.length > 0 ? ` (${pendingNDAs.map(d => d.lead?.name || 'Unknown').join(', ')})` : ''}
- CSAs: ${pendingCSAs.length}${pendingCSAs.length > 0 ? ` (${pendingCSAs.map(d => d.lead?.name || 'Unknown').join(', ')})` : ''}
- SOWs: ${pendingSOWs.length}${pendingSOWs.length > 0 ? ` (${pendingSOWs.map(d => d.lead?.name || 'Unknown').join(', ')})` : ''}

UPCOMING MEETINGS:
${upcomingMeetings.length > 0 ? upcomingMeetings.map(m => `- ${new Date(m.meetingScheduledAt!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}: ${m.name} (${m.company || 'no company'}) - ${m.interestedPackage || 'undecided'}`).join('\n') : '(no upcoming meetings)'}

RECENT CONSULTING ACTIVITY (7 days):
${recentConsultingEvents.slice(0, 8).map(e => `- ${e.type}: ${e.description || ''} ${e.lead ? `(${e.lead.name})` : ''}`).join('\n') || '(no recent activity)'}

LEAD DETAILS (active pipeline):
${activePipelineLeads.slice(0, 10).map(l => `- ${l.name} (${l.company || 'no company'}) | ${l.status} | ${l.interestedPackage || '?'} | $${l.estimatedValue?.toLocaleString() || '0'}`).join('\n') || '(no active leads)'}

========================================

TENANT BREAKDOWN:
${tenants.map(t => `- ${t.companyName}: ${t._count.users} users (${t.subscriptionTier || 'TRIAL'})`).join('\n')}

RECENT SUPPORT TICKETS:
${tickets.slice(0, 10).map(t => `- [${t.ticketNumber}] ${t.status} - ${t.subject} (from ${t.user?.firstName || 'Unknown'} at ${t.tenant?.companyName || 'Unknown'})`).join('\n')}

ACTIVE HEADWINDS (Internal Issues):
${headwinds.filter(h => h.status !== 'CLOSED').map(h => `- [${h.priority}] ${h.title} - ${h.status}`).join('\n') || 'None active'}

KNOWLEDGE BASE CATEGORIES:
${[...new Set(knowledgeArticles.map(a => a.category))].join(', ') || 'Empty'}

YOUR CAPABILITIES:
1. Analyze ticket patterns and suggest resolutions
2. Identify which headwinds are causing user issues
3. Recommend knowledge base articles to create
4. Provide platform health assessments
5. Help draft responses to support tickets
6. Suggest operational improvements

CONSULTING CAPABILITIES (NEW):
7. get_consulting_pipeline - Show pipeline overview and lead statuses
8. get_engagement_details - Show details on active engagements, hours used
9. get_pending_contracts - Show contracts awaiting signature
10. get_consulting_revenue - Show revenue metrics and projections
11. get_upcoming_consulting_meetings - Show scheduled discovery/kickoff calls
12. get_consulting_leads - Show lead details with contact info
13. draft_meeting_agenda - Generate agenda for upcoming meetings (L3 DRAFT)
14. draft_progress_report - Generate client progress report (L3 DRAFT)

When drafting content (agendas, reports), ALWAYS mark as:
"[L3 DRAFT - Requires Jonathan's review before sending]"

COMMUNICATION STYLE:
- Be direct and professional - Jonathan is busy
- Lead with the most important information
- Use data to support recommendations
- Proactively identify patterns and issues
- Suggest specific actions when relevant
- For consulting: highlight urgent items (meetings today, contracts awaiting signature, leads going cold)
`;

    const systemPrompt = platformContext;

    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'zander' ? 'assistant' : msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return this.getZanderMockResponse(message, {
        openTickets,
        activeHeadwinds,
        p1Headwinds,
        consulting: {
          pipelineLeads: activePipelineLeads.length,
          pipelineValue,
          activeEngagements: totalActiveEngagements,
          pendingContracts: pendingContracts.length,
          upcomingMeetings: upcomingMeetings.length,
        },
      });
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
          max_tokens: 2048,
          system: systemPrompt,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Claude API error:', error);
        return this.getZanderMockResponse(message, {
        openTickets,
        activeHeadwinds,
        p1Headwinds,
        consulting: {
          pipelineLeads: activePipelineLeads.length,
          pipelineValue,
          activeEngagements: totalActiveEngagements,
          pendingContracts: pendingContracts.length,
          upcomingMeetings: upcomingMeetings.length,
        },
      });
      }

      const data = await response.json();
      
      // Generate suggested actions based on current state
      const actions: any[] = [];

      // ========================================
      // CONSULTING PRIORITY ACTIONS (check first)
      // ========================================

      // Priority 1: Meetings happening today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const meetingsToday = upcomingMeetings.filter(m => {
        const meetingDate = new Date(m.meetingScheduledAt!);
        return meetingDate >= today && meetingDate < tomorrow;
      });
      if (meetingsToday.length > 0) {
        actions.push({
          label: `📅 Meeting today: ${meetingsToday[0].name}`,
          action: 'view_lead',
          leadId: meetingsToday[0].id,
          priority: 'high'
        });
      }

      // Priority 2: Pending contracts (need signatures)
      if (pendingContracts.length > 0) {
        actions.push({
          label: `📝 ${pendingContracts.length} contract(s) awaiting signature`,
          action: 'view_pending_contracts',
          count: pendingContracts.length,
          priority: 'high'
        });
      }

      // Priority 3: New leads requiring follow-up
      const newLeads = consultingLeads.filter(l => l.status === 'NEW');
      if (newLeads.length > 0) {
        actions.push({
          label: `🔔 ${newLeads.length} new lead(s) need follow-up`,
          action: 'view_new_leads',
          count: newLeads.length,
          priority: 'medium'
        });
      }

      // Priority 4: Leads going cold (contacted but no meeting scheduled, 3+ days old)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const coldLeads = consultingLeads.filter(l =>
        l.status === 'CONTACTED' &&
        new Date(l.updatedAt) < threeDaysAgo
      );
      if (coldLeads.length > 0) {
        actions.push({
          label: `⚠️ ${coldLeads.length} lead(s) going cold`,
          action: 'view_cold_leads',
          count: coldLeads.length,
          priority: 'medium'
        });
      }

      // Priority 5: Engagements with low hours remaining (<10 hours)
      const lowHoursEngagements = consultingEngagements.filter(e =>
        (e.totalHours - e.hoursUsed) < 10
      );
      if (lowHoursEngagements.length > 0) {
        actions.push({
          label: `⏱️ ${lowHoursEngagements.length} engagement(s) low on hours`,
          action: 'view_low_hours',
          count: lowHoursEngagements.length,
          priority: 'medium'
        });
      }

      // ========================================
      // PLATFORM ACTIONS (existing)
      // ========================================

      // If there are open tickets, suggest viewing them
      const newTickets = tickets.filter(t => t.status === 'NEW');
      if (newTickets.length > 0) {
        const firstTicket = newTickets[0];
        actions.push({
          label: `View ${firstTicket.ticketNumber}`,
          action: 'view_ticket',
          ticketId: firstTicket.id,
          ticketNumber: firstTicket.ticketNumber
        });
      }

      // If there are unlinked tickets and active headwinds, suggest linking
      const unlinkedTickets = tickets.filter(t => !t.linkedHeadwindId && t.status !== 'CLOSED' && t.status !== 'RESOLVED');
      const activeHW = headwinds.filter(h => h.status !== 'CLOSED');
      if (unlinkedTickets.length > 0 && activeHW.length > 0) {
        const ticket = unlinkedTickets[0];
        actions.push({
          label: `Link ${ticket.ticketNumber} to Headwind`,
          action: 'suggest_link',
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber
        });
      }

      // Always add a dismiss option if there are actions
      if (actions.length > 0) {
        actions.push({ label: 'Dismiss', action: 'dismiss' });
      }

      return {
        content: data.content[0].text,
        context: {
          // Platform stats
          openTickets,
          activeHeadwinds,
          p1Headwinds,
          totalTenants: tenants.length,
          totalUsers: users,
          // Consulting stats (NEW)
          consulting: {
            pipelineLeads: activePipelineLeads.length,
            pipelineValue,
            activeEngagements: totalActiveEngagements,
            hoursRemaining: totalHoursRemaining,
            billableHours30d: totalBillableHours30d,
            estimatedMRR,
            pendingContracts: pendingContracts.length,
            upcomingMeetings: upcomingMeetings.length,
            recentEvents: recentConsultingEvents.length,
          },
        },
        actions: actions.length > 0 ? actions : undefined,
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      return this.getZanderMockResponse(message, {
        openTickets,
        activeHeadwinds,
        p1Headwinds,
        consulting: {
          pipelineLeads: activePipelineLeads.length,
          pipelineValue,
          activeEngagements: totalActiveEngagements,
          pendingContracts: pendingContracts.length,
          upcomingMeetings: upcomingMeetings.length,
        },
      });
    }
  }

  private getZanderMockResponse(message: string, stats: any): any {
    return {
      content: `**Platform & Consulting Status Summary**

**Platform:**
- **${stats.openTickets}** open support tickets
- **${stats.activeHeadwinds}** active headwinds (${stats.p1Headwinds} P1)

**Consulting Business:**
- **${stats.consulting?.pipelineLeads || 0}** leads in pipeline ($${(stats.consulting?.pipelineValue || 0).toLocaleString()} value)
- **${stats.consulting?.activeEngagements || 0}** active engagements
- **${stats.consulting?.pendingContracts || 0}** contracts awaiting signature
- **${stats.consulting?.upcomingMeetings || 0}** upcoming meetings

Regarding your question about "${message.substring(0, 50)}...":

I'm ready to help analyze this. The full AI integration will provide deeper insights, but I can tell you the system is operational and I'm tracking all platform and consulting activity.

What specific aspect would you like me to focus on?`,
      context: stats,
    };
  }

  /**
   * Generate a comprehensive daily briefing for Jonathan
   * Includes platform health, consulting pipeline, and priority items
   */
  async getZanderDailyBriefing(): Promise<any> {
    // Fetch all the data we need for the briefing
    const [
      // Platform data
      tickets,
      headwinds,
      tenants,
      // Consulting data
      consultingLeads,
      consultingEngagements,
      pendingContracts,
      recentEvents,
      timeEntries30d,
    ] = await Promise.all([
      // Support tickets
      this.prisma.supportTicket.findMany({
        where: {
          status: { in: ['NEW', 'IN_PROGRESS'] },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { companyName: true } },
        },
      }),
      // Headwinds
      this.prisma.headwind.findMany({
        where: { status: { not: 'CLOSED' } },
        orderBy: { priority: 'asc' },
      }),
      // Tenants summary
      this.prisma.tenant.findMany({
        include: { _count: { select: { users: true } } },
      }),
      // Consulting leads
      this.prisma.consultingLead.findMany({
        where: { status: { notIn: ['WON', 'LOST'] } },
        orderBy: { createdAt: 'desc' },
        include: {
          proposals: { select: { id: true, status: true } },
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
        include: { lead: { select: { name: true, company: true } } },
      }),
      // Recent events (7 days)
      this.prisma.consultingEvent.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Time entries last 30 days
      this.prisma.consultingTimeEntry.findMany({
        where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        include: { tenant: { select: { companyName: true } } },
      }),
    ]);

    // Calculate metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Meetings today
    const meetingsToday = consultingLeads.filter(l => {
      if (!l.meetingScheduledAt) return false;
      const meetingDate = new Date(l.meetingScheduledAt);
      return meetingDate >= today && meetingDate < tomorrow;
    });

    // Leads by status
    const leadsByStatus = {
      NEW: consultingLeads.filter(l => l.status === 'NEW'),
      CONTACTED: consultingLeads.filter(l => l.status === 'CONTACTED'),
      MEETING_SCHEDULED: consultingLeads.filter(l => l.status === 'MEETING_SCHEDULED'),
      MEETING_COMPLETED: consultingLeads.filter(l => l.status === 'MEETING_COMPLETED'),
      PROPOSAL_SENT: consultingLeads.filter(l => l.status === 'PROPOSAL_SENT'),
      NEGOTIATING: consultingLeads.filter(l => l.status === 'NEGOTIATING'),
    };

    // Cold leads (contacted but stale)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const coldLeads = consultingLeads.filter(l =>
      l.status === 'CONTACTED' && new Date(l.updatedAt) < threeDaysAgo
    );

    // Engagements with low hours
    const lowHoursEngagements = consultingEngagements.filter(e =>
      (e.totalHours - e.hoursUsed) < 10
    );

    // Pipeline value
    const pipelineValue = consultingLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

    // Billable hours last 30 days
    const billableHours30d = timeEntries30d.reduce((sum, e) => sum + (e.billableHours || 0), 0);

    // Build the briefing structure
    const briefing = {
      generatedAt: new Date().toISOString(),
      greeting: this.getTimeBasedGreeting(),

      // Priority items requiring attention
      priorityItems: [] as any[],

      // Platform summary
      platform: {
        openTickets: tickets.length,
        p1Headwinds: headwinds.filter(h => h.priority === 'P1').length,
        activeHeadwinds: headwinds.length,
        totalTenants: tenants.length,
        totalUsers: tenants.reduce((sum, t) => sum + t._count.users, 0),
      },

      // Consulting summary
      consulting: {
        pipeline: {
          totalLeads: consultingLeads.length,
          pipelineValue,
          byStatus: {
            NEW: leadsByStatus.NEW.length,
            CONTACTED: leadsByStatus.CONTACTED.length,
            MEETING_SCHEDULED: leadsByStatus.MEETING_SCHEDULED.length,
            MEETING_COMPLETED: leadsByStatus.MEETING_COMPLETED.length,
            PROPOSAL_SENT: leadsByStatus.PROPOSAL_SENT.length,
            NEGOTIATING: leadsByStatus.NEGOTIATING.length,
          },
        },
        engagements: {
          active: consultingEngagements.length,
          hoursRemaining: consultingEngagements.reduce((sum, e) => sum + (e.totalHours - e.hoursUsed), 0),
          billableHours30d,
        },
        meetings: {
          today: meetingsToday.map(m => ({
            name: m.name,
            company: m.company,
            time: m.meetingScheduledAt,
            package: m.interestedPackage,
          })),
        },
        pendingContracts: pendingContracts.map(d => ({
          type: d.type,
          leadName: d.lead?.name,
          company: d.lead?.company,
        })),
        recentActivity: recentEvents.slice(0, 5).map(e => ({
          type: e.type,
          description: e.description,
          timestamp: e.createdAt,
        })),
      },

      // Detailed lists for each section
      details: {
        meetingsToday: meetingsToday.map(m => ({
          id: m.id,
          name: m.name,
          company: m.company,
          email: m.email,
          time: m.meetingScheduledAt,
          package: m.interestedPackage,
          status: m.status,
        })),
        newLeads: leadsByStatus.NEW.map(l => ({
          id: l.id,
          name: l.name,
          company: l.company,
          email: l.email,
          source: l.source,
          estimatedValue: l.estimatedValue,
          createdAt: l.createdAt,
        })),
        coldLeads: coldLeads.map(l => ({
          id: l.id,
          name: l.name,
          company: l.company,
          daysSinceUpdate: Math.floor((Date.now() - new Date(l.updatedAt).getTime()) / (24 * 60 * 60 * 1000)),
        })),
        lowHoursEngagements: lowHoursEngagements.map(e => ({
          id: e.id,
          company: e.tenant?.companyName,
          package: e.packageType,
          hoursRemaining: e.totalHours - e.hoursUsed,
          pendingDeliverables: e.deliverables?.length || 0,
        })),
        openTickets: tickets.slice(0, 5).map(t => ({
          id: t.id,
          ticketNumber: t.ticketNumber,
          subject: t.subject,
          status: t.status,
          company: t.tenant?.companyName,
        })),
      },
    };

    // Build priority items (things needing immediate attention)
    if (meetingsToday.length > 0) {
      briefing.priorityItems.push({
        type: 'MEETING_TODAY',
        priority: 'HIGH',
        message: `${meetingsToday.length} meeting(s) scheduled today`,
        items: meetingsToday.map(m => `${m.name} (${m.company || 'no company'}) - ${m.interestedPackage || 'undecided'}`),
      });
    }

    if (pendingContracts.length > 0) {
      briefing.priorityItems.push({
        type: 'PENDING_CONTRACTS',
        priority: 'HIGH',
        message: `${pendingContracts.length} contract(s) awaiting signature`,
        items: pendingContracts.map(d => `${d.type}: ${d.lead?.name || 'Unknown'}`),
      });
    }

    if (leadsByStatus.NEW.length > 0) {
      briefing.priorityItems.push({
        type: 'NEW_LEADS',
        priority: 'MEDIUM',
        message: `${leadsByStatus.NEW.length} new lead(s) need follow-up`,
        items: leadsByStatus.NEW.map(l => `${l.name} (${l.company || 'no company'}) - $${(l.estimatedValue || 0).toLocaleString()}`),
      });
    }

    if (coldLeads.length > 0) {
      briefing.priorityItems.push({
        type: 'COLD_LEADS',
        priority: 'MEDIUM',
        message: `${coldLeads.length} lead(s) going cold (no activity 3+ days)`,
        items: coldLeads.map(l => `${l.name} - contacted ${Math.floor((Date.now() - new Date(l.updatedAt).getTime()) / (24 * 60 * 60 * 1000))} days ago`),
      });
    }

    if (lowHoursEngagements.length > 0) {
      briefing.priorityItems.push({
        type: 'LOW_HOURS',
        priority: 'MEDIUM',
        message: `${lowHoursEngagements.length} engagement(s) running low on hours`,
        items: lowHoursEngagements.map(e => `${e.tenant?.companyName}: ${(e.totalHours - e.hoursUsed).toFixed(1)} hrs remaining`),
      });
    }

    if (tickets.filter(t => t.status === 'NEW').length > 0) {
      const newTickets = tickets.filter(t => t.status === 'NEW');
      briefing.priorityItems.push({
        type: 'NEW_TICKETS',
        priority: 'LOW',
        message: `${newTickets.length} new support ticket(s)`,
        items: newTickets.slice(0, 3).map(t => `[${t.ticketNumber}] ${t.subject}`),
      });
    }

    return briefing;
  }

  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Jonathan.';
    if (hour < 17) return 'Good afternoon, Jonathan.';
    return 'Good evening, Jonathan.';
  }

}