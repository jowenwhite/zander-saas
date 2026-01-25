'use client';
import { useState, CSSProperties } from 'react';
import Button from '../../components/Button';
import TestResultsDisplay from './TestResultsDisplay';

interface Persona {
  id: string;
  name: string;
}

interface TestResults {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface PersonaTestPanelProps {
  personas: Persona[];
  selectedPersonaId: string | null;
  onPersonaChange: (id: string) => void;
}

const CONTENT_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'ad', label: 'Advertisement' },
  { value: 'social', label: 'Social Post' },
  { value: 'landing_page', label: 'Landing Page' },
];

export default function PersonaTestPanel({
  personas,
  selectedPersonaId,
  onPersonaChange,
}: PersonaTestPanelProps) {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<string>('email');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!selectedPersonaId || !content.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/personas/test`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaId: selectedPersonaId,
          content: content.trim(),
          contentType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setError('Failed to test content. Please try again.');
      }
    } catch (err) {
      console.error('Error testing content:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Test Content Against Persona</h3>
      <p style={subtitleStyle}>
        See how well your marketing content resonates with your target audience
      </p>

      {/* Persona Selector */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Select Persona</label>
        <select
          value={selectedPersonaId || ''}
          onChange={(e) => onPersonaChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">Choose a persona...</option>
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content Type Selector */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Content Type</label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          style={selectStyle}
        >
          {CONTENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content Input */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Your Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type your marketing content here (ad copy, email text, social post, etc.)"
          style={textareaStyle}
          rows={8}
        />
        <span style={hintStyle}>
          {content.length} characters
        </span>
      </div>

      {/* Test Button */}
      <Button
        variant="primary"
        onClick={handleTest}
        disabled={loading || !selectedPersonaId || !content.trim()}
        fullWidth
      >
        {loading ? 'Analyzing...' : 'Test Against Persona'}
      </Button>

      {/* Error */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Results */}
      {results && (
        <div style={{ marginTop: '1.5rem' }}>
          <TestResultsDisplay results={results} />
        </div>
      )}
    </div>
  );
}

const containerStyle: CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '1px solid var(--zander-border-gray)',
  padding: '1.5rem',
  height: 'fit-content',
};

const titleStyle: CSSProperties = {
  margin: '0 0 0.25rem 0',
  fontSize: '1.125rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const subtitleStyle: CSSProperties = {
  margin: '0 0 1.5rem 0',
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
};

const fieldStyle: CSSProperties = {
  marginBottom: '1rem',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
  marginBottom: '0.5rem',
};

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '0.875rem',
  color: 'var(--zander-dark-gray)',
  backgroundColor: 'white',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '0.875rem',
  color: 'var(--zander-dark-gray)',
  resize: 'vertical',
  fontFamily: 'inherit',
  minHeight: '150px',
};

const hintStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
  marginTop: '0.25rem',
  textAlign: 'right',
};

const errorStyle: CSSProperties = {
  marginTop: '1rem',
  padding: '0.75rem',
  backgroundColor: '#FEE2E2',
  color: '#B91C1C',
  borderRadius: '8px',
  fontSize: '0.875rem',
};
