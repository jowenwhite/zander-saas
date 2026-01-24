'use client';
import { CMOLayout, Card, Button, EmptyState } from '../components';

export default function CMOFunnelsPage() {
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
            Marketing Funnels
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
            Build and manage your lead conversion funnels
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost">Templates</Button>
          <Button variant="primary">+ New Funnel</Button>
        </div>
      </div>

      {/* Funnels Placeholder */}
      <Card>
        <EmptyState
          icon="🎯"
          title="Coming in Phase 5"
          description="Create and manage marketing funnels with drag-and-drop builders, conversion tracking, and A/B testing capabilities."
          action={<Button variant="secondary">Learn More</Button>}
        />
      </Card>
    </CMOLayout>
  );
}
