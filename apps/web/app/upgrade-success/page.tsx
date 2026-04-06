'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

const TIER_CONFIG: Record<string, {
  displayName: string;
  color: string;
  monthlyPrice: number;
  executives: { name: string; role: string; color: string }[];
  features: string[];
}> = {
  STARTER: {
    displayName: 'Starter',
    color: '#00CCEE',
    monthlyPrice: 199,
    executives: [
      { name: 'Pam', role: 'Executive Assistant', color: '#00CCEE' },
    ],
    features: [
      'Pam, your AI Executive Assistant',
      'HQ — your business command center',
      'Inbox management and draft routing',
      'Calendar and scheduling',
      'SMS and follow-up sequences',
      '30-day money-back guarantee',
    ],
  },
  PRO: {
    displayName: 'Pro',
    color: '#F57C00',
    monthlyPrice: 349,
    executives: [
      { name: 'Pam', role: 'Executive Assistant', color: '#00CCEE' },
      { name: 'Don', role: 'Chief Marketing Officer', color: '#F57C00' },
    ],
    features: [
      'Everything in Starter, plus:',
      'Don, your AI CMO',
      'Marketing calendar and campaign execution',
      'Brand and content strategy',
      'Social and email sequences',
      '30-day money-back guarantee',
    ],
  },
  BUSINESS: {
    displayName: 'Business',
    color: '#2E7D32',
    monthlyPrice: 599,
    executives: [
      { name: 'Pam', role: 'Executive Assistant', color: '#00CCEE' },
      { name: 'Don', role: 'Chief Marketing Officer', color: '#F57C00' },
      { name: 'Jordan', role: 'Chief Revenue Officer', color: '#2E7D32' },
    ],
    features: [
      'Everything in Pro, plus:',
      'Jordan, your AI CRO',
      'Pipeline management and deal tracking',
      'Outreach sequences and lead follow-up',
      'Full executive team operating in sync',
      '30-day money-back guarantee',
    ],
  },
};

function UpgradeSuccessContent() {
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier')?.toUpperCase() || 'STARTER';
  const config = TIER_CONFIG[tier] || TIER_CONFIG.STARTER;

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090F',
      color: '#F0F0F5',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Confetti animation overlay */}
      {showConfetti && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                background: ['#00CCEE', '#F57C00', '#2E7D32', '#F0B429', '#5E35B1'][i % 5],
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animation: `confettiFall ${2 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                opacity: 0.8,
              }}
            />
          ))}
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Main content */}
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Success checkmark */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${config.color}33 0%, ${config.color}11 100%)`,
          border: `2px solid ${config.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          marginBottom: '0.5rem',
          lineHeight: 1.2,
        }}>
          Welcome to Zander{' '}
          <span style={{ color: config.color }}>{config.displayName}</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: '#8888A0',
          marginBottom: '2rem',
        }}>
          Your AI executive team is ready to get to work.
        </p>

        {/* Executives unlocked */}
        <div style={{
          background: '#1C1C26',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #2A2A38',
        }}>
          <p style={{
            fontSize: '0.85rem',
            color: '#55556A',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1rem',
          }}>
            Your Executive Team
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            {config.executives.map((exec, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#09090F',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                border: `1px solid ${exec.color}33`,
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: exec.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#fff',
                  fontSize: '1.1rem',
                }}>
                  {exec.name[0]}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>{exec.name}</p>
                  <p style={{ margin: 0, color: '#8888A0', fontSize: '0.8rem' }}>{exec.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features list */}
        <div style={{
          background: '#1C1C26',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #2A2A38',
          textAlign: 'left',
        }}>
          <p style={{
            fontSize: '0.85rem',
            color: '#55556A',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1rem',
          }}>
            What's Included
          </p>
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {config.features.map((feature, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                color: '#F0F0F5',
                fontSize: '0.95rem',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Money-back guarantee notice */}
        <div style={{
          background: 'rgba(46, 125, 50, 0.1)',
          border: '1px solid rgba(46, 125, 50, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
        }}>
          <p style={{
            margin: 0,
            color: '#4CAF50',
            fontSize: '0.95rem',
          }}>
            Your subscription is now active. 30-day money-back guarantee — no questions asked.
          </p>
        </div>

        {/* CTA */}
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: config.color,
            color: '#000',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '1.1rem',
            textDecoration: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 20px ${config.color}40`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Meet Your Team
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>

        <p style={{
          marginTop: '1.5rem',
          color: '#55556A',
          fontSize: '0.85rem',
        }}>
          Questions? Email us at support@zanderos.com
        </p>
      </div>
    </div>
  );
}

// Wrap in Suspense to handle useSearchParams
export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#09090F' }} />}>
      <UpgradeSuccessContent />
    </Suspense>
  );
}
