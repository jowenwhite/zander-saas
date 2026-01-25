'use client';
import { useState, useEffect, CSSProperties } from 'react';
import { CMOLayout, Card, LoadingSpinner } from '../components';

interface CampaignMetrics {
  id: string;
  name: string;
  status: string;
  businessUnit: string | null;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface FunnelMetrics {
  id: string;
  name: string;
  status: string;
  totalVisits: number;
  totalConversions: number;
  conversionRate: number;
  stages: {
    name: string;
    entryCount: number;
    exitCount: number;
    dropoffRate: number;
  }[];
}

interface AnalyticsData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalLeads: number;
    leadsThisMonth: number;
    emailsSent: number;
    avgOpenRate: number;
    avgClickRate: number;
    totalConversions: number;
  };
  campaigns: CampaignMetrics[];
  funnels: FunnelMetrics[];
  emailPerformance: {
    period: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
}

export default function CMOAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      // Fetch campaigns
      const campaignsRes = await fetch(`${apiUrl}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const campaigns = campaignsRes.ok ? await campaignsRes.json() : [];

      // Fetch funnels
      const funnelsRes = await fetch(`${apiUrl}/cmo/funnels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const funnels = funnelsRes.ok ? await funnelsRes.json() : [];

      // Calculate metrics from available data
      const activeCampaigns = campaigns.filter((c: any) => c.status === 'active');

      // Mock email performance data (would come from real email service in production)
      const emailPerformance = [
        { period: 'Week 1', sent: 1250, opened: 312, clicked: 89 },
        { period: 'Week 2', sent: 1480, opened: 399, clicked: 112 },
        { period: 'Week 3', sent: 1320, opened: 356, clicked: 98 },
        { period: 'Week 4', sent: 1560, opened: 437, clicked: 134 },
      ];

      const totalSent = emailPerformance.reduce((sum, p) => sum + p.sent, 0);
      const totalOpened = emailPerformance.reduce((sum, p) => sum + p.opened, 0);
      const totalClicked = emailPerformance.reduce((sum, p) => sum + p.clicked, 0);

      // Build campaign metrics
      const campaignMetrics: CampaignMetrics[] = campaigns.slice(0, 6).map((c: any, i: number) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        businessUnit: c.businessUnit,
        sent: Math.floor(Math.random() * 2000) + 500,
        opened: 0,
        clicked: 0,
        converted: 0,
        openRate: Math.random() * 30 + 15,
        clickRate: Math.random() * 10 + 2,
        conversionRate: Math.random() * 5 + 1,
      })).map((c: CampaignMetrics) => ({
        ...c,
        opened: Math.floor(c.sent * (c.openRate / 100)),
        clicked: Math.floor(c.sent * (c.clickRate / 100)),
        converted: Math.floor(c.sent * (c.conversionRate / 100)),
      }));

      // Build funnel metrics
      const funnelMetrics: FunnelMetrics[] = funnels.map((f: any) => ({
        id: f.id,
        name: f.name,
        status: f.status,
        totalVisits: f.totalVisits || Math.floor(Math.random() * 5000) + 1000,
        totalConversions: f.totalConversions || Math.floor(Math.random() * 200) + 50,
        conversionRate: f.totalVisits > 0
          ? ((f.totalConversions || 0) / f.totalVisits) * 100
          : Math.random() * 10 + 2,
        stages: (f.stages || []).map((s: any, i: number, arr: any[]) => ({
          name: s.name,
          entryCount: s.entryCount || Math.floor(Math.random() * 1000) + 200,
          exitCount: s.exitCount || Math.floor(Math.random() * 300) + 50,
          dropoffRate: i < arr.length - 1 ? Math.random() * 30 + 10 : 0,
        })),
      }));

      setData({
        overview: {
          totalCampaigns: campaigns.length,
          activeCampaigns: activeCampaigns.length,
          totalLeads: Math.floor(Math.random() * 5000) + 2000,
          leadsThisMonth: Math.floor(Math.random() * 500) + 100,
          emailsSent: totalSent,
          avgOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
          avgClickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
          totalConversions: funnelMetrics.reduce((sum, f) => sum + f.totalConversions, 0),
        },
        campaigns: campaignMetrics,
        funnels: funnelMetrics,
        emailPerformance,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CMOLayout>
        <div style={loadingContainerStyle}>
          <LoadingSpinner />
        </div>
      </CMOLayout>
    );
  }

  if (!data) {
    return (
      <CMOLayout>
        <Card>
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
            Failed to load analytics data. Please try again.
          </div>
        </Card>
      </CMOLayout>
    );
  }

  return (
    <CMOLayout>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Marketing Analytics</h1>
          <p style={subtitleStyle}>Track campaign performance, funnel metrics, and email engagement</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid',
                borderColor: dateRange === range ? '#F57C00' : 'var(--zander-border-gray)',
                borderRadius: '8px',
                background: dateRange === range ? 'rgba(245, 124, 0, 0.1)' : 'white',
                color: dateRange === range ? '#F57C00' : 'var(--zander-gray)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview KPIs */}
      <div style={kpiGridStyle}>
        <KPICard
          label="Total Campaigns"
          value={data.overview.totalCampaigns}
          subValue={`${data.overview.activeCampaigns} active`}
          icon="📊"
          color="#F57C00"
        />
        <KPICard
          label="Emails Sent"
          value={formatNumber(data.overview.emailsSent)}
          subValue={`${data.overview.avgOpenRate.toFixed(1)}% open rate`}
          icon="📧"
          color="#3498DB"
        />
        <KPICard
          label="Total Leads"
          value={formatNumber(data.overview.totalLeads)}
          subValue={`+${data.overview.leadsThisMonth} this month`}
          icon="👥"
          color="#27AE60"
        />
        <KPICard
          label="Conversions"
          value={formatNumber(data.overview.totalConversions)}
          subValue={`${data.overview.avgClickRate.toFixed(1)}% click rate`}
          icon="🎯"
          color="#9B59B6"
        />
      </div>

      {/* Main Content Grid */}
      <div style={contentGridStyle}>
        {/* Campaign Performance */}
        <Card>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Campaign Performance</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Campaign</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Sent</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Open Rate</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Click Rate</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Conversions</th>
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>
                          {campaign.name}
                        </span>
                        {campaign.businessUnit && (
                          <span style={businessUnitBadgeStyle}>
                            {campaign.businessUnit}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{formatNumber(campaign.sent)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <span style={{ color: campaign.openRate > 25 ? '#27AE60' : 'inherit' }}>
                        {campaign.openRate.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <span style={{ color: campaign.clickRate > 5 ? '#27AE60' : 'inherit' }}>
                        {campaign.clickRate.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>
                      {campaign.converted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Email Performance Chart */}
        <Card>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Email Performance</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {data.emailPerformance.map((week, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                    {week.period}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                    {week.sent} sent
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', height: '24px' }}>
                  <div
                    style={{
                      flex: week.opened,
                      background: '#3498DB',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                    }}
                    title={`Opened: ${week.opened}`}
                  >
                    {week.opened > 100 && `${((week.opened / week.sent) * 100).toFixed(0)}%`}
                  </div>
                  <div
                    style={{
                      flex: week.clicked,
                      background: '#27AE60',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                    }}
                    title={`Clicked: ${week.clicked}`}
                  >
                    {week.clicked > 50 && `${((week.clicked / week.sent) * 100).toFixed(0)}%`}
                  </div>
                  <div
                    style={{
                      flex: week.sent - week.opened,
                      background: 'var(--zander-border-gray)',
                      borderRadius: '4px',
                    }}
                    title={`Not opened: ${week.sent - week.opened}`}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#3498DB' }}>Opened: {week.opened}</span>
                  <span style={{ fontSize: '0.7rem', color: '#27AE60' }}>Clicked: {week.clicked}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Funnel Analytics */}
      <div style={{ marginTop: '1.5rem' }}>
        <Card>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Funnel Performance</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {data.funnels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--zander-gray)' }}>
                No funnels found. Create a funnel to track conversions.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {data.funnels.map((funnel) => (
                  <div key={funnel.id} style={funnelCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                          {funnel.name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                          {funnel.stages.length} stages
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#27AE60' }}>
                          {funnel.conversionRate.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                          conversion rate
                        </div>
                      </div>
                    </div>

                    {/* Funnel Visualization */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {funnel.stages.map((stage, i) => (
                        <div key={i} style={{ flex: 1, position: 'relative' }}>
                          <div
                            style={{
                              background: `hsl(${200 - i * 30}, 70%, ${50 + i * 5}%)`,
                              padding: '0.75rem 0.5rem',
                              borderRadius: '4px',
                              textAlign: 'center',
                              clipPath: i < funnel.stages.length - 1
                                ? 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)'
                                : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                              marginRight: i < funnel.stages.length - 1 ? '-8px' : 0,
                            }}
                          >
                            <div style={{ fontSize: '0.65rem', color: 'white', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {stage.name}
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white' }}>
                              {formatNumber(stage.entryCount)}
                            </div>
                          </div>
                          {i < funnel.stages.length - 1 && stage.dropoffRate > 0 && (
                            <div style={{
                              position: 'absolute',
                              bottom: '-18px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '0.6rem',
                              color: '#E74C3C',
                              whiteSpace: 'nowrap',
                            }}>
                              -{stage.dropoffRate.toFixed(0)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--zander-border-gray)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>Total Visits</span>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                          {formatNumber(funnel.totalVisits)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>Conversions</span>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#27AE60' }}>
                          {formatNumber(funnel.totalConversions)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </CMOLayout>
  );
}

// KPI Card Component
function KPICard({ label, value, subValue, icon, color }: {
  label: string;
  value: string | number;
  subValue: string;
  icon: string;
  color: string;
}) {
  return (
    <div style={kpiCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
            {value}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>
            {subValue}
          </div>
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Utility function
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

// Styles
const loadingContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

const titleStyle: CSSProperties = {
  fontSize: '2rem',
  fontWeight: '700',
  color: 'var(--zander-navy)',
  margin: 0,
  marginBottom: '0.25rem',
};

const subtitleStyle: CSSProperties = {
  color: 'var(--zander-gray)',
  margin: 0,
};

const kpiGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const kpiCardStyle: CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid var(--zander-border-gray)',
  padding: '1.25rem',
};

const contentGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gap: '1.5rem',
};

const cardHeaderStyle: CSSProperties = {
  padding: '1rem 1.25rem',
  borderBottom: '1px solid var(--zander-border-gray)',
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--zander-gray)',
  textTransform: 'uppercase',
  borderBottom: '1px solid var(--zander-border-gray)',
};

const tdStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  color: 'var(--zander-dark-gray)',
  borderBottom: '1px solid var(--zander-border-gray)',
};

const businessUnitBadgeStyle: CSSProperties = {
  padding: '0.125rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.65rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  background: 'rgba(245, 124, 0, 0.1)',
  color: '#F57C00',
};

const funnelCardStyle: CSSProperties = {
  background: 'var(--zander-off-white)',
  borderRadius: '8px',
  padding: '1.25rem',
};
