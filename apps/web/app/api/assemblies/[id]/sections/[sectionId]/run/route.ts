import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Context fetchers (duplicated for now - could be moved to shared lib)
async function getJordanContext(tenantId: string, authToken: string): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
    'x-tenant-id': tenantId,
  };

  try {
    const dealsRes = await fetch(`${apiUrl}/deals?tenantId=${tenantId}&limit=10`, { headers });
    const deals = dealsRes.ok ? await dealsRes.json() : [];
    const openDeals = Array.isArray(deals) ? deals : (deals.data || []);
    const totalValue = openDeals.reduce((sum: number, d: { dealValue?: number }) => sum + (d.dealValue || 0), 0);

    return `
**Pipeline Context:**
- Total open deals: ${openDeals.length}
- Total pipeline value: $${totalValue.toLocaleString()}
- Top 5 deals: ${openDeals.slice(0, 5).map((d: { dealName?: string; dealValue?: number }) => `${d.dealName} ($${d.dealValue?.toLocaleString()})`).join(', ')}
`;
  } catch {
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
    const campaignsRes = await fetch(`${apiUrl}/campaigns?tenantId=${tenantId}&limit=10`, { headers });
    const campaigns = campaignsRes.ok ? await campaignsRes.json() : [];
    const campaignList = Array.isArray(campaigns) ? campaigns : (campaigns.data || []);

    return `
**Marketing Context:**
- Total campaigns: ${campaignList.length}
- Recent campaigns: ${campaignList.slice(0, 3).map((c: { name?: string; status?: string }) => `${c.name} (${c.status})`).join(', ')}
`;
  } catch {
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
    const tasksRes = await fetch(`${apiUrl}/tasks?status=open&limit=20`, { headers });
    const tasksData = tasksRes.ok ? await tasksRes.json() : { data: [] };
    const tasks = tasksData.data || [];

    return `
**Operations Context:**
- Open tasks: ${tasks.length}
- High priority: ${tasks.filter((t: { priority?: string }) => t.priority === 'HIGH').length}
`;
  } catch {
    return 'Operations data unavailable.';
  }
}

async function generateSectionContent(
  executive: string,
  prompt: string,
  context: string
): Promise<string> {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const systemPrompts: Record<string, string> = {
    jordan: `You are Jordan, Chief Revenue Officer at Zander. You are writing a section for a business assembly document. Be confident, data-driven, and strategic.`,
    don: `You are Don, Chief Marketing Officer at Zander. You are writing a section for a business assembly document. Be creative yet strategic.`,
    pam: `You are Pam, Executive Assistant at Zander. You are writing a section for a business assembly document. Be organized and thorough.`,
    ben: `You are Ben, CFO. Note: Coming soon.`,
    miranda: `You are Miranda, COO. Note: Coming soon.`,
    ted: `You are Ted, CPO. Note: Coming soon.`,
    jarvis: `You are Jarvis, CIO. Note: Coming soon.`,
  };

  const comingSoonExecutives = ['ben', 'miranda', 'ted', 'jarvis'];
  if (comingSoonExecutives.includes(executive)) {
    return `*This section will be available when ${executive.charAt(0).toUpperCase() + executive.slice(1)} joins the Zander executive team.*`;
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
      system: systemPrompts[executive] || systemPrompts.pam,
      messages: [
        {
          role: 'user',
          content: `${context}\n\n**Your Task:**\n${prompt}\n\nWrite a clear, professional section for this assembly document.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate content: ${response.status}`);
  }

  const data = await response.json();
  return data.content
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('');
}

// POST /api/assemblies/:id/sections/:sectionId/run - Run a single section
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, sectionId } = await params;
    const authHeader = request.headers.get('authorization') || '';
    const authToken = authHeader.replace('Bearer ', '');

    // Verify assembly ownership and get section
    const assembly = await prisma.assembly.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
      include: {
        sections: {
          where: { id: sectionId },
        },
      },
    });

    if (!assembly || assembly.sections.length === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const section = assembly.sections[0];

    // Update section status to GENERATING
    await prisma.assemblySection.update({
      where: { id: sectionId },
      data: { status: 'GENERATING' },
    });

    try {
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

      // Check for updated prompt from request body
      const body = await request.json().catch(() => ({}));
      const prompt = body.prompt || section.prompt;

      // Generate content
      const content = await generateSectionContent(section.executive, prompt, context);

      // Update section with content
      const updatedSection = await prisma.assemblySection.update({
        where: { id: sectionId },
        data: {
          content,
          prompt, // Update prompt if it was changed
          status: 'COMPLETE',
          generatedAt: new Date(),
        },
      });

      return NextResponse.json({ section: updatedSection });
    } catch (error) {
      // Update section status to FAILED
      await prisma.assemblySection.update({
        where: { id: sectionId },
        data: { status: 'FAILED' },
      });

      console.error(`Error generating section ${sectionId}:`, error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to generate section' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error running section:', error);
    return NextResponse.json({ error: 'Failed to run section' }, { status: 500 });
  }
}
