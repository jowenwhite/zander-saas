import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Executive API routes
const EXECUTIVE_ROUTES: Record<string, string> = {
  jordan: '/api/cro/jordan',
  don: '/api/cmo/don',
  pam: '/api/ea/pam',
  zander: '/api/admin/zander',
};

// Context fetchers for each executive
async function getJordanContext(tenantId: string, authToken: string): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
    'x-tenant-id': tenantId,
  };

  try {
    // Fetch pipeline summary
    const dealsRes = await fetch(`${apiUrl}/deals?tenantId=${tenantId}&limit=10`, { headers });
    const deals = dealsRes.ok ? await dealsRes.json() : [];

    const openDeals = Array.isArray(deals) ? deals : (deals.data || []);
    const totalValue = openDeals.reduce((sum: number, d: { dealValue?: number }) => sum + (d.dealValue || 0), 0);
    const wonDeals = openDeals.filter((d: { stage?: string }) => d.stage === 'CLOSED_WON');
    const wonValue = wonDeals.reduce((sum: number, d: { dealValue?: number }) => sum + (d.dealValue || 0), 0);

    return `
**Pipeline Context:**
- Total open deals: ${openDeals.length}
- Total pipeline value: $${totalValue.toLocaleString()}
- Won this period: ${wonDeals.length} deals worth $${wonValue.toLocaleString()}
- Top 5 deals by value: ${openDeals.slice(0, 5).map((d: { dealName?: string; dealValue?: number; stage?: string }) => `${d.dealName} ($${d.dealValue?.toLocaleString()} - ${d.stage})`).join(', ')}
`;
  } catch (error) {
    console.error('Error fetching Jordan context:', error);
    return 'Pipeline data unavailable.';
  }
}

async function getDonContext(tenantId: string, authToken: string): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
    'x-tenant-id': tenantId,
  };

  try {
    // Fetch campaigns
    const campaignsRes = await fetch(`${apiUrl}/campaigns?tenantId=${tenantId}&limit=10`, { headers });
    const campaigns = campaignsRes.ok ? await campaignsRes.json() : [];

    const campaignList = Array.isArray(campaigns) ? campaigns : (campaigns.data || []);
    const activeCampaigns = campaignList.filter((c: { status?: string }) => c.status === 'active');

    return `
**Marketing Context:**
- Total campaigns: ${campaignList.length}
- Active campaigns: ${activeCampaigns.length}
- Recent campaigns: ${campaignList.slice(0, 3).map((c: { name?: string; status?: string }) => `${c.name} (${c.status})`).join(', ')}
`;
  } catch (error) {
    console.error('Error fetching Don context:', error);
    return 'Marketing data unavailable.';
  }
}

async function getPamContext(tenantId: string, authToken: string): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
    'x-tenant-id': tenantId,
  };

  try {
    // Fetch tasks
    const tasksRes = await fetch(`${apiUrl}/tasks?status=open&limit=20`, { headers });
    const tasksData = tasksRes.ok ? await tasksRes.json() : { data: [] };
    const tasks = tasksData.data || [];

    // Fetch upcoming events
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const eventsRes = await fetch(
      `${apiUrl}/calendar-events?tenantId=${tenantId}&startDate=${today.toISOString().split('T')[0]}&endDate=${nextWeek.toISOString().split('T')[0]}`,
      { headers }
    );
    const events = eventsRes.ok ? await eventsRes.json() : [];
    const eventList = Array.isArray(events) ? events : [];

    const highPriorityTasks = tasks.filter((t: { priority?: string }) => t.priority === 'HIGH');
    const overdueTasks = tasks.filter((t: { dueDate?: string }) => t.dueDate && new Date(t.dueDate) < today);

    return `
**Operations Context:**
- Open tasks: ${tasks.length}
- High priority: ${highPriorityTasks.length}
- Overdue: ${overdueTasks.length}
- Upcoming events (7 days): ${eventList.length}
- Next events: ${eventList.slice(0, 3).map((e: { title?: string; startTime?: string }) => `${e.title} (${new Date(e.startTime || '').toLocaleDateString()})`).join(', ')}
`;
  } catch (error) {
    console.error('Error fetching Pam context:', error);
    return 'Operations data unavailable.';
  }
}

