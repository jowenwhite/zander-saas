'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * CMO Communication Module
 *
 * Redirects to the unified Communication Hub (/communication) which provides
 * the full-featured inbox experience for both CRO and CMO users.
 *
 * This ensures a single, consistent communication experience across the platform.
 */
export default function CMOCommunicationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/communication');
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#09090F',
        color: '#8888A0',
      }}
    >
      Redirecting to Communication Hub...
    </div>
  );
}
