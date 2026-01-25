'use client';

import CMOLayout from '../components/CMOLayout';

export default function CMOSchedulePage() {
  return (
    <CMOLayout>
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--zander-navy)',
            margin: 0
          }}>
            Marketing Schedule
          </h1>
          <p style={{ color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
            Team availability and marketing meetings
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '2px solid var(--zander-border-gray)',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--zander-navy)',
            marginBottom: '0.5rem'
          }}>
            Coming Soon
          </h2>
          <p style={{ color: 'var(--zander-gray)', maxWidth: '400px', margin: '0 auto' }}>
            Marketing team scheduling is under development. Coordinate meetings, plan content reviews, and manage team availability.
          </p>
          <p style={{ color: 'var(--zander-gray)', marginTop: '1rem', fontSize: '0.875rem' }}>
            For marketing events and campaigns, use the <a href="/cmo/calendar" style={{ color: '#F57C00', textDecoration: 'none', fontWeight: '600' }}>Marketing Calendar</a>.
          </p>
        </div>
      </div>
    </CMOLayout>
  );
}
