'use client';
import { CMOLayout, Card, Button, EmptyState } from '../components';

export default function CMOAssetsPage() {
  return (
    <CMOLayout>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--zander-navy)',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            Brand Assets
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
            Manage your brand library and media
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost">Folders</Button>
          <Button variant="primary">+ Upload Asset</Button>
        </div>
      </div>

      {/* Assets Placeholder */}
      <Card>
        <EmptyState
          icon="🎨"
          title="Coming in Phase 4"
          description="Store and organize your brand assets including logos, images, videos, and design templates."
          action={<Button variant="secondary">Learn More</Button>}
        />
      </Card>
    </CMOLayout>
  );
}
