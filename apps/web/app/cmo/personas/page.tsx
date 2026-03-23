'use client';
import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { CMOLayout, Button, EmptyState, LoadingSpinner } from '../components';
import PersonaCard from './components/PersonaCard';
import PersonaTestPanel from './components/PersonaTestPanel';
import PersonaModal from './components/PersonaModal';

interface Persona {
  id: string;
  name: string;
  avatar: string | null;
  tagline: string | null;
  isDefault: boolean;
  painPoints: string[];
  goals: string[];
  demographics: any;
  psychographics: any;
  behaviors: any;
  preferredChannels: string[];
  brandAffinities: string[];
  interview: string | null;
  _count?: { contacts: number };
}

interface PersonaFormData {
  name: string;
  tagline: string;
  painPoints: string[];
  goals: string[];
  preferredChannels: string[];
}

export default function CMOPersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPersonas = useCallback(async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/personas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPersonas(data);

        // Auto-select default persona or first one
        if (data.length > 0 && !selectedPersonaId) {
          const defaultPersona = data.find((p: Persona) => p.isDefault) || data[0];
          setSelectedPersonaId(defaultPersona.id);
        }
      }
    } catch (error) {
      console.error('Error fetching personas:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPersonaId]);

  const seedDefaultPersona = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/personas/seed-default`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast('Default persona created!');
        fetchPersonas();
      }
    } catch (error) {
      console.error('Error seeding default persona:', error);
      showToast('Failed to create default persona', 'error');
    }
  };

  const handleCreatePersona = async (data: PersonaFormData) => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/personas`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showToast('Persona created successfully!');
        setShowCreateModal(false);
        fetchPersonas();
      } else {
        showToast('Failed to create persona', 'error');
      }
    } catch (error) {
      console.error('Error creating persona:', error);
      showToast('Failed to create persona', 'error');
    }
  };

  const handleUpdatePersona = async (data: PersonaFormData) => {
    if (!editingPersona) return;

    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/personas/${editingPersona.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showToast('Persona updated successfully!');
        setEditingPersona(null);
        fetchPersonas();
      } else {
        showToast('Failed to update persona', 'error');
      }
    } catch (error) {
      console.error('Error updating persona:', error);
      showToast('Failed to update persona', 'error');
    }
  };

  const handleDeletePersona = async (personaId: string) => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/personas/${personaId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showToast('Persona deleted successfully!');
        setShowDeleteConfirm(null);
        setEditingPersona(null);
        if (selectedPersonaId === personaId) {
          setSelectedPersonaId(null);
        }
        fetchPersonas();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.message || 'Failed to delete persona', 'error');
      }
    } catch (error) {
      console.error('Error deleting persona:', error);
      showToast('Failed to delete persona', 'error');
    }
  };

  const handleCardClick = (persona: Persona) => {
    setEditingPersona(persona);
  };

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  // Listen for PEP tool execution events to refresh personas
  useEffect(() => {
    const handleToolExecuted = (e: CustomEvent) => {
      if (e.detail?.tools?.some((t: { tool: string; success: boolean }) =>
        t.tool === 'create_persona' && t.success
      )) {
        fetchPersonas();
      }
    };
    window.addEventListener('pep:tool-executed', handleToolExecuted as EventListener);
    return () => window.removeEventListener('pep:tool-executed', handleToolExecuted as EventListener);
  }, [fetchPersonas]);

  if (loading) {
    return (
      <CMOLayout>
        <div style={loadingContainerStyle}>
          <LoadingSpinner />
        </div>
      </CMOLayout>
    );
  }

  return (
    <CMOLayout>
      {/* Toast */}
      {toast && (
        <div
          style={{
            ...toastStyle,
            backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Customer Personas</h1>
          <p style={subtitleStyle}>Define your ideal customers and test content against them</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + New Persona
        </Button>
      </div>

      {personas.length === 0 ? (
        <div style={emptyContainerStyle}>
          <EmptyState
            icon="🎯"
            title="No personas yet"
            description="Create customer personas to better understand and target your audience"
            action={
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="secondary" onClick={seedDefaultPersona}>
                  Create Sample Persona
                </Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  + New Persona
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <div style={contentLayoutStyle}>
          {/* Personas Grid */}
          <div style={personasGridStyle}>
            <div style={gridStyle}>
              {personas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  isSelected={selectedPersonaId === persona.id}
                  onSelect={() => setSelectedPersonaId(persona.id)}
                  onEdit={() => handleCardClick(persona)}
                />
              ))}
            </div>
          </div>

          {/* Test Panel */}
          <div style={testPanelContainerStyle}>
            <PersonaTestPanel
              personas={personas}
              selectedPersonaId={selectedPersonaId}
              onPersonaChange={setSelectedPersonaId}
            />
          </div>
        </div>
      )}

      {/* Create Persona Modal */}
      <PersonaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreatePersona}
      />

      {/* Edit Persona Modal */}
      <PersonaModal
        isOpen={!!editingPersona}
        onClose={() => setEditingPersona(null)}
        onSave={handleUpdatePersona}
        initialData={editingPersona ? {
          name: editingPersona.name,
          tagline: editingPersona.tagline || '',
          painPoints: editingPersona.painPoints || [],
          goals: editingPersona.goals || [],
          preferredChannels: editingPersona.preferredChannels || [],
        } : undefined}
        onDelete={editingPersona ? () => setShowDeleteConfirm(editingPersona.id) : undefined}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={overlayStyle}>
          <div style={confirmDialogStyle}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#F0F0F5' }}>Delete Persona?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#8888A0', fontSize: '0.9rem' }}>
              This action cannot be undone. Any contacts linked to this persona will be unlinked.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeletePersona(showDeleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </CMOLayout>
  );
}

const loadingContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
};

const titleStyle: CSSProperties = {
  fontSize: '2rem',
  fontWeight: '700',
  color: '#F0F0F5',
  margin: 0,
  marginBottom: '0.25rem',
};

const subtitleStyle: CSSProperties = {
  color: '#8888A0',
  margin: 0,
};

const emptyContainerStyle: CSSProperties = {
  background: '#1C1C26',
  borderRadius: '12px',
  border: '1px solid #2A2A38',
  padding: '3rem',
};

const contentLayoutStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 400px',
  gap: '2rem',
  alignItems: 'start',
};

const personasGridStyle: CSSProperties = {
  minWidth: 0,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1rem',
};

const testPanelContainerStyle: CSSProperties = {
  position: 'sticky',
  top: '1rem',
};

const toastStyle: CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  padding: '1rem 1.5rem',
  borderRadius: '8px',
  color: 'white',
  fontWeight: '500',
  zIndex: 1200,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100,
};

const confirmDialogStyle: CSSProperties = {
  backgroundColor: '#1C1C26',
  borderRadius: '12px',
  border: '1px solid #2A2A38',
  padding: '1.5rem',
  maxWidth: '400px',
  width: '90%',
};