// Generate content for a section using Claude directly
async function generateSectionContent(
  executive: string,
  prompt: string,
  context: string,
  tenantId: string
): Promise<string> {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Executive-specific system prompts for assembly sections
  const systemPrompts: Record<string, string> = {
    jordan: `You are Jordan, Chief Revenue Officer at Zander. You are writing a section for a business assembly document. Be confident, data-driven, and strategic. Focus on revenue metrics, pipeline health, and sales performance. Write in clear, professional prose suitable for a business report.`,
    don: `You are Don, Chief Marketing Officer at Zander. You are writing a section for a business assembly document. Be creative yet strategic. Focus on marketing performance, brand positioning, and growth initiatives. Write in clear, professional prose suitable for a business report.`,
    pam: `You are Pam, Executive Assistant at Zander. You are writing a section for a business assembly document. Be organized and thorough. Focus on operational status, coordination, and next steps. Write in clear, professional prose suitable for a business report.`,
    ben: `You are Ben, Chief Financial Officer at Zander. Note: Ben is coming soon. Provide a placeholder acknowledging this section will be available when Ben is launched.`,
    miranda: `You are Miranda, Chief Operations Officer at Zander. Note: Miranda is coming soon. Provide a placeholder acknowledging this section will be available when Miranda is launched.`,
    ted: `You are Ted, Chief People Officer at Zander. Note: Ted is coming soon. Provide a placeholder acknowledging this section will be available when Ted is launched.`,
    jarvis: `You are Jarvis, Chief Information Officer at Zander. Note: Jarvis is coming soon. Provide a placeholder acknowledging this section will be available when Jarvis is launched.`,
  };

  const systemPrompt = systemPrompts[executive] || systemPrompts.pam;

  // Check if executive is coming soon
  const comingSoonExecutives = ['ben', 'miranda', 'ted', 'jarvis'];
  if (comingSoonExecutives.includes(executive)) {
    return `*This section will be available when ${executive.charAt(0).toUpperCase() + executive.slice(1)} joins the Zander executive team. Stay tuned!*`;
  }

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

// POST /api/assemblies/:id/run - Run all sections of an assembly
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const authHeader = request.headers.get('authorization') || '';
    const authToken = authHeader.replace('Bearer ', '');

    // Fetch the assembly with sections
    const assembly = await prisma.assembly.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!assembly) {
      return NextResponse.json({ error: 'Assembly not found' }, { status: 404 });
    }

    // Set assembly status to RUNNING
    await prisma.assembly.update({
      where: { id },
      data: { status: 'RUNNING' },
    });

    // Process each section
    const results: Array<{ sectionId: string; success: boolean; error?: string }> = [];

    for (const section of assembly.sections) {
      try {
        // Update section status to GENERATING
        await prisma.assemblySection.update({
          where: { id: section.id },
          data: { status: 'GENERATING' },
        });

        // Get context based on executive
        let context = '';
        switch (section.executive) {
          case 'jordan':
            context = await getJordanContext(user.tenantId, authToken);
            break;
          case 'don':
            context = await getDonContext(user.tenantId, authToken);
            break;
          case 'pam':
            context = await getPamContext(user.tenantId, authToken);
            break;
          default:
            context = 'No specific context available.';
        }

        // Generate content
        const content = await generateSectionContent(
          section.executive,
          section.prompt,
          context,
          user.tenantId
        );

        // Update section with content
        await prisma.assemblySection.update({
          where: { id: section.id },
          data: {
            content,
            status: 'COMPLETE',
            generatedAt: new Date(),
          },
        });

        results.push({ sectionId: section.id, success: true });
      } catch (error) {
        console.error(`Error generating section ${section.id}:`, error);

        // Update section status to FAILED
        await prisma.assemblySection.update({
          where: { id: section.id },
          data: { status: 'FAILED' },
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

    await prisma.assembly.update({
      where: { id },
      data: {
        status: allSuccess ? 'COMPLETE' : anySuccess ? 'COMPLETE' : 'DRAFT',
        completedAt: anySuccess ? new Date() : null,
      },
    });

    // Fetch updated assembly
    const updatedAssembly = await prisma.assembly.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      assembly: updatedAssembly,
      results,
    });
  } catch (error) {
    console.error('Error running assembly:', error);
    return NextResponse.json({ error: 'Failed to run assembly' }, { status: 500 });
  }
}
