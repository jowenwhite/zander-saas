'use client';

import { useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { logout } from '../utils/auth';

export default function HeadquartersPage() {
  const [activeModule, setActiveModule] = useState('cro');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const keystoneMetrics = [
    { id: 'cro', icon: '💼', label: 'Pipeline Value', value: '$139,000', trend: 'up', trendValue: '12%', module: 'CRO', color: '#BF0A30' },
    { id: 'cfo', icon: '📊', label: 'Cash on Hand', value: '$47,500', trend: 'down', trendValue: '3%', module: 'CFO', color: '#2E7D32' },
    { id: 'coo', icon: '⚙️', label: 'On-Time Delivery', value: '94%', trend: 'flat', trendValue: '', module: 'COO', color: '#5E35B1' },
    { id: 'cmo', icon: '🎨', label: 'Leads This Month', value: '12', trend: 'up', trendValue: '8%', module: 'CMO', color: '#F57C00' },
    { id: 'cpo', icon: '🤝', label: 'Team Satisfaction', value: '4.2/5', trend: 'up', trendValue: '0.3', module: 'CPO', color: '#0288D1' },
    { id: 'cio', icon: '🖥️', label: 'System Uptime', value: '99.9%', trend: 'flat', trendValue: '', module: 'CIO', color: '#455A64' },
    { id: 'ea', icon: '📋', label: 'Tasks Completed', value: '23/28', trend: 'up', trendValue: '82%', module: 'EA', color: '#C2185B' },
  ];

  const myCampaignItems = [
    { id: 1, title: 'Close 3 deals this quarter', progress: 66, dueDate: 'Dec 31, 2025' },
    { id: 2, title: 'Launch email automation sequence', progress: 80, dueDate: 'Dec 20, 2025' },
    { id: 3, title: 'Complete team training on new CRM', progress: 100, dueDate: 'Dec 10, 2025' },
  ];

  const activeHeadwinds = [
    { id: 1, title: 'Supply chain delays affecting delivery times', priority: 'high', createdAt: 'Dec 10, 2025' },
    { id: 2, title: 'Need to hire additional sales rep', priority: 'medium', createdAt: 'Dec 8, 2025' },
    { id: 3, title: 'Website conversion rate dropped 15%', priority: 'high', createdAt: 'Dec 5, 2025' },
  ];

  const upcomingAssemblies = [
    { id: 1, type: 'Weekly', title: 'Weekly Assembly', date: 'Tue, Dec 17 @ 9:00 AM', attendees: 5 },
    { id: 2, type: 'Quarterly', title: 'Q1 2026 Planning', date: 'Mon, Dec 30 @ 1:00 PM', attendees: 8 },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#28A745';
      case 'down': return '#DC3545';
      default: return 'var(--zander-gray)';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: 'rgba(220, 53, 69, 0.1)', color: '#DC3545' };
      case 'medium': return { bg: 'rgba(240, 179, 35, 0.1)', color: '#B8860B' };
      default: return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D' };
    }
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <nav style={{
          background: 'white',
          borderBottom: '2px solid var(--zander-border-gray)',
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.5rem' }}>⚡</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)', letterSpacing: '-0.5px' }}>ZANDER</span>
            </a>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['CRO', 'CFO', 'COO', 'CMO', 'CPO', 'CIO', 'EA'].map((module) => (
              <button
                key={module}
                onClick={() => setActiveModule(module.toLowerCase())}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeModule === module.toLowerCase() ? 'var(--zander-red)' : 'transparent',
                  color: activeModule === module.toLowerCase() ? 'white' : 'var(--zander-gray)',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                {module}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a href="/headquarters" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>🏛️ HQ</a>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.875rem' }}>JW</div>
            <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>Jonathan White</span>
            <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--zander-gray)' }}>Logout</button>
            <ThemeToggle />
          </div>
        </nav>

        <Sidebar collapsed={sidebarCollapsed} />

        <main style={{ marginLeft: sidebarCollapsed ? '64px' : '260px', marginTop: '64px', padding: '2rem', transition: 'margin-left 0.3s ease' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🏛️</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>Headquarters</h1>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>Your command center for alignment, accountability, and action</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '2px solid var(--zander-border-gray)' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Keystones
              <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--zander-gray)' }}>Your vital signs at a glance</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {keystoneMetrics.map((metric) => (
                <a key={metric.id} href={metric.module === 'CRO' ? '/' : '/' + metric.module.toLowerCase()} style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1.25rem', textDecoration: 'none', borderLeft: '4px solid ' + metric.color, transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{metric.icon}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: metric.color, textTransform: 'uppercase' }}>{metric.module}</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{metric.value}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{metric.label}</span>
                    {metric.trendValue && <span style={{ fontSize: '0.75rem', color: getTrendColor(metric.trend), fontWeight: '600' }}>{getTrendIcon(metric.trend)} {metric.trendValue}</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎯 My Campaign</h2>
                <a href="/headquarters/my-campaign" style={{ fontSize: '0.8rem', color: 'var(--zander-red)', textDecoration: 'none', fontWeight: '600' }}>View All →</a>
              </div>
              {myCampaignItems.map((item) => (
                <div key={item.id} style={{ padding: '1rem', background: 'var(--zander-off-white)', borderRadius: '8px', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>{item.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--zander-gray)' }}>Due: {item.dueDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--zander-border-gray)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: item.progress + '%', height: '100%', background: item.progress === 100 ? '#28A745' : 'var(--zander-red)', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: item.progress === 100 ? '#28A745' : 'var(--zander-navy)' }}>{item.progress}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🌀 Headwinds
                  <span style={{ background: 'var(--zander-red)', color: 'white', fontSize: '0.7rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>{activeHeadwinds.length}</span>
                </h2>
                <a href="/headquarters/headwinds" style={{ fontSize: '0.8rem', color: 'var(--zander-red)', textDecoration: 'none', fontWeight: '600' }}>View All →</a>
              </div>
              {activeHeadwinds.map((item) => {
                const priorityStyle = getPriorityColor(item.priority);
                return (
                  <div key={item.id} style={{ padding: '1rem', background: 'var(--zander-off-white)', borderRadius: '8px', marginBottom: '0.75rem', borderLeft: '3px solid ' + priorityStyle.color }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: '500', color: 'var(--zander-navy)', fontSize: '0.9rem', flex: 1 }}>{item.title}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: '4px', background: priorityStyle.bg, color: priorityStyle.color }}>{item.priority}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginTop: '0.5rem' }}>Added: {item.createdAt}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🏛️ Upcoming Assemblies</h2>
                <a href="/headquarters/assembly" style={{ fontSize: '0.8rem', color: 'var(--zander-red)', textDecoration: 'none', fontWeight: '600' }}>Manage →</a>
              </div>
              {upcomingAssemblies.map((item) => (
                <div key={item.id} style={{ padding: '1rem', background: 'var(--zander-off-white)', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: '4px', background: item.type === 'Weekly' ? 'rgba(191, 10, 48, 0.1)' : 'rgba(12, 35, 64, 0.1)', color: item.type === 'Weekly' ? 'var(--zander-red)' : 'var(--zander-navy)' }}>{item.type}</span>
                      <span style={{ fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.35rem' }}>📅 {item.date} • 👥 {item.attendees} attendees</div>
                  </div>
                  <button style={{ padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Prepare</button>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--zander-navy)' }}>Quick Navigation</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { icon: '⚔️', label: 'Quarterly Campaigns', href: '/headquarters/campaigns/quarterly' },
                  { icon: '📅', label: 'Annual Campaign', href: '/headquarters/campaigns/annual' },
                  { icon: '📒', label: 'The Ledger', href: '/headquarters/ledger' },
                  { icon: '📜', label: 'Founding Principles', href: '/headquarters/founding-principles' },
                  { icon: '🏆', label: 'Victories', href: '/headquarters/headwinds/victories' },
                  { icon: '🔮', label: 'The Legacy', href: '/headquarters/legacy' },
                ].map((link) => (
                  <a key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--zander-off-white)', borderRadius: '8px', textDecoration: 'none', color: 'var(--zander-navy)', fontWeight: '500', fontSize: '0.875rem', transition: 'all 0.2s ease' }}>
                    <span style={{ fontSize: '1.25rem' }}>{link.icon}</span>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
