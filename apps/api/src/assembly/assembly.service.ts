import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AssemblyType, AssemblyCadence, AssemblyStatus, SectionStatus } from '@prisma/client';
import { CreateAssemblyDto, UpdateAssemblyDto, RunSectionDto, SectionDto } from './dto/create-assembly.dto';

// Default section prompts for each assembly type
const DEFAULT_SECTIONS: Record<AssemblyType, SectionDto[]> = {
  WEEKLY_ALL_HANDS: [
    {
      executive: 'jordan',
      title: 'Pipeline Update',
      prompt: 'Provide a pipeline update for this week. Include: total open deals and weighted value, deals that advanced stages this week, any new deals added, top 3 deals to watch, and any overdue follow-ups that need attention.',
      order: 1,
    },
    {
      executive: 'don',
      title: 'Marketing Update',
      prompt: 'Provide a marketing update for this week. Include: campaign performance highlights, content published, key metrics movement, upcoming marketing activities, and any urgent items needing attention.',
      order: 2,
    },
    {
      executive: 'pam',
      title: 'Tasks & Agenda',
      prompt: 'Provide a summary of tasks and agenda items. Include: overdue tasks, tasks due this week, upcoming calendar events, and any operational items requiring attention.',
      order: 3,
    },
  ],
  MONTHLY_BOARD_REPORT: [
    {
      executive: 'jordan',
      title: 'Revenue & Pipeline Review',
      prompt: 'Provide a monthly revenue and pipeline review. Include: revenue closed this month vs target, pipeline value and stage distribution, win/loss analysis, key account updates, and forecast for next month.',
      order: 1,
    },
    {
      executive: 'don',
      title: 'Marketing Performance',
      prompt: 'Provide a monthly marketing performance review. Include: lead generation metrics, campaign ROI, content performance, brand awareness indicators, and strategic initiatives progress.',
      order: 2,
    },
    {
      executive: 'pam',
      title: 'Operational Summary',
      prompt: 'Provide a monthly operational summary. Include: task completion rate, key milestones achieved, operational challenges, resource utilization, and upcoming month priorities.',
      order: 3,
    },
  ],
  QUARTERLY_REVIEW: [
    {
      executive: 'jordan',
      title: 'Sales Quarter Review',
      prompt: 'Provide a comprehensive quarterly sales review. Include: revenue vs quota, deal velocity trends, customer acquisition metrics, sales team performance, competitive wins/losses, and Q+1 sales priorities.',
      order: 1,
    },
    {
      executive: 'don',
      title: 'Marketing Quarter Review',
      prompt: 'Provide a comprehensive quarterly marketing review. Include: campaign performance, brand health metrics, market positioning, content strategy effectiveness, and Q+1 marketing priorities.',
      order: 2,
    },
    {
      executive: 'pam',
      title: 'Operations Quarter Review',
      prompt: 'Provide a comprehensive quarterly operations review. Include: goal progress, process improvements, team coordination metrics, resource allocation, and Q+1 operational priorities.',
      order: 3,
    },
  ],
  PROJECT_KICKOFF: [
    {
      executive: 'jordan',
      title: 'Deal Context & Client Background',
      prompt: 'Provide the deal context and client background for this project kickoff. Include: client company overview, decision makers involved, deal history, client goals and success criteria, and any special requirements.',
      order: 1,
    },
    {
      executive: 'pam',
      title: 'Timeline & Coordination',
      prompt: 'Provide the project timeline and coordination plan. Include: key milestones, task assignments, resource requirements, communication plan, and risk considerations.',
      order: 2,
    },
  ],
  ANNUAL_STRATEGIC_PLAN: [
    {
      executive: 'jordan',
      title: 'Revenue Targets & Strategy',
      prompt: 'Provide annual revenue targets and sales strategy. Include: revenue goals by quarter, target markets, key account strategy, sales process improvements, and competitive positioning.',
      order: 1,
    },
    {
      executive: 'don',
      title: 'Marketing Objectives & Plan',
      prompt: 'Provide annual marketing objectives and strategic plan. Include: brand goals, campaign themes by quarter, channel strategy, content calendar overview, and budget allocation.',
      order: 2,
    },
    {
      executive: 'pam',
      title: 'Operational Priorities',
      prompt: 'Provide annual operational priorities. Include: process improvement goals, team development plans, technology investments, efficiency targets, and calendar of major initiatives.',
      order: 3,
    },
  ],
};

