'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CMOLayout, Card, Button } from '../../components';
import { Funnel, FunnelStage, FunnelFormData, StageFormData } from '../types';
import { reorderStages, generateTempId, isTempId, getStatusBadgeStyle, getStatusLabel } from '../utils';
import FunnelBuilder from '../components/FunnelBuilder';
import FunnelAnalytics from '../components/FunnelAnalytics';
import FunnelModal from '../components/FunnelModal';
import StageConfigModal from '../components/StageConfigModal';

export default function FunnelBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const funnelId = params.id as string;

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal states
  const [showFunnelModal, setShowFunnelModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState<FunnelStage | null>(null);

  const fetchFunnel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/funnels/${funnelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Funnel not found');
        }
        throw new Error('Failed to fetch funnel');
      }

      const data = await response.json();
      setFunnel(data);
    } catch (err) {
      console.error('Error fetching funnel:', err);
      setError(err instanceof Error ? err.message : 'Failed to load funnel');
    } finally {
      setLoading(false);
    }
  }, [funnelId]);

  useEffect(() => {
    fetchFunnel();
  }, [fetchFunnel]);

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

  const handleSaveFunnel = async () => {
    if (!funnel) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('zander_token');

      // Prepare stages for save - remove temp IDs
      const stagesToSave = funnel.stages.map((stage) => ({
        name: stage.name,
        stageType: stage.stageType,
        stageOrder: stage.stageOrder,
        config: stage.config,
        entryCount: stage.entryCount,
        exitCount: stage.exitCount,
        conversionRate: stage.conversionRate,
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/funnels/${funnelId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: funnel.name,
            description: funnel.description,
            conversionGoal: funnel.conversionGoal,
            status: funnel.status,
            stages: stagesToSave,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save funnel');
      }

      const savedFunnel = await response.json();
      setFunnel(savedFunnel);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving funnel:', err);
      alert('Failed to save funnel. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFunnelInfo = async (data: FunnelFormData) => {
    if (!funnel) return;

    setFunnel({
      ...funnel,
      name: data.name,
      description: data.description || null,
      conversionGoal: data.conversionGoal || null,
      status: data.status,
    });
    setHasUnsavedChanges(true);
  };

  const handleAddStage = () => {
    setEditingStage(null);
    setShowStageModal(true);
  };

  const handleEditStage = (stage: FunnelStage) => {
    setEditingStage(stage);
    setShowStageModal(true);
  };

  const handleSaveStage = (data: StageFormData) => {
    if (!funnel) return;

    if (editingStage) {
      // Update existing stage
      const updatedStages = funnel.stages.map((s) =>
        s.id === editingStage.id
          ? { ...s, name: data.name, stageType: data.stageType, config: data.config }
          : s
      );
      setFunnel({ ...funnel, stages: updatedStages });
    } else {
      // Add new stage
      const newStage: FunnelStage = {
        id: generateTempId(),
        funnelId: funnel.id,
        name: data.name,
        stageType: data.stageType,
        stageOrder: funnel.stages.length,
        config: data.config,
        entryCount: 0,
        exitCount: 0,
        conversionRate: null,
      };
      setFunnel({ ...funnel, stages: [...funnel.stages, newStage] });
    }
    setHasUnsavedChanges(true);
  };

  const handleDeleteStage = (stageId: string) => {
    if (!funnel) return;
    if (!confirm('Are you sure you want to delete this stage?')) return;

    const remainingStages = funnel.stages
      .filter((s) => s.id !== stageId)
      .map((s, index) => ({ ...s, stageOrder: index }));

    setFunnel({ ...funnel, stages: remainingStages });
    setHasUnsavedChanges(true);
  };

  const handleMoveStage = (stageId: string, direction: 'up' | 'down') => {
    if (!funnel) return;

    const newStages = reorderStages(funnel.stages, stageId, direction);
    setFunnel({ ...funnel, stages: newStages });
    setHasUnsavedChanges(true);
  };

  const handleDeleteFromModal = () => {
    if (!editingStage) return;
    handleDeleteStage(editingStage.id);
    setShowStageModal(false);
    setEditingStage(null);
  };

  const handleDeleteFunnel = async () => {
    if (!funnel) return;
    if (!confirm(`Are you sure you want to delete "${funnel.name}"? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/funnels/${funnelId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete funnel');
      }

      router.push('/cmo/funnels');
    } catch (err) {
      console.error('Error deleting funnel:', err);
      alert('Failed to delete funnel. Please try again.');
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
            Loading funnel...
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              ⚠️
            </div>
            <h3 style={{ color: 'var(--zander-navy)', margin: '0 0 0.5rem 0' }}>
              {error === 'Funnel not found' ? 'Funnel Not Found' : 'Error Loading Funnel'}
            </h3>
            <p style={{ color: 'var(--zander-gray)', margin: '0 0 1.5rem 0' }}>
              {error}
            </p>
            <Button variant="secondary" onClick={() => router.push('/cmo/funnels')}>
              Back to Funnels
            </Button>
          </div>
        </Card>
      </CMOLayout>
    );
  }

  if (!funnel) return null;

  const statusStyle = getStatusBadgeStyle(funnel.status);

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
                router.push('/cmo/funnels');
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
              {funnel.name}
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
              {getStatusLabel(funnel.status)}
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
          {funnel.description && (
            <p style={{ color: 'var(--zander-gray)', margin: '0.5rem 0 0 0' }}>
              {funnel.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={() => setShowFunnelModal(true)}>
            Edit Info
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveFunnel}
            disabled={!hasUnsavedChanges || saving}
          >
            {saving ? 'Saving...' : 'Save Funnel'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Builder */}
        <FunnelBuilder
          stages={funnel.stages}
          onMoveStage={handleMoveStage}
          onEditStage={handleEditStage}
          onDeleteStage={handleDeleteStage}
          onAddStage={handleAddStage}
        />

        {/* Analytics */}
        <FunnelAnalytics
          stages={funnel.stages}
          totalVisits={funnel.totalVisits}
          totalConversions={funnel.totalConversions}
        />
      </div>

      {/* Funnel Info Modal */}
      <FunnelModal
        isOpen={showFunnelModal}
        onClose={() => setShowFunnelModal(false)}
        funnel={funnel}
        onSave={handleUpdateFunnelInfo}
        onDelete={handleDeleteFunnel}
      />

      {/* Stage Config Modal */}
      <StageConfigModal
        isOpen={showStageModal}
        onClose={() => {
          setShowStageModal(false);
          setEditingStage(null);
        }}
        stage={editingStage}
        onSave={handleSaveStage}
        onDelete={editingStage ? handleDeleteFromModal : undefined}
      />
    </CMOLayout>
  );
}
