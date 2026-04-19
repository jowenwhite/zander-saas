'use client';

import dynamic from 'next/dynamic';

// Dynamically import the component with SSR disabled to avoid pre-rendering issues
const LoginContent = dynamic(
  () => import('./LoginContent'),
  { ssr: false, loading: () => <div style={{ minHeight: '100vh', background: '#09090F' }} /> }
);

export default function LoginPage() {
  return <LoginContent />;
}
