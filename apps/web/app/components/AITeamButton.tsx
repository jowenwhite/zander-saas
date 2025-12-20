'use client';
import { useState } from 'react';

interface Executive {
  id: string;
  name: string;
  role: string;
  fullTitle: string;
  avatar: string;
  color: string;
  status: 'active' | 'coming_soon';
}

const executives: Executive[] = [
  { id: 'cro', name: 'Jordan', role: 'CRO', fullTitle: 'Chief Revenue Officer', avatar: '💼', color: '#BF0A30', status: 'active' },
  { id: 'cfo', name: 'Ben', role: 'CFO', fullTitle: 'Chief Financial Officer', avatar: '📊', color: '#2E7D32', status: 'coming_soon' },
  { id: 'coo', name: 'Miranda', role: 'COO', fullTitle: 'Chief Operations Officer', avatar: '⚙️', color: '#5E35B1', status: 'coming_soon' },
  { id: 'cmo', name: 'Don', role: 'CMO', fullTitle: 'Chief Marketing Officer', avatar: '🎨', color: '#F57C00', status: 'coming_soon' },
  { id: 'cpo', name: 'Ted', role: 'CPO', fullTitle: 'Chief People Officer', avatar: '👥', color: '#0288D1', status: 'coming_soon' },
  { id: 'cio', name: 'Jarvis', role: 'CIO', fullTitle: 'Chief Information Officer', avatar: '💻', color: '#455A64', status: 'coming_soon' },
  { id: 'ea', name: 'Pam', role: 'EA', fullTitle: 'Executive Assistant', avatar: '📋', color: '#C2185B', status: 'coming_soon' },
];

export default function AITeamButton() {
  const [showModal, setShowModal] = useState(false);

  const handleExecutiveClick = (exec: Executive) => {
    if (exec.status === 'active') {
      window.location.href = '/ai';
    } else {
      alert(`${exec.name} (${exec.fullTitle}) is coming soon!`);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--zander-red, #BF0A30)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          zIndex: 1000,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        }}
        title="Your AI Team"
      >
        🤖
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
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--zander-navy, #0C2340)', fontSize: '1.5rem' }}>Your AI Team</h2>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--zander-gray, #6c757d)', fontSize: '0.9rem' }}>
                  Meet your virtual executives
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--zander-gray, #6c757d)'
                }}
              >
                ✕
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
                    background: exec.status === 'active' ? `${exec.color}15` : 'var(--zander-off-white, #f8f9fa)',
                    border: exec.status === 'active' ? `2px solid ${exec.color}` : '2px solid transparent',
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
                    background: exec.status === 'active' ? exec.color : 'var(--zander-gray, #6c757d)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {exec.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--zander-navy, #0C2340)', fontSize: '1rem' }}>{exec.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--zander-gray, #6c757d)' }}>({exec.role})</span>
                      {exec.status === 'coming_soon' && (
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          background: 'rgba(240, 179, 35, 0.2)',
                          color: '#B8860B',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: '600'
                        }}>SOON</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--zander-gray, #6c757d)' }}>{exec.fullTitle}</div>
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
