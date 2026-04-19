'use client';

import dynamic from 'next/dynamic';

// Dynamically import the component with SSR disabled to avoid pre-rendering issues
const CMOFunnelsContent = dynamic(
  () => import('./FunnelsContent'),
  { ssr: false, loading: () => <div style={{ minHeight: '100vh', background: '#13131A' }} /> }
);

export default function CMOFunnelsPage() {
  return <CMOFunnelsContent />;
}
