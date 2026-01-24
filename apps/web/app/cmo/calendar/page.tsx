'use client';
import { CMOLayout, Card, Button, EmptyState } from '../components';

export default function CMOCalendarPage() {
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
            Marketing Calendar
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
            Plan and schedule your marketing activities
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost">Today</Button>
          <Button variant="primary">+ Schedule Activity</Button>
        </div>
      </div>

      {/* Calendar Placeholder */}
      <Card>
        <EmptyState
          icon="📅"
          title="Coming in Phase 3"
          description="The marketing calendar with campaign scheduling, content planning, and team coordination will be available here."
          action={<Button variant="secondary">Learn More</Button>}
        />
      </Card>
    </CMOLayout>
  );
}
