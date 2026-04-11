'use client';

import { useState } from 'react';

interface TenantTrialExtendDialogProps {
  tenantName: string;
  currentEndDate: string | null;
  isBulk?: boolean;
  bulkCount?: number;
  onConfirm: (additionalDays: number) => Promise<boolean>;
  onCancel: () => void;
}

const PRESET_DAYS = [7, 14, 30, 60, 90];

export function TenantTrialExtendDialog({
  tenantName,
  currentEndDate,
  isBulk = false,
  bulkCount = 0,
  onConfirm,
  onCancel,
}: TenantTrialExtendDialogProps) {
  const [additionalDays, setAdditionalDays] = useState(14);
  const [customDays, setCustomDays] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNewEndDate = () => {
    if (!currentEndDate) return null;
    const days = isCustom ? parseInt(customDays) || 0 : additionalDays;
    const endDate = new Date(currentEndDate);
    endDate.setDate(endDate.getDate() + days);
    return endDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const days = isCustom ? parseInt(customDays) || 0 : additionalDays;

    if (days <= 0) {
      setError('Please select a valid number of days');
      return;
    }

    setLoading(true);
    setError(null);

    const success = await onConfirm(days);

    if (!success) {
      setError('Failed to extend trial');
      setLoading(false);
    }
  };

  const newEndDate = getNewEndDate();

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
          border: '1px solid #17a2b8',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38' }}>
          <h2 style={{ margin: 0, color: '#17a2b8', fontSize: '1.25rem' }}>
            {isBulk ? `Extend Trials (${bulkCount} tenants)` : 'Extend Trial'}
          </h2>
          {!isBulk && (
            <div style={{ color: '#8888A0', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {tenantName}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Current End Date */}
          {!isBulk && currentEndDate && (
            <div
              style={{
                background: '#1C1C26',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  CURRENT END DATE
                </div>
                <span style={{ color: '#F0F0F5', fontWeight: '600' }}>
                  {new Date(currentEndDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {newEndDate && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    NEW END DATE
                  </div>
                  <span style={{ color: '#17a2b8', fontWeight: '600' }}>
                    {newEndDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Days Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                color: '#8888A0',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
              }}
            >
              Extend By
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {PRESET_DAYS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    setAdditionalDays(days);
                    setIsCustom(false);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border:
                      !isCustom && additionalDays === days
                        ? '2px solid #17a2b8'
                        : '2px solid #2A2A38',
                    background: !isCustom && additionalDays === days ? '#1a3a4a' : 'transparent',
                    color: '#F0F0F5',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {days} days
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: isCustom ? '2px solid #17a2b8' : '2px solid #2A2A38',
                  background: isCustom ? '#1a3a4a' : 'transparent',
                  color: '#F0F0F5',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Custom Input */}
          {isCustom && (
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  color: '#8888A0',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                }}
              >
                Custom Days
              </label>
              <input
                type="number"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="Enter number of days"
                min="1"
                max="365"
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
          )}

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
                background: '#17a2b8',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Extending...' : 'Extend Trial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
