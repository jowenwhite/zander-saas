'use client';

import CMOLayout from '../components/CMOLayout';

export default function CMOCommunicationPage() {
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
            Marketing Communication
          </h1>
          <p style={{ color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
            Manage email campaigns, notifications, and messaging
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '2px solid var(--zander-border-gray)',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--zander-navy)',
            marginBottom: '0.5rem'
          }}>
            Coming Soon
          </h2>
          <p style={{ color: 'var(--zander-gray)', maxWidth: '400px', margin: '0 auto' }}>
            Marketing communication hub is under development. Send email blasts, manage drip campaigns, and track message performance.
          </p>
        </div>
      </div>
    </CMOLayout>
  );
}
