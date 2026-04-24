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

  // Use verified endpoint paths from individual context builders
  const [campaigns, deals, calendar, tasks, hqDashboard, marketingPlan] = await Promise.all([
    fetchJSON(`${API_URL}/cmo/campaigns`),      // Don's domain
    fetchJSON(`${API_URL}/deals`),               // Jordan's domain
    fetchJSON(`${API_URL}/calendar-events/upcoming`), // Pam's domain
    fetchJSON(`${API_URL}/tasks`),               // Pam's domain
    fetchJSON(`${API_URL}/hq/dashboard`),        // Shared HQ
    fetchJSON(`${API_URL}/cmo/marketing-plan`),  // Don's domain
  ]);

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

  // Sales summary (for Don and Pam to see what Jordan is doing)
  if (deals?.length) {
    const totalValue = deals.reduce((sum: number, d: { value?: number }) => sum + (d.value || 0), 0);
    const recentWins = deals.filter((d: { stage?: string }) =>
      d.stage === 'Won' || d.stage === 'Closed Won' || d.stage === 'CLOSED_WON'
    ).slice(0, 3);
    const winsText = recentWins.length
      ? '. Recent wins: ' + recentWins.map((d: { name: string; value?: number }) =>
          `${d.name} ($${(d.value || 0).toLocaleString()})`
        ).join(', ')
      : '';
    sections.push(`SALES (Jordan): ${deals.length} deals in pipeline, total value $${totalValue.toLocaleString()}${winsText}`);
  }

  // Schedule summary (for Don and Jordan to see what Pam is managing)
  if (calendar?.length) {
    const upcoming = calendar.slice(0, 5);
    const eventsText = upcoming.map((e: { title?: string; subject?: string; startDate?: string; date?: string }) =>
      `${e.title || e.subject || 'Event'} [${e.startDate || e.date || 'TBD'}]`
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

  sections.push('=== Use this team context to give coordinated advice. Reference what other executives are working on when relevant. ===');

  return '\n\n' + sections.join('\n');
}
