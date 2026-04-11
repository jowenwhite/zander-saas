'use client';

import { useState } from 'react';

interface ArchiveConfirmDialogProps {
  tenantName: string;
  isBulk?: boolean;
  bulkCount?: number;
  onConfirm: () => Promise<boolean>;
  onCancel: () => void;
}

export function ArchiveConfirmDialog({
  tenantName,
  isBulk = false,
  bulkCount = 0,
  onConfirm,
  onCancel,
}: ArchiveConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expectedText = isBulk ? 'ARCHIVE ALL' : 'ARCHIVE';
  const isConfirmed = confirmText.toUpperCase() === expectedText;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfirmed) {
      setError(`Please type "${expectedText}" to confirm`);
      return;
    }

    setLoading(true);
    setError(null);

    const success = await onConfirm();

    if (!success) {
      setError('Failed to archive tenant(s)');
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
          border: '1px solid #dc3545',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #2A2A38',
            background: '#4a0d0d',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>!</span>
            <div>
              <h2 style={{ margin: 0, color: '#dc3545', fontSize: '1.25rem' }}>
                {isBulk ? `Archive ${bulkCount} Tenants` : 'Archive Tenant'}
              </h2>
              {!isBulk && (
                <div style={{ color: '#F0F0F5', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {tenantName}
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              color: '#8888A0',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: 0 }}>
              {isBulk
                ? `This will archive ${bulkCount} tenants. Archived tenants will:`
                : 'This will archive the tenant. Archived tenants will:'}
            </p>
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
              <li>Be hidden from the main tenant list</li>
              <li>Lose access to the platform</li>
              <li>Keep their data intact for potential restoration</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                color: '#8888A0',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
              }}
            >
              Type <strong style={{ color: '#dc3545' }}>{expectedText}</strong> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#1C1C26',
                border: `2px solid ${isConfirmed ? '#28a745' : '#2A2A38'}`,
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '1rem',
                outline: 'none',
                textTransform: 'uppercase',
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
              disabled={loading || !isConfirmed}
              style={{
                padding: '0.75rem 1.5rem',
                background: isConfirmed ? '#dc3545' : '#4a0d0d',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: isConfirmed ? 'pointer' : 'not-allowed',
                fontSize: '0.9rem',
                fontWeight: '600',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Archiving...' : 'Archive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
