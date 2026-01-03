import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface Executive {
  id: string;
  name: string;
  role: string;
  fullTitle: string;
  personality: string;
}

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
  constructor(private prisma: PrismaService) {}

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

    // Get context data for the tenant
    const [deals, contacts, activities] = await Promise.all([
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
`;

    
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
    const systemPrompt = `${executive.personality}

${businessContext}
${knowledgeContext}

Remember: You are ${executive.name}, the ${executive.fullTitle}. Stay in character and provide helpful, actionable advice based on your expertise. Reference the business context when relevant to personalize your advice.

IMPORTANT: If the user asks about how to use Zander, platform features, or needs help with the software, refer to the PLATFORM KNOWLEDGE BASE section above. Provide accurate information based on the knowledge articles. If you don't have relevant knowledge articles, let the user know you'll escalate to support.`;

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
        return this.getMockResponse(executive, message);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        executive: {
          id: executive.id,
          name: executive.name,
          role: executive.role,
        },
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      return this.getMockResponse(executive, message);
    }
  }

  private getMockResponse(executive: Executive, message: string): any {
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

    return {
      content: response,
      executive: {
        id: executive.id,
        name: executive.name,
        role: executive.role,
      },
    };
  }


  async zanderChat(userId: string, message: string, conversationHistory: any[] = []) {
    // Zander is the master AI - Jonathan only, full platform visibility
    
    // Get platform-wide context
    const [tickets, headwinds, tenants, knowledgeArticles, users] = await Promise.all([
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
    ]);

    // Calculate platform stats
    const openTickets = tickets.filter(t => t.status === 'NEW' || t.status === 'IN_PROGRESS').length;
    const p1Headwinds = headwinds.filter(h => h.priority === 'P1' && h.status !== 'CLOSED').length;
    const activeHeadwinds = headwinds.filter(h => h.status !== 'CLOSED').length;

    // Build comprehensive platform context
    const platformContext = `
ZANDER PLATFORM OPERATIONS CONTEXT
==================================
You are Zander, the master operations AI for the Zander SaaS platform. You report directly to Jonathan White, the founder and CEO. Your role is to help Jonathan manage platform operations, analyze support patterns, and maintain system health.

CURRENT PLATFORM STATUS:
- Total Tenants: ${tenants.length}
- Total Users: ${users}
- Open Support Tickets: ${openTickets}
- Active Headwinds: ${activeHeadwinds} (${p1Headwinds} P1 critical)
- Knowledge Articles: ${knowledgeArticles.length}

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

COMMUNICATION STYLE:
- Be direct and professional - Jonathan is busy
- Lead with the most important information
- Use data to support recommendations
- Proactively identify patterns and issues
- Suggest specific actions when relevant
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
      return this.getZanderMockResponse(message, { openTickets, activeHeadwinds, p1Headwinds });
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
        return this.getZanderMockResponse(message, { openTickets, activeHeadwinds, p1Headwinds });
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        context: {
          openTickets,
          activeHeadwinds,
          p1Headwinds,
          totalTenants: tenants.length,
          totalUsers: users,
        },
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      return this.getZanderMockResponse(message, { openTickets, activeHeadwinds, p1Headwinds });
    }
  }

  private getZanderMockResponse(message: string, stats: any): any {
    return {
      content: `**Platform Status Summary**

Based on current data:
- **${stats.openTickets}** open support tickets
- **${stats.activeHeadwinds}** active headwinds (${stats.p1Headwinds} P1)

Regarding your question about "${message.substring(0, 50)}...":

I'm ready to help analyze this. The full AI integration will provide deeper insights, but I can tell you the system is operational and I'm tracking all incoming issues.

What specific aspect would you like me to focus on?`,
      context: stats,
    };
  }

}