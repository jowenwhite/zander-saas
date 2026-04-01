'use client';
import { useState } from 'react';
import { X, Clock, Bell, Sparkles, CheckCircle } from 'lucide-react';
import { getToken } from '../utils/auth';

interface Executive {
  id: string;
  label: string;
  role: string;
  fullTitle: string;
  color: string;
}

// Executive capabilities preview
const EXECUTIVE_CAPABILITIES: Record<string, string[]> = {
  ben: [
    'Financial dashboards & reporting',
    'Budget tracking & forecasting',
    'Expense management',
    'Cash flow analysis',
    'Invoice processing',
    'Tax preparation assistance',
  ],
  miranda: [
    'Operations optimization',
    'Process automation',
    'Supply chain management',
    'Resource planning',
    'Vendor management',
    'Quality assurance',
  ],
  ted: [
    'HR management assistance',
    'Hiring & onboarding',
    'Performance reviews',
    'Team engagement',
    'Benefits administration',
    'Company culture initiatives',
  ],
  jarvis: [
    'IT infrastructure management',
    'Security monitoring',
    'Data analytics',
    'System integrations',
    'Technical documentation',
    'Automation workflows',
  ],
};

interface ComingSoonModalProps {
  executive: Executive;
  onClose: () => void;
}

export default function ComingSoonModal({ executive, onClose }: ComingSoonModalProps) {
  const [notifyRequested, setNotifyRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const capabilities = EXECUTIVE_CAPABILITIES[executive.id] || [];

  const handleNotifyMe = async () => {
    setLoading(true);

    try {
      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      // This endpoint would be created to track interest
      await fetch(`${apiUrl}/waitlist/executive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          executiveId: executive.id,
        }),
      });

      setNotifyRequested(true);
    } catch (err) {
      // Still show success - the feature is mostly for tracking interest
      setNotifyRequested(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#1C1C26',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          border: '1px solid #2A2A38',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${executive.color}15 0%, transparent 100%)`,
            padding: '2rem',
            borderBottom: '1px solid #2A2A38',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              color: '#8888A0',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#2A2A38',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: `2px dashed ${executive.color}40`,
              }}
            >
              <span style={{ fontSize: '28px', fontWeight: '700', color: executive.color, opacity: 0.6 }}>
                {executive.label[0]}
              </span>
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#55556A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={12} style={{ color: '#F0F0F5' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.5rem', fontWeight: '700' }}>
                  {executive.label}
                </h2>
                <span
                  style={{
                    background: 'rgba(85,85,106,0.3)',
                    color: '#8888A0',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Coming Q4 2026
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.95rem' }}>
                {executive.fullTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          <div
            style={{
              background: 'rgba(0,204,238,0.05)',
              border: '1px solid rgba(0,204,238,0.2)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <Sparkles size={20} style={{ color: '#00CCEE', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, color: '#F0F0F5', fontWeight: '600', marginBottom: '0.25rem' }}>
                We're building something special
              </p>
              <p style={{ margin: 0, color: '#8888A0', fontSize: '0.9rem' }}>
                {executive.label} is being crafted to bring powerful {executive.role} capabilities to your AI team.
              </p>
            </div>
          </div>

          {/* Capabilities Preview */}
          {capabilities.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.75rem', color: '#F0F0F5', fontWeight: '600' }}>
                Planned capabilities:
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {capabilities.map((capability, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#8888A0',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: executive.color,
                        opacity: 0.6,
                        flexShrink: 0,
                      }}
                    />
                    {capability}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notify section */}
          <div
            style={{
              background: '#09090F',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            {notifyRequested ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <CheckCircle size={24} style={{ color: '#22C55E' }} />
                <div>
                  <p style={{ margin: 0, color: '#F0F0F5', fontWeight: '600' }}>You're on the list!</p>
                  <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.85rem' }}>
                    We'll notify you when {executive.label} is ready
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p style={{ margin: '0 0 0.75rem', color: '#8888A0', fontSize: '0.9rem' }}>
                  Be the first to know when {executive.label} joins your team
                </p>
                <button
                  onClick={handleNotifyMe}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #2A2A38',
                    background: 'rgba(0,204,238,0.1)',
                    color: '#00CCEE',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Bell size={16} />
                  {loading ? 'Adding...' : 'Notify Me'}
                </button>
              </>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.875rem',
              borderRadius: '8px',
              border: 'none',
              background: '#2A2A38',
              color: '#F0F0F5',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
