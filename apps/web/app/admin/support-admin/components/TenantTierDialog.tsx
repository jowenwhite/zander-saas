'use client';

import { useState } from 'react';

interface TenantTierDialogProps {
  tenantName: string;
  currentTier: string;
  currentOverride: string | null;
  isBulk?: boolean;
  bulkCount?: number;
  onConfirm: (tier: string, note?: string) => Promise<boolean>;
  onRemoveOverride?: () => Promise<boolean>;
  onCancel: () => void;
}

const TIERS = ['FREE', 'STARTER', 'GROWTH', 'SCALE', 'ENTERPRISE'];

const tierColors: Record<string, string> = {
  FREE: '#8888A0',
  STARTER: '#28a745',
  GROWTH: '#00CCEE',
  SCALE: '#9333ea',
  ENTERPRISE: '#F0B323',
};

export function TenantTierDialog({
  tenantName,
  currentTier,
  currentOverride,
  isBulk = false,
  bulkCount = 0,
  onConfirm,
  onRemoveOverride,
  onCancel,
}: TenantTierDialogProps) {
  const [selectedTier, setSelectedTier] = useState(currentOverride || currentTier);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const success = await onConfirm(selectedTier, note || undefined);

    if (!success) {
      setError('Failed to update tier');
      setLoading(false);
    }
  };

  const handleRemoveOverride = async () => {
    if (!onRemoveOverride) return;

    setLoading(true);
    setError(null);

    const success = await onRemoveOverride();

    if (!success) {
      setError('Failed to remove override');
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
          maxWidth: '500px',
          border: '1px solid #2A2A38',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38' }}>
          <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>
            {isBulk ? `Set Tier Override (${bulkCount} tenants)` : 'Set Tier Override'}
          </h2>
          {!isBulk && (
            <div style={{ color: '#8888A0', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {tenantName}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Current Tier Info */}
          {!isBulk && (
            <div
              style={{
                background: '#1C1C26',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    CURRENT BASE TIER
                  </div>
                  <span
                    style={{
                      color: tierColors[currentTier] || '#8888A0',
                      fontWeight: '600',
                    }}
                  >
                    {currentTier}
                  </span>
                </div>
                {currentOverride && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      CURRENT OVERRIDE
                    </div>
                    <span style={{ color: '#ffc107', fontWeight: '600' }}>{currentOverride}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tier Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                color: '#8888A0',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
              }}
            >
              Select Override Tier
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border:
                      selectedTier === tier
                        ? `2px solid ${tierColors[tier]}`
                        : '2px solid #2A2A38',
                    background: selectedTier === tier ? '#1C1C26' : 'transparent',
                    color: tierColors[tier],
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                color: '#8888A0',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
              }}
            >
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for override..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#1C1C26',
                border: '2px solid #2A2A38',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
              }}
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

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
            <div>
              {currentOverride && onRemoveOverride && !isBulk && (
                <button
                  type="button"
                  onClick={handleRemoveOverride}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid #dc3545',
                    borderRadius: '8px',
                    color: '#dc3545',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  Remove Override
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                  background: '#ffc107',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1C1C26',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? 'Applying...' : 'Apply Override'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
