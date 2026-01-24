'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CMOLayout, Card, Button, EmptyState } from '../components';
import { Workflow, WorkflowFormData } from './types';
import WorkflowListCard from './components/WorkflowListCard';
import WorkflowModal from './components/WorkflowModal';

export default function CMOWorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }

      const data = await response.json();
      setWorkflows(data);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError('Failed to load workflows. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    setShowModal(true);
  };

  const handleEditWorkflow = (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkflow(workflow);
    setShowModal(true);
  };

  const handleDeleteWorkflow = async (workflow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${workflow.name}"?`)) return;

    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows/${workflow.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      setWorkflows((prev) => prev.filter((w) => w.id !== workflow.id));
    } catch (err) {
      console.error('Error deleting workflow:', err);
      alert('Failed to delete workflow. Please try again.');
    }
  };

  const handleSaveWorkflow = async (data: WorkflowFormData) => {
    try {
      const token = localStorage.getItem('zander_token');
      const isEdit = !!editingWorkflow;
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows/${editingWorkflow.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows`;

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          triggerType: data.triggerType,
          triggerConfig: data.triggerConfig || {},
          status: data.status,
          nodes: isEdit ? editingWorkflow.nodes : [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save workflow');
      }

      const savedWorkflow = await response.json();

      if (isEdit) {
        setWorkflows((prev) =>
          prev.map((w) => (w.id === savedWorkflow.id ? savedWorkflow : w))
        );
      } else {
        setWorkflows((prev) => [...prev, savedWorkflow]);
        // Navigate to builder for new workflows
        router.push(`/cmo/workflows/${savedWorkflow.id}`);
      }
    } catch (err) {
      console.error('Error saving workflow:', err);
      alert('Failed to save workflow. Please try again.');
    }
  };

  const handleWorkflowClick = (workflow: Workflow) => {
    router.push(`/cmo/workflows/${workflow.id}`);
  };

  const handleModalDelete = async () => {
    if (!editingWorkflow) return;
    if (!confirm(`Are you sure you want to delete "${editingWorkflow.name}"?`)) return;

    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows/${editingWorkflow.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      setWorkflows((prev) => prev.filter((w) => w.id !== editingWorkflow.id));
      setShowModal(false);
      setEditingWorkflow(null);
    } catch (err) {
      console.error('Error deleting workflow:', err);
      alert('Failed to delete workflow. Please try again.');
    }
  };

  return (
    <CMOLayout>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--zander-navy)',
              margin: 0,
              marginBottom: '0.25rem',
            }}
          >
            Marketing Workflows
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
            Automate your marketing processes with triggers and actions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="primary" onClick={handleCreateWorkflow}>
            + New Workflow
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '4rem',
              color: 'var(--zander-gray)',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                border: '3px solid var(--zander-border-gray)',
                borderTop: '3px solid #F57C00',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '1rem',
              }}
            />
            Loading workflows...
          </div>
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </Card>
      ) : error ? (
        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '4rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3
              style={{
                color: 'var(--zander-navy)',
                margin: '0 0 0.5rem 0',
              }}
            >
              Error Loading Workflows
            </h3>
            <p style={{ color: 'var(--zander-gray)', margin: '0 0 1.5rem 0' }}>{error}</p>
            <Button variant="secondary" onClick={fetchWorkflows}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : workflows.length === 0 ? (
        <Card>
          <EmptyState
            icon="⚡"
            title="No Workflows Yet"
            description="Create your first workflow to automate marketing tasks like sending emails, adding tags, and more."
            action={
              <Button variant="primary" onClick={handleCreateWorkflow}>
                + Create Your First Workflow
              </Button>
            }
          />
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {workflows.map((workflow) => (
            <WorkflowListCard
              key={workflow.id}
              workflow={workflow}
              onClick={() => handleWorkflowClick(workflow)}
              onEdit={(e) => handleEditWorkflow(workflow, e)}
              onDelete={(e) => handleDeleteWorkflow(workflow, e)}
            />
          ))}
        </div>
      )}

      {/* Workflow Modal */}
      <WorkflowModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingWorkflow(null);
        }}
        workflow={editingWorkflow}
        onSave={handleSaveWorkflow}
        onDelete={editingWorkflow ? handleModalDelete : undefined}
      />
    </CMOLayout>
  );
}
