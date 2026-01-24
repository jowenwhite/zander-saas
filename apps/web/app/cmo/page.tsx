'use client';
import { CMOLayout, Card, KPICard, Button } from './components';

export default function CMODashboardPage() {
  return (
    <CMOLayout>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--zander-navy)',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            Marketing Dashboard
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
            Your marketing command center
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary">View Reports</Button>
          <Button variant="primary">+ New Campaign</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <KPICard
          title="Active Campaigns"
          value="12"
          icon="📣"
          trend="+3"
          trendUp={true}
          detail="4 launching this week"
          color="#F57C00"
        />
        <KPICard
          title="Total Leads"
          value="1,847"
          icon="👥"
          trend="+18%"
          trendUp={true}
          detail="This month"
          color="#27AE60"
        />
        <KPICard
          title="Email Open Rate"
          value="34.2%"
          icon="📧"
          trend="+5%"
          trendUp={true}
          detail="Above industry avg"
          color="#3498DB"
        />
        <KPICard
          title="Conversion Rate"
          value="4.8%"
          icon="🎯"
          trend="+0.3%"
          trendUp={true}
          detail="Last 30 days"
          color="#9B59B6"
        />
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem'
      }}>
        {/* Coming Soon Card */}
        <Card title="Campaign Performance" subtitle="Real-time campaign analytics">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'var(--zander-off-white)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--zander-navy)',
              margin: '0 0 0.5rem 0'
            }}>
              Coming in Phase 3
            </h3>
            <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
              Campaign performance charts and real-time analytics will appear here
            </p>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'var(--zander-off-white)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--zander-navy)',
                  transition: 'all 0.2s ease'
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
                <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
                <span style={{ fontWeight: '600' }}>{action.label}</span>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </CMOLayout>
  );
}
