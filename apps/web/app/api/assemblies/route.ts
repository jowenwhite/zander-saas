import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { AssemblyType, AssemblyCadence, AssemblyStatus } from '@prisma/client';

// Default section prompts for each assembly type
const DEFAULT_SECTIONS: Record<AssemblyType, Array<{ executive: string; title: string; prompt: string; order: number }>> = {
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

// GET /api/assemblies - List assemblies
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as AssemblyType | null;
    const status = searchParams.get('status') as AssemblyStatus | null;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (type) where.type = type;
    if (status) where.status = status;

    const assemblies = await prisma.assembly.findMany({
      where,
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assemblies });
  } catch (error) {
    console.error('Error fetching assemblies:', error);
    return NextResponse.json({ error: 'Failed to fetch assemblies' }, { status: 500 });
  }
}

// POST /api/assemblies - Create assembly
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, cadence, scheduledFor, customSections, treasuryTemplateId } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // Get default sections for this type, or use custom sections if provided
    const sectionsToCreate = customSections || DEFAULT_SECTIONS[type as AssemblyType] || [];

    const assembly = await prisma.assembly.create({
      data: {
        tenantId: user.tenantId,
        name,
        type: type as AssemblyType,
        cadence: (cadence as AssemblyCadence) || 'ONCE',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        treasuryTemplateId,
        createdById: user.id,
        sections: {
          create: sectionsToCreate.map((section: { executive: string; title: string; prompt: string; order: number }) => ({
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

    return NextResponse.json({ assembly });
  } catch (error) {
    console.error('Error creating assembly:', error);
    return NextResponse.json({ error: 'Failed to create assembly' }, { status: 500 });
  }
}
