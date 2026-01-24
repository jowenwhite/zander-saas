'use client';
import { CMOLayout, Card, Button, EmptyState } from '../components';

export default function CMOWorkflowsPage() {
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
            Marketing Workflows
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
            Automate your marketing processes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost">Templates</Button>
          <Button variant="primary">+ New Workflow</Button>
        </div>
      </div>

      {/* Workflows Placeholder */}
      <Card>
        <EmptyState
          icon="⚡"
          title="Coming in Phase 5"
          description="Design automated marketing workflows with triggers, actions, and conditions to streamline your campaigns."
          action={<Button variant="secondary">Learn More</Button>}
        />
      </Card>
    </CMOLayout>
  );
}
