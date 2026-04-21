'use client';
import { useState, useEffect, CSSProperties } from 'react';
import { CMOLayout, Card, LoadingSpinner } from '../components';

interface CampaignMetrics {
  id: string;
  name: string;
  status: string;
  businessUnit: string | null;
  enrollments: number;
  sent: number | null;
  openRate: number | null;
  clickRate: number | null;
  conversionRate: number | null;
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
    totalContacts: number;
    contactsThisMonth: number;
    emailsSent: number;
    emailsOpened: number;
    avgOpenRate: number | null;
    avgClickRate: number | null;
    totalSocialPosts: number;
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
  hasData: {
    campaigns: boolean;
    contacts: boolean;
    emails: boolean;
    funnels: boolean;
    socialPosts: boolean;
  };
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/analytics/overview?dateRange=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        console.error('Failed to fetch analytics:', response.status);
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setData(null);
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
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>
            Failed to load analytics data. Please try again.
          </div>
        </Card>
      </CMOLayout>
    );
  }

  const hasAnyData = data.hasData.campaigns || data.hasData.contacts || data.hasData.emails || data.hasData.funnels;

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
                borderColor: dateRange === range ? '#F57C00' : '#2A2A38',
                borderRadius: '8px',
                background: dateRange === range ? 'rgba(245, 124, 0, 0.1)' : '#1C1C26',
                color: dateRange === range ? '#F57C00' : '#8888A0',
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
          value={data.overview.emailsSent}
          subValue={data.overview.avgOpenRate !== null ? `${data.overview.avgOpenRate.toFixed(1)}% open rate` : 'No tracking data yet'}
          icon="📧"
          color="#3498DB"
        />
        <KPICard
          label="Total Contacts"
          value={data.overview.totalContacts}
          subValue={`+${data.overview.contactsThisMonth} this month`}
          icon="👥"
          color="#27AE60"
        />
        <KPICard
          label="Conversions"
          value={data.overview.totalConversions}
          subValue={data.overview.avgClickRate !== null ? `${data.overview.avgClickRate.toFixed(1)}% click rate` : 'Funnel conversions'}
          icon="🎯"
          color="#9B59B6"
        />
      </div>

      {/* Getting Started Guide - shown when no data */}
      {!hasAnyData && (
        <Card>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
            <h2 style={{ color: '#F0F0F5', margin: '0 0 0.5rem', fontSize: '1.25rem' }}>
              Welcome to Marketing Analytics
            </h2>
            <p style={{ color: '#8888A0', margin: '0 0 1.5rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
              Start building your marketing engine to see real analytics here. Create campaigns, add contacts, and send emails to track your performance.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/cmo/campaigns" style={ctaButtonStyle}>
                Create Campaign
              </a>
              <a href="/crm/contacts" style={secondaryButtonStyle}>
                Add Contacts
              </a>
              <a href="/cmo/funnels" style={secondaryButtonStyle}>
                Build Funnel
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div style={contentGridStyle}>
        {/* Campaign Performance */}
        <Card>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Campaign Performance</h3>
          </div>
          {data.campaigns.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No campaigns yet"
              description="Create your first campaign to start tracking performance metrics."
              actionLabel="Create Campaign"
              actionHref="/cmo/campaigns"
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Campaign</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Enrollments</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '600', color: '#F0F0F5' }}>
                            {campaign.name}
                          </span>
                          {campaign.businessUnit && (
                            <span style={businessUnitBadgeStyle}>
                              {campaign.businessUnit}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {campaign.enrollments}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: campaign.status === 'active' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(136, 136, 160, 0.15)',
                          color: campaign.status === 'active' ? '#27AE60' : '#8888A0',
                        }}>
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Email Performance Chart */}
        <Card>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Email Performance</h3>
          </div>
          {data.emailPerformance.length === 0 ? (
            <EmptyState
              icon="📧"
              title="No email data yet"
              description="Send emails through campaigns to see performance metrics here."
              actionLabel="Go to Campaigns"
              actionHref="/cmo/campaigns"
            />
          ) : (
            <div style={{ padding: '1rem' }}>
              {data.emailPerformance.map((week, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#F0F0F5' }}>
                      {week.period}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                      {week.sent} sent
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', height: '24px' }}>
                    <div
                      style={{
                        flex: week.opened || 1,
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
                    {week.clicked > 0 && (
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
                    )}
                    <div
                      style={{
                        flex: Math.max(week.sent - week.opened, 1),
                        background: 'var(--zander-border-gray)',
                        borderRadius: '4px',
                      }}
                      title={`Not opened: ${week.sent - week.opened}`}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#3498DB' }}>Opened: {week.opened}</span>
                    {week.clicked > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#27AE60' }}>Clicked: {week.clicked}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
              <EmptyState
                icon="🎯"
                title="No funnels created"
                description="Create marketing funnels to track visitor journeys and conversions."
                actionLabel="Create Funnel"
                actionHref="/cmo/funnels"
              />
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {data.funnels.map((funnel) => (
                  <div key={funnel.id} style={funnelCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#F0F0F5' }}>
                          {funnel.name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                          {funnel.stages.length} stages
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: funnel.conversionRate > 0 ? '#27AE60' : '#8888A0' }}>
                          {funnel.conversionRate.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                          conversion rate
                        </div>
                      </div>
                    </div>

                    {/* Funnel Visualization */}
                    {funnel.stages.length > 0 ? (
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
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem', color: '#8888A0', fontSize: '0.875rem' }}>
                        No stages configured. Edit this funnel to add stages.
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #2A2A38' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>Total Visits</span>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#F0F0F5' }}>
                          {formatNumber(funnel.totalVisits)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>Conversions</span>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: funnel.totalConversions > 0 ? '#27AE60' : '#8888A0' }}>
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

// Empty State Component
function EmptyState({ icon, title, description, actionLabel, actionHref }: {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{icon}</div>
      <h4 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem', fontWeight: '600' }}>
        {title}
      </h4>
      <p style={{ margin: 0, color: '#8888A0', fontSize: '0.875rem', maxWidth: '280px' }}>
        {description}
      </p>
      <a
        href={actionHref}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(245, 124, 0, 0.15)',
          color: '#F57C00',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: '600',
        }}
      >
        {actionLabel}
      </a>
    </div>
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
          <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5' }}>
            {typeof value === 'number' ? formatNumber(value) : value}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8888A0', marginTop: '0.25rem' }}>
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
  color: '#F0F0F5',
  margin: 0,
  marginBottom: '0.25rem',
};

const subtitleStyle: CSSProperties = {
  color: '#8888A0',
  margin: 0,
};

const kpiGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const kpiCardStyle: CSSProperties = {
  background: '#1C1C26',
  borderRadius: '12px',
  border: '1px solid #2A2A38',
  padding: '1.25rem',
};

const contentGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gap: '1.5rem',
};

const cardHeaderStyle: CSSProperties = {
  padding: '1rem 1.25rem',
  borderBottom: '1px solid #2A2A38',
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '600',
  color: '#F0F0F5',
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
  color: '#8888A0',
  textTransform: 'uppercase',
  borderBottom: '1px solid #2A2A38',
};

const tdStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  color: '#F0F0F5',
  borderBottom: '1px solid #2A2A38',
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
  background: '#1C1C26',
  borderRadius: '8px',
  padding: '1.25rem',
};

const ctaButtonStyle: CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: '#F57C00',
  color: 'white',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '0.875rem',
};

const secondaryButtonStyle: CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: 'transparent',
  color: '#F0F0F5',
  border: '2px solid #2A2A38',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '0.875rem',
};
