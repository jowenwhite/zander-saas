'use client';
import { useState } from 'react';
import { Briefcase, BarChart3, Settings, Palette, Users, Monitor, ClipboardList, Bot, X } from 'lucide-react';

interface Executive {
  id: string;
  name: string;
  role: string;
  fullTitle: string;
  icon: string;
  color: string;
  status: 'active' | 'coming_soon';
}

const getExecutiveIcon = (iconKey: string, size: number = 24): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    briefcase: <Briefcase size={size} />,
    chart: <BarChart3 size={size} />,
    settings: <Settings size={size} />,
    palette: <Palette size={size} />,
    users: <Users size={size} />,
    monitor: <Monitor size={size} />,
    clipboard: <ClipboardList size={size} />,
  };
  return icons[iconKey] || <Briefcase size={size} />;
};

const executives: Executive[] = [
  { id: 'cro', name: 'Jordan', role: 'CRO', fullTitle: 'Chief Revenue Officer', icon: 'briefcase', color: '#BF0A30', status: 'active' },
  { id: 'cmo', name: 'Don', role: 'CMO', fullTitle: 'Chief Marketing Officer', icon: 'palette', color: '#F57C00', status: 'active' },
  { id: 'ea', name: 'Pam', role: 'EA', fullTitle: 'Executive Assistant', icon: 'clipboard', color: '#C2185B', status: 'active' },
  { id: 'cfo', name: 'Ben', role: 'CFO', fullTitle: 'Chief Financial Officer', icon: 'chart', color: '#2E7D32', status: 'coming_soon' },
  { id: 'coo', name: 'Miranda', role: 'COO', fullTitle: 'Chief Operations Officer', icon: 'settings', color: '#5E35B1', status: 'coming_soon' },
  { id: 'cpo', name: 'Ted', role: 'CPO', fullTitle: 'Chief People Officer', icon: 'users', color: '#0288D1', status: 'coming_soon' },
  { id: 'cio', name: 'Jarvis', role: 'CIO', fullTitle: 'Chief Information Officer', icon: 'monitor', color: '#455A64', status: 'coming_soon' },
];

export default function AITeamButton() {
  const [showModal, setShowModal] = useState(false);

  const handleExecutiveClick = (exec: Executive) => {
    if (exec.status === 'coming_soon') {
      alert(`${exec.name} (${exec.fullTitle}) is coming soon!`);
      return;
    }

    // Route to executive-specific pages
    const executiveRoutes: Record<string, string> = {
      cro: '/ai',      // Jordan
      cmo: '/cmo/ai',  // Don
      ea: '/ea',       // Pam
    };

    const route = executiveRoutes[exec.id];
    if (route) {
      window.location.href = route;
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--zander-red, #BF0A30)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          zIndex: 9999,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        }}
        title="Your AI Team"
      >
        <Bot size={32} />
      </button>

      {/* Modal */}
      {showModal && (
        <div
          style={{
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
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              border: '2px solid #2A2A38'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.5rem' }}>Your AI Team</h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#8888A0', fontSize: '0.9rem' }}>
                  Meet your virtual executives
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8888A0',
                  padding: '0.25rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {executives.map((exec) => (
                <button
                  key={exec.id}
                  onClick={() => handleExecutiveClick(exec)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: exec.status === 'active' ? `${exec.color}15` : '#13131A',
                    border: exec.status === 'active' ? `2px solid ${exec.color}` : '2px solid #2A2A38',
                    borderRadius: '12px',
                    cursor: exec.status === 'active' ? 'pointer' : 'default',
                    textAlign: 'left',
                    opacity: exec.status === 'coming_soon' ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: exec.status === 'active' ? exec.color : '#55556A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    {getExecutiveIcon(exec.icon)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '1rem' }}>{exec.name}</span>
                      <span style={{ fontSize: '0.8rem', color: '#8888A0' }}>({exec.role})</span>
                      {exec.status === 'coming_soon' && (
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          background: 'rgba(240, 179, 35, 0.2)',
                          color: '#F0B323',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: '600'
                        }}>SOON</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#8888A0' }}>{exec.fullTitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
