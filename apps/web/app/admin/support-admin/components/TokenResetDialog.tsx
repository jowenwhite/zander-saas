'use client';

import { useState } from 'react';
import { Tenant } from '../hooks/useTenants';

interface TokenResetDialogProps {
  isOpen: boolean;
  tenant: Tenant | null;
  onClose: () => void;
  onSubmit: (reason?: string) => Promise<boolean>;
}

export function TokenResetDialog({ isOpen, tenant, onClose, onSubmit }: TokenResetDialogProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await onSubmit(reason.trim() || undefined);
      if (success) {
        setReason('');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !tenant) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1C1C26',
          borderRadius: '16px',
          width: '450px',
          maxWidth: '90vw',
          border: '1px solid #2A2A38',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #2A2A38',
          }}
        >
          <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem', fontWeight: '600' }}>
            Reset Token Usage
          </h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ color: '#fcd34d', fontWeight: '500', marginBottom: '0.5rem' }}>
              Warning
            </div>
            <p style={{ margin: 0, color: '#F0F0F5', fontSize: '0.9rem', lineHeight: 1.5 }}>
              This will reset the monthly token usage to 0 for <strong>{tenant.name}</strong>.
            </p>
          </div>

          {/* Current Usage */}
          <div
            style={{
              background: '#13131A',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ color: '#8888A0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Current Usage
            </div>
            <div style={{ color: '#F0F0F5', fontSize: '1.5rem', fontWeight: '600' }}>
              {(tenant.monthlyTokensUsed || 0).toLocaleString()} tokens
            </div>
            {tenant.tokenResetDate && (
              <div style={{ color: '#8888A0', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Last reset: {new Date(tenant.tokenResetDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Reason */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                color: '#F0F0F5',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Customer request, billing adjustment"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#13131A',
                border: '2px solid #2A2A38',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#2A2A38',
                border: 'none',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: loading ? '#4a3000' : '#f59e0b',
                border: 'none',
                borderRadius: '8px',
                color: '#1C1C26',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Resetting...' : 'Reset Tokens'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
