'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Fetch download URL from API
      fetch(`/api/store/download?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.downloadUrl) {
            setDownloadUrl(data.downloadUrl);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: '#080A0F',
      color: '#FFFFFF',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '1rem',
        }}>Purchase Complete!</h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
          Thank you for your purchase. A confirmation email with your download link
          has been sent to your email address.
        </p>

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading download link...</p>
        ) : downloadUrl ? (
          <a
            href={downloadUrl}
            style={{
              display: 'inline-block',
              background: '#00CFEB',
              color: '#000',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1.1rem',
              textDecoration: 'none',
              marginBottom: '1rem',
            }}
          >
            Download Now
          </a>
        ) : null}

        <div style={{ marginTop: '2rem' }}>
          <a
            href="/store"
            style={{
              color: '#00CFEB',
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            &larr; Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}

export default function StoreSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        fontFamily: "'Inter', sans-serif",
        background: '#080A0F',
        color: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p>Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
