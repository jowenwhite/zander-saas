'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function WaitlistContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // In a production app, you'd verify the session and get customer details
    // For now, just acknowledge the confirmation
    if (sessionId) {
      console.log('Waitlist confirmed for session:', sessionId);
    }
  }, [sessionId]);

  return (
    <div style={{
      fontFamily: "'Inter', var(--font-inter), sans-serif",
      background: '#080A0F',
      color: '#FFFFFF',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '560px',
        textAlign: 'center',
      }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: '3rem' }}>
          <Image
            src="/images/zander-logo-white.svg"
            alt="Zander"
            width={160}
            height={40}
            style={{ height: '40px', width: 'auto' }}
          />
        </a>

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '2px solid rgba(34, 197, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 style={{
          fontFamily: "'Sora', var(--font-sora), sans-serif",
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
        }}>
          You&apos;re on the list.
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.75,
          marginBottom: '2rem',
        }}>
          Your spot in the next Zander onboarding cohort is reserved. We&apos;ll be in touch soon with next steps.
        </p>

        <div style={{
          background: '#0E1017',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <h3 style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#00CFEB',
            marginBottom: '1rem',
          }}>What happens next:</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'You\'ll receive a confirmation email with your reservation details',
              'We onboard in small cohorts to ensure quality — you\'ll be notified when your cohort opens',
              'When it\'s your turn, you\'ll get access to select your plan and activate your executive team',
            ].map((item, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.55,
              }}>
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(0,207,235,0.1)',
                  color: '#00CFEB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: '2px',
                }}>{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p style={{
          fontSize: '0.95rem',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '2rem',
        }}>
          Questions? Reach out to <a href="mailto:support@zanderos.com" style={{ color: '#00CFEB', textDecoration: 'none' }}>support@zanderos.com</a>
        </p>

        <a href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'rgba(255,255,255,0.6)',
          textDecoration: 'none',
          fontSize: '0.95rem',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Zander
        </a>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{
      fontFamily: "'Inter', var(--font-inter), sans-serif",
      background: '#080A0F',
      color: '#FFFFFF',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading...</p>
    </div>
  );
}

export default function WaitlistConfirmedPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WaitlistContent />
    </Suspense>
  );
}
