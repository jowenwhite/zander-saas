'use client';
import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { CMOLayout, Button, EmptyState, LoadingSpinner } from '../components';
import PersonaCard from './components/PersonaCard';
import PersonaTestPanel from './components/PersonaTestPanel';

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

export default function CMOPersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  useEffect(() => {
    fetchPersonas();
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
        <Button variant="primary" onClick={() => {/* TODO: Open create modal */}}>
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
                <Button variant="primary" onClick={() => {/* TODO: Open create modal */}}>
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
  color: 'var(--zander-navy)',
  margin: 0,
  marginBottom: '0.25rem',
};

const subtitleStyle: CSSProperties = {
  color: 'var(--zander-gray)',
  margin: 0,
};

const emptyContainerStyle: CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid var(--zander-border-gray)',
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