// Executive-specific system prompts for assembly sections
const SYSTEM_PROMPTS: Record<string, string> = {
  jordan: `You are Jordan, Chief Revenue Officer at Zander. You are writing a section for a business assembly document. Be confident, data-driven, and strategic. Focus on revenue metrics, pipeline health, and sales performance. Write in clear, professional prose suitable for a business report.`,
  don: `You are Don, Chief Marketing Officer at Zander. You are writing a section for a business assembly document. Be creative yet strategic. Focus on marketing performance, brand positioning, and growth initiatives. Write in clear, professional prose suitable for a business report.`,
  pam: `You are Pam, Executive Assistant at Zander. You are writing a section for a business assembly document. Be organized and thorough. Focus on operational status, coordination, and next steps. Write in clear, professional prose suitable for a business report.`,
  ben: `You are Ben, Chief Financial Officer at Zander. Note: Ben is coming soon. Provide a placeholder acknowledging this section will be available when Ben is launched.`,
  miranda: `You are Miranda, Chief Operations Officer at Zander. Note: Miranda is coming soon. Provide a placeholder acknowledging this section will be available when Miranda is launched.`,
  ted: `You are Ted, Chief People Officer at Zander. Note: Ted is coming soon. Provide a placeholder acknowledging this section will be available when Ted is launched.`,
  jarvis: `You are Jarvis, Chief Information Officer at Zander. Note: Jarvis is coming soon. Provide a placeholder acknowledging this section will be available when Jarvis is launched.`,
};

const COMING_SOON_EXECUTIVES = ['ben', 'miranda', 'ted', 'jarvis'];
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

@Injectable()
export class AssemblyService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async findAll(tenantId: string, query: { type?: string; status?: string }) {
    const where: any = { tenantId };
    if (query.type) where.type = query.type as AssemblyType;
    if (query.status) where.status = query.status as AssemblyStatus;

