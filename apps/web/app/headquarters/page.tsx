'use client';

import { useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { logout } from '../utils/auth';

export default function HeadquartersPage() {
  const [activeModule, setActiveModule] = useState('cro');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const keystoneMetrics = [
    { id: 'cro', icon: '💼', label: 'Pipeline Value', value: '$139,000', trend: 'up', trendValue: '12%', module: 'CRO', color: '#BF0A30' },
    { id: 'cfo', icon: '📊', label: 'Cash on Hand', value: '$47,500', trend: 'down', trendValue: '3%', module: 'CFO', color: '#2E7D32' },
    { id: 'coo', icon: '⚙️', label: 'On-Time Delivery', value: '94%', trend: 'flat', trendValue: '', module: 'COO', color: '#5E35B1' },
    { id: 'cmo', icon: '🎨', label: 'Leads This Month', value: '12', trend: 'up', trendValue: '8%', module: 'CMO', color: '#F57C00' },
    { id: 'cpo', icon: '🤝', label: 'Team Satisfaction', value: '4.2/5', trend: 'up', trendValue: '0.3', module: 'CPO', color: '#0288D1' },
    { id: 'cio', icon: '🖥️', label: 'System Uptime', value: '99.9%', trend: 'flat', trendValue: '', module: 'CIO', color: '#455A64' },
    { id: 'ea', icon: '📋', label: 'Tasks Completed', value: '23/28', trend: 'up', trendValue: '82%', module: 'EA', color: '#C2185B' },
  ];

  const quickNavButtons = [
    { id: 'assembly', icon: '🏛️', label: 'Assembly', description: 'Meetings & Agendas' },
    { id: 'campaigns', icon: '⚔️', label: 'Campaigns', description: 'Goals & Priorities' },
    { id: 'headwinds', icon: '🌀', label: 'Headwinds', description: 'Challenges & Issues' },
    { id: 'founding', icon: '📜', label: 'Founding Principles', description: 'Vision & Values' },
    { id: 'legacy', icon: '🏆', label: 'The Legacy', description: '3-5 Year Vision' },
    { id: 'ledger', icon: '📒', label: 'The Ledger', description: 'Metrics & Scores' },
  ];

  const todayAssembly = {
    title: 'Weekly Assembly',
    time: '9:00 AM',
    agenda: ['Review Keystones', 'Headwinds Update', 'Campaign Progress', 'Victories', 'Action Items'],
    attendees: 5
  };

  const activeHeadwinds = [
    { id: 1, title: 'Supply chain delays affecting delivery times', priority: 'high', days: 4 },
    { id: 2, title: 'Need to hire additional sales rep', priority: 'medium', days: 6 },
    { id: 3, title: 'Website conversion rate dropped 15%', priority: 'high', days: 9 },
  ];

  const myCampaignItems = [
    { id: 1, title: 'Close 3 deals this quarter', progress: 66 },
    { id: 2, title: 'Launch email automation sequence', progress: 80 },
    { id: 3, title: 'Complete team training on new CRM', progress: 100 },
  ];

  const recentVictories = [
    { id: 1, title: 'Completed CRM training ahead of schedule', date: 'Dec 10' },
    { id: 2, title: 'Closed Johnson kitchen remodel - $45K', date: 'Dec 8' },
    { id: 3, title: 'Resolved shipping delay issue with vendor', date: 'Dec 5' },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return '#28A745';
    if (trend === 'down') return '#DC3545';
    return 'var(--zander-gray)';
  };

  const getPriorityStyle = (priority: string) => {
    if (priority === 'high') return { bg: 'rgba(220, 53, 69, 0.1)', color: '#DC3545', label: 'HIGH' };
    if (priority === 'medium') return { bg: 'rgba(240, 179, 35, 0.1)', color: '#B8860B', label: 'MEDIUM' };
    return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D', label: 'LOW' };
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        {/* Top Navigation */}
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

        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} />

        {/* Main Content */}
        <main style={{ marginLeft: sidebarCollapsed ? '64px' : '240px', marginTop: '64px', padding: '2rem', transition: 'margin-left 0.3s ease' }}>
          {/* Page Header */}
          <div style={{ background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🏛️</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>Headquarters</h1>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>Your command center for alignment, accountability, and action</p>
              </div>
            </div>
          </div>

          {/* Keystones Row */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Keystones
              <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--zander-gray)' }}>Your vital signs at a glance</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
              {keystoneMetrics.map((metric) => (
                <a key={metric.id} href={metric.module === 'CRO' ? '/' : '/' + metric.module.toLowerCase()} style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1rem', textDecoration: 'none', borderLeft: '4px solid ' + metric.color, transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1rem' }}>{metric.icon}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: metric.color }}>{metric.module}</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.15rem' }}>{metric.value}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--zander-gray)' }}>{metric.label}</span>
                    {metric.trendValue && <span style={{ fontSize: '0.7rem', color: getTrendColor(metric.trend), fontWeight: '600' }}>{getTrendIcon(metric.trend)} {metric.trendValue}</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Navigation Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {quickNavButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveModal(btn.id)}
                style={{
                  background: 'white',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '12px',
                  padding: '1.25rem 1rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--zander-red)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--zander-border-gray)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{btn.icon}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--zander-navy)', display: 'block' }}>{btn.label}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--zander-gray)' }}>{btn.description}</span>
              </button>
            ))}
          </div>

          {/* Dashboard Cards - 2x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Today's Assembly */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📅 Today's Assembly
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>@ {todayAssembly.time}</span>
              </div>
              <div style={{ background: 'var(--zander-off-white)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>{todayAssembly.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)', marginBottom: '0.75rem' }}>👥 {todayAssembly.attendees} attendees</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                  <strong>Agenda:</strong>
                  <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                    {todayAssembly.agenda.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ flex: 1, padding: '0.75rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Join Meeting</button>
                <button style={{ flex: 1, padding: '0.75rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>View Agenda</button>
              </div>
            </div>

            {/* Active Headwinds */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🌀 Active Headwinds
                  <span style={{ background: 'var(--zander-red)', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '700' }}>{activeHeadwinds.length}</span>
                </h3>
                <button onClick={() => setActiveModal('headwinds')} style={{ fontSize: '0.75rem', color: 'var(--zander-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {activeHeadwinds.map((item) => {
                const priorityStyle = getPriorityStyle(item.priority);
                return (
                  <div key={item.id} style={{ padding: '0.75rem', background: 'var(--zander-off-white)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid ' + priorityStyle.color }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--zander-navy)', flex: 1 }}>{item.title}</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', background: priorityStyle.bg, color: priorityStyle.color }}>{priorityStyle.label}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginTop: '0.35rem' }}>{item.days} days old</div>
                  </div>
                );
              })}
            </div>

            {/* My Campaign Progress */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎯 My Campaign Progress
                </h3>
                <button onClick={() => setActiveModal('campaigns')} style={{ fontSize: '0.75rem', color: 'var(--zander-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {myCampaignItems.map((item) => (
                <div key={item.id} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--zander-navy)' }}>{item.title}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: item.progress === 100 ? '#28A745' : 'var(--zander-navy)' }}>{item.progress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--zander-off-white)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: item.progress + '%', height: '100%', background: item.progress === 100 ? '#28A745' : 'var(--zander-red)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Victories */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏆 Recent Victories
                </h3>
                <button onClick={() => setActiveModal('headwinds')} style={{ fontSize: '0.75rem', color: 'var(--zander-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {recentVictories.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(40, 167, 69, 0.05)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid #28A745' }}>
                  <span style={{ color: '#28A745', fontSize: '1rem' }}>✓</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--zander-navy)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Modal Overlay */}
        {activeModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }} onClick={() => setActiveModal(null)}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '85vh',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
                padding: '1.5rem 2rem',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>
                    {activeModal === 'assembly' && '🏛️'}
                    {activeModal === 'campaigns' && '⚔️'}
                    {activeModal === 'headwinds' && '🌀'}
                    {activeModal === 'founding' && '📜'}
                    {activeModal === 'legacy' && '🏆'}
                    {activeModal === 'ledger' && '📒'}
                  </span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                      {activeModal === 'assembly' && 'Assembly'}
                      {activeModal === 'campaigns' && 'Campaigns'}
                      {activeModal === 'headwinds' && 'Headwinds'}
                      {activeModal === 'founding' && 'Founding Principles'}
                      {activeModal === 'legacy' && 'The Legacy'}
                      {activeModal === 'ledger' && 'The Ledger'}
                    </h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                      {activeModal === 'assembly' && 'Meetings, agendas, and team alignment'}
                      {activeModal === 'campaigns' && 'Goals, priorities, and progress tracking'}
                      {activeModal === 'headwinds' && 'Challenges, issues, and victories'}
                      {activeModal === 'founding' && 'Vision, mission, and core values'}
                      {activeModal === 'legacy' && 'Your 3-5 year vision and goals'}
                      {activeModal === 'ledger' && 'Metrics, scores, and performance'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Modal Content */}
              <div style={{ padding: '2rem', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>
                  <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}>
                    {activeModal === 'assembly' && '🏛️'}
                    {activeModal === 'campaigns' && '⚔️'}
                    {activeModal === 'headwinds' && '🌀'}
                    {activeModal === 'founding' && '📜'}
                    {activeModal === 'legacy' && '🏆'}
                    {activeModal === 'ledger' && '📒'}
                  </span>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>Coming Soon</h3>
                  <p>This section is under development. Full functionality will be available soon.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
