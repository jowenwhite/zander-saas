/**
 * Shared cross-executive context builder
 * Gives each AI executive awareness of what the other executives are working on,
 * enabling them to function as a coordinated team rather than isolated specialists.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

export async function buildCrossExecutiveContext(authHeaders: Record<string, string>): Promise<string> {
  const fetchJSON = async (url: string) => {
    try {
      const res = await fetch(url, { headers: authHeaders });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  };

  // Use verified endpoint paths matching actual API controllers
  const [campaignsRes, dealsRes, calendar, tasksRes, hqDashboard, marketingPlan, productsRes, conversationTopics, designAssetsRes] = await Promise.all([
    fetchJSON(`${API_URL}/campaigns`),                // campaigns controller - returns array directly
    fetchJSON(`${API_URL}/deals`),                    // Jordan's domain - returns { data: [], pagination: {} }
    fetchJSON(`${API_URL}/calendar-events/upcoming`), // Pam's domain - returns array directly
    fetchJSON(`${API_URL}/tasks`),                    // Pam's domain - returns { data: [], pagination: {} }
    fetchJSON(`${API_URL}/hq/dashboard`),             // Shared HQ
    fetchJSON(`${API_URL}/cmo/marketing-plan`),       // Don's domain
    fetchJSON(`${API_URL}/products`),                 // Shared - what the company sells
    fetchJSON(`${API_URL}/conversations/topics`),    // Recent conversation topics for cross-exec awareness
    fetchJSON(`${API_URL}/design-assets?limit=5`),   // Design assets for marketing context
  ]);

  // Normalize responses - some endpoints return { data: [] }, others return [] directly
  const campaigns = Array.isArray(campaignsRes) ? campaignsRes : campaignsRes?.data || [];
  const deals = Array.isArray(dealsRes) ? dealsRes : dealsRes?.data || [];
  const tasks = Array.isArray(tasksRes) ? tasksRes : tasksRes?.data || [];
  const products = Array.isArray(productsRes) ? productsRes : productsRes?.data || [];

  const sections: string[] = [];
  sections.push('=== TEAM AWARENESS (What your fellow executives are working on) ===');

  // Marketing summary (for Jordan and Pam to see what Don is doing)
  if (campaigns?.length) {
    const active = campaigns.filter((c: { status?: string }) =>
      c.status === 'active' || c.status === 'Active' || c.status === 'ACTIVE'
    );
    const campaignNames = active.slice(0, 5).map((c: { name: string }) => c.name).join(', ');
    sections.push(`MARKETING (Don): ${active.length} active campaigns${campaignNames ? ': ' + campaignNames : ''}`);
  }

  if (marketingPlan?.overview || marketingPlan?.goals) {
    const planSummary = marketingPlan.overview || marketingPlan.goals;
    if (typeof planSummary === 'string' && planSummary.length > 0) {
      sections.push(`MARKETING PLAN: ${planSummary.substring(0, 150)}${planSummary.length > 150 ? '...' : ''}`);
    }
  }

  // Design assets summary (for all executives to know what creative assets exist)
  const designAssets = designAssetsRes?.assets || (Array.isArray(designAssetsRes) ? designAssetsRes : []);
  if (designAssets?.length > 0) {
    sections.push(`DESIGN ASSETS: ${designAssets.length} available for marketing content`);
  }

  // Sales summary (for Don and Pam to see what Jordan is doing)
  if (deals?.length) {
    const totalValue = deals.reduce((sum: number, d: { dealValue?: number }) => sum + (d.dealValue || 0), 0);
    const recentWins = deals.filter((d: { stage?: string }) =>
      d.stage === 'Won' || d.stage === 'Closed Won' || d.stage === 'CLOSED_WON'
    ).slice(0, 3);
    const winsText = recentWins.length
      ? '. Recent wins: ' + recentWins.map((d: { dealName: string; dealValue?: number }) =>
          `${d.dealName} ($${(d.dealValue || 0).toLocaleString()})`
        ).join(', ')
      : '';
    sections.push(`SALES (Jordan): ${deals.length} deals in pipeline, total value $${totalValue.toLocaleString()}${winsText}`);
  }

  // Schedule summary (for Don and Jordan to see what Pam is managing)
  if (calendar?.length) {
    const upcoming = calendar.slice(0, 5);
    const eventsText = upcoming.map((e: { title?: string; startTime?: string }) =>
      `${e.title || 'Event'} [${e.startTime ? new Date(e.startTime).toLocaleDateString() : 'TBD'}]`
    ).join(', ');
    sections.push(`SCHEDULE (Pam): ${calendar.length} upcoming events. Next: ${eventsText}`);
  }

  if (tasks?.length) {
    const pending = tasks.filter((t: { status?: string }) => t.status !== 'completed');
    sections.push(`TASKS: ${pending.length} pending tasks`);
  }

  // HQ summary (for all executives to see business health)
  if (hqDashboard) {
    const parts: string[] = [];
    if (hqDashboard.keystones?.length) {
      const onTrack = hqDashboard.keystones.filter((k: { status?: string }) =>
        k.status === 'on-track' || k.status === 'complete' || k.status === 'ON_TRACK'
      ).length;
      parts.push(`${hqDashboard.keystones.length} keystones (${onTrack} on track)`);
    }
    if (hqDashboard.headwinds?.length) {
      parts.push(`${hqDashboard.headwinds.length} headwinds`);
    }
    if (hqDashboard.goals?.length) {
      parts.push(`${hqDashboard.goals.length} goals`);
    }
    if (parts.length) {
      sections.push(`HQ: ${parts.join(', ')}`);
    }
  }

  // Products & Services (ALL executives need to know what the company sells)
  if (products?.length) {
    const activeProducts = products.filter((p: { status?: string }) =>
      p.status === 'ACTIVE' || p.status === 'active' || !p.status
    );
    const productsList = activeProducts.slice(0, 10).map((p: { name: string; basePrice?: number; status?: string }) =>
      `${p.name}${p.basePrice ? ` [$${p.basePrice.toLocaleString()}]` : ''}`
    ).join(', ');
    sections.push(`PRODUCTS & SERVICES (${activeProducts.length}): ${productsList || 'None listed'}`);
  }

  // Recent conversation topics (what users have been discussing with each executive)
  if (conversationTopics?.topics) {
    const topicEntries = Object.entries(conversationTopics.topics as Record<string, string[]>);
    if (topicEntries.length > 0) {
      sections.push('\n=== RECENT CONVERSATIONS (What users have been asking about) ===');
      const execNames: Record<string, string> = {
        DON: 'Don (CMO)',
        JORDAN: 'Jordan (CRO)',
        PAM: 'Pam (EA)',
        BEN: 'Ben (CFO)',
        MIRANDA: 'Miranda (COO)',
        TED: 'Ted (CPO)',
        JARVIS: 'Jarvis (CIO)',
      };
      for (const [execType, topics] of topicEntries) {
        if (Array.isArray(topics) && topics.length > 0) {
          const name = execNames[execType] || execType;
          const topicsList = topics.slice(0, 3).map(t => `"${t}"`).join(', ');
          sections.push(`${name}: ${topicsList}`);
        }
      }
    }
  }

  sections.push('PLATFORM CAPABILITY: Contacts can be imported in bulk at People > Import (/people/import). Supported formats: vCard (.vcf from iPhone/Android), CSV, and Excel. Mention this whenever a user asks about importing contacts or bringing contacts from another app or phone.');

  sections.push('=== Use this team context to give coordinated advice. Reference what other executives are working on when relevant. ===');

  return '\n\n' + sections.join('\n');
}