    return this.prisma.assembly.findMany({
      where,
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const assembly = await this.prisma.assembly.findFirst({
      where: { id, tenantId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!assembly) {
      throw new NotFoundException('Assembly not found');
    }

    return assembly;
  }

  async create(dto: CreateAssemblyDto, tenantId: string, userId: string) {
    // Get default sections for this type, or use custom sections if provided
    const sectionsToCreate = dto.customSections || DEFAULT_SECTIONS[dto.type] || [];

    return this.prisma.assembly.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        cadence: dto.cadence || AssemblyCadence.ONCE,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        treasuryTemplateId: dto.treasuryTemplateId,
        createdById: userId,
        sections: {
          create: sectionsToCreate.map((section) => ({
            executive: section.executive,
            title: section.title,
            prompt: section.prompt,
            order: section.order,
          })),
        },
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async update(id: string, dto: UpdateAssemblyDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.cadence !== undefined) updateData.cadence = dto.cadence;
    if (dto.scheduledFor !== undefined) {
      updateData.scheduledFor = dto.scheduledFor ? new Date(dto.scheduledFor) : null;
    }
    if (dto.status !== undefined) updateData.status = dto.status as AssemblyStatus;

    return this.prisma.assembly.update({
      where: { id },
      data: updateData,
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async archive(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.assembly.update({
      where: { id },
      data: { status: AssemblyStatus.ARCHIVED },
    });

    return { success: true };
  }

  async runAll(id: string, tenantId: string, authToken: string) {
    const assembly = await this.findOne(id, tenantId);

    // Set assembly status to RUNNING
    await this.prisma.assembly.update({
      where: { id },
      data: { status: AssemblyStatus.RUNNING },
    });

    // Process each section
    const results: Array<{ sectionId: string; success: boolean; error?: string }> = [];

    for (const section of assembly.sections) {
      try {
        // Update section status to GENERATING
        await this.prisma.assemblySection.update({
          where: { id: section.id },
          data: { status: SectionStatus.GENERATING },
        });

        // Get context based on executive
        const context = await this.getExecutiveContext(section.executive, tenantId, authToken);

        // Generate content
        const content = await this.generateSectionContent(
          section.executive,
          section.prompt,
          context,
        );

        // Update section with content
        await this.prisma.assemblySection.update({
          where: { id: section.id },
          data: {
            content,
            status: SectionStatus.COMPLETE,
            generatedAt: new Date(),
          },
        });

        results.push({ sectionId: section.id, success: true });
      } catch (error) {
        console.error(`Error generating section ${section.id}:`, error);

        // Update section status to FAILED
        await this.prisma.assemblySection.update({
          where: { id: section.id },
          data: { status: SectionStatus.FAILED },
        });

        results.push({
          sectionId: section.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update assembly status based on results
    const allSuccess = results.every((r) => r.success);
    const anySuccess = results.some((r) => r.success);

    await this.prisma.assembly.update({
      where: { id },
      data: {
        status: allSuccess ? AssemblyStatus.COMPLETE : anySuccess ? AssemblyStatus.COMPLETE : AssemblyStatus.DRAFT,
        completedAt: anySuccess ? new Date() : null,
      },
    });

    // Fetch updated assembly
    const updatedAssembly = await this.prisma.assembly.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      assembly: updatedAssembly,
      results,
    };
  }

  async runSection(
    assemblyId: string,
    sectionId: string,
    tenantId: string,
    authToken: string,
    dto?: RunSectionDto,
  ) {
    // Verify assembly ownership and get section
    const assembly = await this.prisma.assembly.findFirst({
      where: { id: assemblyId, tenantId },
      include: {
        sections: {
          where: { id: sectionId },
        },
      },
    });

    if (!assembly || assembly.sections.length === 0) {
      throw new NotFoundException('Section not found');
    }

    const section = assembly.sections[0];

    // Update section status to GENERATING
    await this.prisma.assemblySection.update({
      where: { id: sectionId },
      data: { status: SectionStatus.GENERATING },
    });

    try {
      // Get context based on executive
      const context = await this.getExecutiveContext(section.executive, tenantId, authToken);

      // Use updated prompt if provided
      const prompt = dto?.prompt || section.prompt;

      // Generate content
      const content = await this.generateSectionContent(section.executive, prompt, context);

      // Update section with content
      const updatedSection = await this.prisma.assemblySection.update({
        where: { id: sectionId },
        data: {
          content,
          prompt, // Update prompt if it was changed
          status: SectionStatus.COMPLETE,
          generatedAt: new Date(),
        },
      });

      return { section: updatedSection };
    } catch (error) {
      // Update section status to FAILED
      await this.prisma.assemblySection.update({
        where: { id: sectionId },
        data: { status: SectionStatus.FAILED },
      });

      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate section',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getExecutiveContext(
    executive: string,
    tenantId: string,
    authToken: string,
  ): Promise<string> {
    const apiUrl = this.configService.get<string>('API_URL') || 'https://api.zanderos.com';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
      'x-tenant-id': tenantId,
    };

    switch (executive) {
      case 'jordan':
        return this.getJordanContext(apiUrl, headers, tenantId);
      case 'don':
        return this.getDonContext(apiUrl, headers, tenantId);
      case 'pam':
        return this.getPamContext(apiUrl, headers);
      default:
        return 'No specific context available.';
    }
  }

  private async getJordanContext(
    apiUrl: string,
    headers: Record<string, string>,
    tenantId: string,
  ): Promise<string> {
    try {
      const dealsRes = await fetch(`${apiUrl}/deals?tenantId=${tenantId}&limit=10`, { headers });
      const deals = dealsRes.ok ? await dealsRes.json() : [];

      const openDeals = Array.isArray(deals) ? deals : deals.data || [];
      const totalValue = openDeals.reduce(
        (sum: number, d: { dealValue?: number }) => sum + (d.dealValue || 0),
        0,
      );
      const wonDeals = openDeals.filter((d: { stage?: string }) => d.stage === 'CLOSED_WON');
      const wonValue = wonDeals.reduce(
        (sum: number, d: { dealValue?: number }) => sum + (d.dealValue || 0),
        0,
      );

      return `
**Pipeline Context:**
- Total open deals: ${openDeals.length}
- Total pipeline value: $${totalValue.toLocaleString()}
- Won this period: ${wonDeals.length} deals worth $${wonValue.toLocaleString()}
- Top 5 deals by value: ${openDeals
        .slice(0, 5)
        .map(
          (d: { dealName?: string; dealValue?: number; stage?: string }) =>
            `${d.dealName} ($${d.dealValue?.toLocaleString()} - ${d.stage})`,
        )
        .join(', ')}
`;
    } catch (error) {
      console.error('Error fetching Jordan context:', error);
      return 'Pipeline data unavailable.';
    }
  }

  private async getDonContext(
    apiUrl: string,
    headers: Record<string, string>,
    tenantId: string,
  ): Promise<string> {
    try {
      const campaignsRes = await fetch(`${apiUrl}/campaigns?tenantId=${tenantId}&limit=10`, {
        headers,
      });
      const campaigns = campaignsRes.ok ? await campaignsRes.json() : [];

      const campaignList = Array.isArray(campaigns) ? campaigns : campaigns.data || [];
      const activeCampaigns = campaignList.filter(
        (c: { status?: string }) => c.status === 'active',
      );

      return `
**Marketing Context:**
- Total campaigns: ${campaignList.length}
- Active campaigns: ${activeCampaigns.length}
- Recent campaigns: ${campaignList
        .slice(0, 3)
        .map((c: { name?: string; status?: string }) => `${c.name} (${c.status})`)
        .join(', ')}
`;
    } catch (error) {
      console.error('Error fetching Don context:', error);
      return 'Marketing data unavailable.';
    }
  }

  private async getPamContext(
    apiUrl: string,
    headers: Record<string, string>,
  ): Promise<string> {
    try {
      const tasksRes = await fetch(`${apiUrl}/tasks?status=open&limit=20`, { headers });
      const tasksData = tasksRes.ok ? await tasksRes.json() : { data: [] };
      const tasks = tasksData.data || [];

      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const eventsRes = await fetch(
        `${apiUrl}/calendar-events?startDate=${today.toISOString().split('T')[0]}&endDate=${nextWeek.toISOString().split('T')[0]}`,
        { headers },
      );
      const events = eventsRes.ok ? await eventsRes.json() : [];
      const eventList = Array.isArray(events) ? events : [];

      const highPriorityTasks = tasks.filter((t: { priority?: string }) => t.priority === 'HIGH');
      const overdueTasks = tasks.filter(
        (t: { dueDate?: string }) => t.dueDate && new Date(t.dueDate) < today,
      );

      return `
**Operations Context:**
- Open tasks: ${tasks.length}
- High priority: ${highPriorityTasks.length}
- Overdue: ${overdueTasks.length}
- Upcoming events (7 days): ${eventList.length}
- Next events: ${eventList
        .slice(0, 3)
        .map(
          (e: { title?: string; startTime?: string }) =>
            `${e.title} (${new Date(e.startTime || '').toLocaleDateString()})`,
        )
        .join(', ')}
`;
    } catch (error) {
      console.error('Error fetching Pam context:', error);
      return 'Operations data unavailable.';
    }
  }

  private async generateSectionContent(
    executive: string,
    prompt: string,
    context: string,
  ): Promise<string> {
    const anthropicApiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Check if executive is coming soon
    if (COMING_SOON_EXECUTIVES.includes(executive)) {
      return `*This section will be available when ${executive.charAt(0).toUpperCase() + executive.slice(1)} joins the Zander executive team. Stay tuned!*`;
    }

    const systemPrompt = SYSTEM_PROMPTS[executive] || SYSTEM_PROMPTS.pam;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `${context}\n\n**Your Task:**\n${prompt}\n\nWrite a clear, professional section for this assembly document. Use markdown formatting for headings and lists where appropriate. Be specific and actionable.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error for ${executive}:`, errorText);
      throw new Error(`Failed to generate content: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('');

    return textContent;
  }
}
