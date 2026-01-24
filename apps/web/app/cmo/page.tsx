'use client';
import { useEffect, useState } from 'react';
import {
  CMOLayout,
  Card,
  KPICard,
  Button,
  LoadingSpinner,
  WeeklyScheduleCard,
  TopContentCard,
  MarketingFunnelCard,
  DonRecommendationsCard,
} from './components';
import {
  CMODashboardMetrics,
  WeeklySchedule,
  TopContentResponse,
  FunnelOverview,
  RecommendationsResponse,
} from './types/dashboard';

export default function CMODashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<CMODashboardMetrics | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [topContent, setTopContent] = useState<TopContentResponse | null>(null);
  const [funnel, setFunnel] = useState<FunnelOverview | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const token = localStorage.getItem('zander_token');
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const [metricsRes, scheduleRes, contentRes, funnelRes, insightsRes] = await Promise.all([
        fetch(`${apiUrl}/cmo/dashboard/metrics`, { headers }).catch(() => null),
        fetch(`${apiUrl}/cmo/calendar/schedule?week=current`, { headers }).catch(() => null),
        fetch(`${apiUrl}/cmo/analytics/top-content`, { headers }).catch(() => null),
        fetch(`${apiUrl}/cmo/funnels/overview`, { headers }).catch(() => null),
        fetch(`${apiUrl}/cmo/insights/recommendations`, { headers }).catch(() => null),
      ]);

      if (metricsRes?.ok) {
        setMetrics(await metricsRes.json());
      }
      if (scheduleRes?.ok) {
        setSchedule(await scheduleRes.json());
      }
      if (contentRes?.ok) {
        setTopContent(await contentRes.json());
      }
      if (funnelRes?.ok) {
        setFunnel(await funnelRes.json());
      }
      if (insightsRes?.ok) {
        setRecommendations(await insightsRes.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <CMOLayout>
        <LoadingSpinner message="Loading your marketing dashboard..." fullPage />
      </CMOLayout>
    );
  }

  return (
    <CMOLayout>
      {/* Dashboard Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--zander-navy)',
              margin: 0,
              marginBottom: '0.25rem',
            }}
          >
            Marketing Dashboard
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>Your marketing command center</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => (window.location.href = '/cmo/reports')}>
            View Reports
          </Button>
          <Button variant="primary" onClick={() => (window.location.href = '/cmo/workflows')}>
            + New Campaign
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <KPICard
          title="New Leads"
          value={metrics?.newLeads?.count?.toString() || '0'}
          icon="👥"
          trend={metrics?.newLeads?.trend ? `${metrics.newLeads.trend > 0 ? '+' : ''}${metrics.newLeads.trend}%` : undefined}
          trendUp={metrics?.newLeads?.trendUp ?? true}
          detail={metrics?.newLeads?.detail || 'This month'}
          color="#F57C00"
        />
        <KPICard
          title="Email Open Rate"
          value={`${metrics?.emailOpenRate?.rate?.toFixed(1) || '0'}%`}
          icon="📧"
          trend={metrics?.emailOpenRate?.trend ? `+${metrics.emailOpenRate.trend}%` : undefined}
          trendUp={metrics?.emailOpenRate?.trendUp ?? true}
          detail={metrics?.emailOpenRate?.detail || 'Last 30 days'}
          color="#3498DB"
        />
        <KPICard
          title="Conversion Rate"
          value={`${metrics?.conversionRate?.rate?.toFixed(1) || '0'}%`}
          icon="🎯"
          trend={
            metrics?.conversionRate?.trend
              ? `+${metrics.conversionRate.trend}%`
              : undefined
          }
          trendUp={metrics?.conversionRate?.trendUp ?? true}
          detail={metrics?.conversionRate?.detail || 'Last 30 days'}
          color="#9B59B6"
        />
        <KPICard
          title="Pipeline Value"
          value={formatCurrency(metrics?.pipelineValue?.amount || 0)}
          icon="💰"
          trend={metrics?.pipelineValue?.trend ? `+${metrics.pipelineValue.trend}%` : undefined}
          trendUp={metrics?.pipelineValue?.trendUp ?? true}
          detail={metrics?.pipelineValue?.detail || 'Active deals'}
          color="#27AE60"
        />
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Marketing Funnel */}
          <MarketingFunnelCard funnel={funnel} loading={false} />

          {/* Top Performing Content */}
          <TopContentCard
            items={topContent?.topContent || []}
            isPlaceholder={topContent?.isPlaceholder}
            loading={false}
          />
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Weekly Schedule */}
          <WeeklyScheduleCard
            events={schedule?.events || []}
            monthlyTheme={schedule?.monthlyTheme}
            loading={false}
          />

          {/* Don's Recommendations */}
          <DonRecommendationsCard
            recommendations={recommendations?.recommendations || []}
            loading={false}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1rem',
          }}
        >
          {[
            { icon: '📧', label: 'Create Email Campaign', href: '/cmo/workflows' },
            { icon: '🎯', label: 'Set Up New Funnel', href: '/cmo/funnels' },
            { icon: '📅', label: 'Schedule Content', href: '/cmo/calendar' },
            { icon: '📊', label: 'View Analytics', href: '/cmo/analytics' },
            { icon: '🎨', label: 'Manage Brand Assets', href: '/cmo/brand' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.25rem',
                background: 'var(--zander-off-white)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--zander-navy)',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 124, 0, 0.1)';
                e.currentTarget.style.color = '#F57C00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--zander-off-white)';
                e.currentTarget.style.color = 'var(--zander-navy)';
              }}
            >
              <span style={{ fontSize: '1.75rem' }}>{action.icon}</span>
              <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{action.label}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* Summary Stats */}
      {metrics?.summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          <div
            style={{
              padding: '1rem 1.5rem',
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                {metrics.summary.activeWorkflows}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                Active Workflows
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '1rem 1.5rem',
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📣</span>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                {metrics.summary.activeCampaigns}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                Active Campaigns
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '1rem 1.5rem',
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>👥</span>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                {metrics.summary.totalContacts.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>Total Contacts</div>
            </div>
          </div>
        </div>
      )}
    </CMOLayout>
  );
}
