'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CMOLayout, Card, Button, EmptyState } from '../components';
import { Funnel, FunnelFormData } from './types';
import FunnelListCard from './components/FunnelListCard';
import FunnelModal from './components/FunnelModal';

export default function CMOFunnelsPage() {
  const router = useRouter();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);

  const fetchFunnels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/funnels`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch funnels');
      }

      const data = await response.json();
      setFunnels(data);
    } catch (err) {
      console.error('Error fetching funnels:', err);
      setError('Failed to load funnels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFunnels();
  }, [fetchFunnels]);

  const handleCreateFunnel = () => {
    setEditingFunnel(null);
    setShowModal(true);
  };

  const handleEditFunnel = (funnel: Funnel, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFunnel(funnel);
    setShowModal(true);
  };

  const handleDeleteFunnel = async (funnel: Funnel, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${funnel.name}"?`)) return;

    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/funnels/${funnel.id}`,
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

      setFunnels((prev) => prev.filter((f) => f.id !== funnel.id));
    } catch (err) {
      console.error('Error deleting funnel:', err);
      alert('Failed to delete funnel. Please try again.');
    }
  };

  const handleSaveFunnel = async (data: FunnelFormData) => {
    try {
      const token = localStorage.getItem('zander_token');
      const isEdit = !!editingFunnel;
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/funnels/${editingFunnel.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/funnels`;

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          conversionGoal: data.conversionGoal || null,
          status: data.status,
          stages: isEdit ? editingFunnel.stages : [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save funnel');
      }

      const savedFunnel = await response.json();

      if (isEdit) {
        setFunnels((prev) =>
          prev.map((f) => (f.id === savedFunnel.id ? savedFunnel : f))
        );
      } else {
        setFunnels((prev) => [...prev, savedFunnel]);
        // Navigate to builder for new funnels
        router.push(`/cmo/funnels/${savedFunnel.id}`);
      }
    } catch (err) {
      console.error('Error saving funnel:', err);
      alert('Failed to save funnel. Please try again.');
    }
  };

  const handleFunnelClick = (funnel: Funnel) => {
    router.push(`/cmo/funnels/${funnel.id}`);
  };

  const handleModalDelete = async () => {
    if (!editingFunnel) return;
    if (!confirm(`Are you sure you want to delete "${editingFunnel.name}"?`)) return;

    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/cmo/funnels/${editingFunnel.id}`,
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

      setFunnels((prev) => prev.filter((f) => f.id !== editingFunnel.id));
      setShowModal(false);
      setEditingFunnel(null);
    } catch (err) {
      console.error('Error deleting funnel:', err);
      alert('Failed to delete funnel. Please try again.');
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
            Marketing Funnels
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
            Build and manage your lead conversion funnels
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="primary" onClick={handleCreateFunnel}>
            + New Funnel
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
            Loading funnels...
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              ⚠️
            </div>
            <h3
              style={{
                color: 'var(--zander-navy)',
                margin: '0 0 0.5rem 0',
              }}
            >
              Error Loading Funnels
            </h3>
            <p style={{ color: 'var(--zander-gray)', margin: '0 0 1.5rem 0' }}>
              {error}
            </p>
            <Button variant="secondary" onClick={fetchFunnels}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : funnels.length === 0 ? (
        <Card>
          <EmptyState
            icon="🎯"
            title="No Funnels Yet"
            description="Create your first marketing funnel to start tracking visitor journeys and conversions."
            action={
              <Button variant="primary" onClick={handleCreateFunnel}>
                + Create Your First Funnel
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
          {funnels.map((funnel) => (
            <FunnelListCard
              key={funnel.id}
              funnel={funnel}
              onClick={() => handleFunnelClick(funnel)}
              onEdit={(e) => handleEditFunnel(funnel, e)}
              onDelete={(e) => handleDeleteFunnel(funnel, e)}
            />
          ))}
        </div>
      )}

      {/* Funnel Modal */}
      <FunnelModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFunnel(null);
        }}
        funnel={editingFunnel}
        onSave={handleSaveFunnel}
        onDelete={editingFunnel ? handleModalDelete : undefined}
      />
    </CMOLayout>
  );
}
