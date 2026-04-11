'use client';

import { useState } from 'react';

interface TenantRenameDialogProps {
  currentName: string;
  onConfirm: (newName: string) => Promise<boolean>;
  onCancel: () => void;
}

export function TenantRenameDialog({ currentName, onConfirm, onCancel }: TenantRenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      setError('Name is required');
      return;
    }

    if (newName.trim() === currentName) {
      setError('New name must be different');
      return;
    }

    setLoading(true);
    setError(null);

    const success = await onConfirm(newName.trim());

    if (!success) {
      setError('Failed to rename tenant');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        padding: '2rem',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#13131A',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '450px',
          border: '1px solid #2A2A38',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38' }}>
          <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>Rename Tenant</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                color: '#8888A0',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
              }}
            >
              Company Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#1C1C26',
                border: '2px solid #2A2A38',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '1rem',
                outline: 'none',
              }}
              autoFocus
            />
          </div>

          {error && (
            <div
              style={{
                background: '#4a0d0d',
                border: '1px solid #dc3545',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#dc3545',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#2A2A38',
                border: 'none',
                borderRadius: '8px',
                color: '#F0F0F5',
                cursor: 'pointer',
                fontSize: '0.9rem',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#00CCEE',
                border: 'none',
                borderRadius: '8px',
                color: '#1C1C26',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
