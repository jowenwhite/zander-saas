'use client';

import { useState } from 'react';

interface RestoreConfirmDialogProps {
  tenantName: string;
  onConfirm: () => Promise<boolean>;
  onCancel: () => void;
}

export function RestoreConfirmDialog({
  tenantName,
  onConfirm,
  onCancel,
}: RestoreConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    const success = await onConfirm();

    if (!success) {
      setError('Failed to restore tenant');
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
          border: '1px solid #28a745',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #2A2A38',
            background: '#0d4a2d',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>+</span>
            <div>
              <h2 style={{ margin: 0, color: '#28a745', fontSize: '1.25rem' }}>Restore Tenant</h2>
              <div style={{ color: '#F0F0F5', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {tenantName}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#8888A0',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: 0 }}>Restoring this tenant will:</p>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
              <li>Make them visible in the main tenant list</li>
              <li>Restore their access to the platform</li>
              <li>Preserve all existing data and settings</li>
            </ul>
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
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#28a745',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Restoring...' : 'Restore Tenant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
