'use client';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { Users, UserPlus, Heart, GraduationCap, MessageSquare } from 'lucide-react';

export default function CPOPage() {
  const moduleColor = '#0288D1';

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#09090F' }}>
        <NavBar activeModule="cpo" />

        <div style={{ display: 'flex', marginTop: '64px' }}>
          <Sidebar />

          <main style={{
            flex: 1,
            marginLeft: '240px',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)'
          }}>
            <div style={{
              background: '#13131A',
              border: '2px solid #2A2A38',
              borderRadius: '16px',
              padding: '3rem',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center'
            }}>
              {/* Executive Avatar */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: moduleColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: `0 0 30px ${moduleColor}40`
              }}>
                <Users size={36} color="white" />
              </div>

              {/* Executive Info */}
              <h1 style={{
                color: '#F0F0F5',
                fontSize: '2rem',
                fontWeight: '700',
                margin: '0 0 0.5rem'
              }}>
                Meet Ted
              </h1>
              <p style={{
                color: moduleColor,
                fontSize: '1.1rem',
                fontWeight: '600',
                margin: '0 0 1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Chief People Officer
              </p>

              {/* Description */}
              <p style={{
                color: '#8888A0',
                fontSize: '1rem',
                lineHeight: '1.7',
                margin: '0 0 2rem'
              }}>
                Ted believes the best business results come from teams that genuinely thrive.
                He helps you build culture, navigate difficult conversations, hire the right people,
                and become the leader your team needs. Never preachy, always practical.
              </p>

              {/* Features Preview */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {[
                  { icon: <UserPlus size={20} />, label: 'Hiring & Recruiting' },
                  { icon: <Heart size={20} />, label: 'Culture Building' },
                  { icon: <GraduationCap size={20} />, label: 'Team Development' },
                  { icon: <MessageSquare size={20} />, label: 'Feedback Tools' },
                ].map((feature, i) => (
                  <div key={i} style={{
                    background: '#1C1C26',
                    border: '1px solid #2A2A38',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#8888A0'
                  }}>
                    <span style={{ color: moduleColor }}>{feature.icon}</span>
                    <span style={{ fontSize: '0.9rem' }}>{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* Coming Soon Badge */}
              <div style={{
                background: `${moduleColor}15`,
                border: `2px solid ${moduleColor}`,
                borderRadius: '8px',
                padding: '1rem 1.5rem',
                display: 'inline-block'
              }}>
                <span style={{
                  color: moduleColor,
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  Coming Q4 2026
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
