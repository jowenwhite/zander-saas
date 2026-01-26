'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CROPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main projects/pipeline page which is the CRO home
    router.replace('/projects');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--zander-light-gray)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💼</div>
        <p style={{ color: 'var(--zander-gray)' }}>Loading CRO Dashboard...</p>
      </div>
    </div>
  );
}
