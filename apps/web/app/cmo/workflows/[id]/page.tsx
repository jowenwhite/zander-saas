'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CMOLayout, Card, Button } from '../../components';
import {
  Workflow,
  WorkflowNode,
  WorkflowTriggerType,
  NodeFormData,
  InsertPosition,
} from '../types';
import {
  getStatusBadgeStyle,
  getStatusLabel,
  generateTempId,
  insertNodeAfter,
  removeNode,
} from '../utils';
import WorkflowBuilder from '../components/WorkflowBuilder';
import WorkflowAnalytics from '../components/WorkflowAnalytics';
import WorkflowModal from '../components/WorkflowModal';
import NodeConfigModal from '../components/NodeConfigModal';
import TriggerConfigModal from '../components/TriggerConfigModal';

export default function WorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal states
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const [insertPosition, setInsertPosition] = useState<InsertPosition>({ afterNodeId: null });

  const fetchWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows/${workflowId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Workflow not found');
        }
        throw new Error('Failed to fetch workflow');
      }

      const data = await response.json();
      setWorkflow(data);
    } catch (err) {
      console.error('Error fetching workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSaveWorkflow = async () => {
    if (!workflow) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('zander_token');

      // Prepare nodes for save
      const nodesToSave = workflow.nodes.map((node) => ({
        nodeType: node.nodeType,
        name: node.name,
        config: node.config,
        positionX: node.positionX,
        positionY: node.positionY,
        nextNodeId: node.nextNodeId,
        trueBranchId: node.trueBranchId,
        falseBranchId: node.falseBranchId,
        sortOrder: node.sortOrder,
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows/${workflowId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: workflow.name,
            description: workflow.description,
            triggerType: workflow.triggerType,
            triggerConfig: workflow.triggerConfig,
            status: workflow.status,
            nodes: nodesToSave,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save workflow');
      }

      const savedWorkflow = await response.json();
      setWorkflow(savedWorkflow);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving workflow:', err);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWorkflowInfo = async (data: {
    name: string;
    description: string;
    triggerType: WorkflowTriggerType;
    triggerConfig: Record<string, unknown>;
    status: 'draft' | 'active' | 'paused';
  }) => {
    if (!workflow) return;

    setWorkflow({
      ...workflow,
      name: data.name,
      description: data.description || null,
      triggerType: data.triggerType,
      triggerConfig: data.triggerConfig,
      status: data.status,
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateTrigger = (
    triggerType: WorkflowTriggerType,
    triggerConfig: Record<string, unknown>
  ) => {
    if (!workflow) return;

    setWorkflow({
      ...workflow,
      triggerType,
      triggerConfig,
    });
    setHasUnsavedChanges(true);
  };

  const handleAddNode = (position: InsertPosition) => {
    setInsertPosition(position);
    setEditingNode(null);
    setShowNodeModal(true);
  };

  const handleEditNode = (node: WorkflowNode) => {
    setEditingNode(node);
    setShowNodeModal(true);
  };

  const handleSaveNode = (data: NodeFormData) => {
    if (!workflow) return;

    if (editingNode) {
      // Update existing node
      const updatedNodes = workflow.nodes.map((n) =>
        n.id === editingNode.id
          ? { ...n, nodeType: data.nodeType, name: data.name, config: data.config }
          : n
      );
      setWorkflow({ ...workflow, nodes: updatedNodes });
    } else {
      // Add new node
      const newNode: WorkflowNode = {
        id: generateTempId(),
        workflowId: workflow.id,
        nodeType: data.nodeType,
        name: data.name,
        config: data.config,
        positionX: 0,
        positionY: 0,
        nextNodeId: null,
        trueBranchId: null,
        falseBranchId: null,
        sortOrder: workflow.nodes.length,
      };

      const updatedNodes = insertNodeAfter(
        workflow.nodes,
        newNode,
        insertPosition.afterNodeId,
        insertPosition.branch
      );
      setWorkflow({ ...workflow, nodes: updatedNodes });
    }
    setHasUnsavedChanges(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!workflow) return;
    if (!confirm('Are you sure you want to delete this node?')) return;

    const updatedNodes = removeNode(workflow.nodes, nodeId);
    setWorkflow({ ...workflow, nodes: updatedNodes });
    setHasUnsavedChanges(true);
  };

  const handleDeleteFromModal = () => {
    if (!editingNode) return;
    handleDeleteNode(editingNode.id);
    setShowNodeModal(false);
    setEditingNode(null);
  };

  const handleActivate = async () => {
    if (!workflow) return;

    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows/${workflowId}/activate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to activate workflow');
      }

      const updatedWorkflow = await response.json();
      setWorkflow(updatedWorkflow);
    } catch (err) {
      console.error('Error activating workflow:', err);
      alert('Failed to activate workflow. Please try again.');
    }
  };

  const handlePause = async () => {
    if (!workflow) return;

    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows/${workflowId}/pause`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to pause workflow');
      }

      const updatedWorkflow = await response.json();
      setWorkflow(updatedWorkflow);
    } catch (err) {
      console.error('Error pausing workflow:', err);
      alert('Failed to pause workflow. Please try again.');
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!workflow) return;
    if (!confirm(`Are you sure you want to delete "${workflow.name}"? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/workflows/${workflowId}`,
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

      router.push('/cmo/workflows');
    } catch (err) {
      console.error('Error deleting workflow:', err);
      alert('Failed to delete workflow. Please try again.');
    }
  };

  if (loading) {
    return (
      <CMOLayout>
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
            Loading workflow...
          </div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </Card>
      </CMOLayout>
    );
  }

  if (error) {
    return (
      <CMOLayout>
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
            <h3 style={{ color: 'var(--zander-navy)', margin: '0 0 0.5rem 0' }}>
              {error === 'Workflow not found' ? 'Workflow Not Found' : 'Error Loading Workflow'}
            </h3>
            <p style={{ color: 'var(--zander-gray)', margin: '0 0 1.5rem 0' }}>{error}</p>
            <Button variant="secondary" onClick={() => router.push('/cmo/workflows')}>
              Back to Workflows
            </Button>
          </div>
        </Card>
      </CMOLayout>
    );
  }

  if (!workflow) return null;

  const statusStyle = getStatusBadgeStyle(workflow.status);

  return (
    <CMOLayout>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              onClick={() => {
                if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  return;
                }
                router.push('/cmo/workflows');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--zander-gray)',
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '1rem',
              }}
            >
              ← Back
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--zander-navy)',
                margin: 0,
              }}
            >
              {workflow.name}
            </h1>
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: statusStyle.bg,
                color: statusStyle.color,
              }}
            >
              {getStatusLabel(workflow.status)}
            </span>
            {hasUnsavedChanges && (
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '500',
                  background: 'rgba(245, 124, 0, 0.1)',
                  color: '#F57C00',
                }}
              >
                Unsaved changes
              </span>
            )}
          </div>
          {workflow.description && (
            <p style={{ color: 'var(--zander-gray)', margin: '0.5rem 0 0 0' }}>
              {workflow.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={() => setShowWorkflowModal(true)}>
            Edit Info
          </Button>
          {workflow.status === 'active' ? (
            <Button variant="ghost" onClick={handlePause}>
              Pause
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleActivate}>
              Activate
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSaveWorkflow}
            disabled={!hasUnsavedChanges || saving}
          >
            {saving ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Builder */}
        <WorkflowBuilder
          nodes={workflow.nodes}
          triggerType={workflow.triggerType}
          triggerConfig={workflow.triggerConfig}
          onEditTrigger={() => setShowTriggerModal(true)}
          onAddNode={handleAddNode}
          onEditNode={handleEditNode}
          onDeleteNode={handleDeleteNode}
        />

        {/* Analytics */}
        <WorkflowAnalytics
          entryCount={workflow.entryCount}
          completionCount={workflow.completionCount}
          status={workflow.status}
        />
      </div>

      {/* Workflow Info Modal */}
      <WorkflowModal
        isOpen={showWorkflowModal}
        onClose={() => setShowWorkflowModal(false)}
        workflow={workflow}
        onSave={handleUpdateWorkflowInfo}
        onDelete={handleDeleteWorkflow}
      />

      {/* Trigger Config Modal */}
      <TriggerConfigModal
        isOpen={showTriggerModal}
        onClose={() => setShowTriggerModal(false)}
        triggerType={workflow.triggerType}
        triggerConfig={workflow.triggerConfig}
        onSave={handleUpdateTrigger}
      />

      {/* Node Config Modal */}
      <NodeConfigModal
        isOpen={showNodeModal}
        onClose={() => {
          setShowNodeModal(false);
          setEditingNode(null);
        }}
        node={editingNode}
        onSave={handleSaveNode}
        onDelete={editingNode ? handleDeleteFromModal : undefined}
      />
    </CMOLayout>
  );
}
