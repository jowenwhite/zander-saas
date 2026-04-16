'use client';

import { useState } from 'react';

interface CreateTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    companyName: string;
    subdomain?: string;
    tier?: string;
    tierOverrideNote?: string;
  }) => Promise<boolean>;
}

const TIER_OPTIONS = [
  { value: '', label: 'FREE (Default)' },
  { value: 'STARTER', label: 'STARTER' },
  { value: 'PROFESSIONAL', label: 'PROFESSIONAL' },
  { value: 'ENTERPRISE', label: 'ENTERPRISE' },
];

export function CreateTenantDialog({ isOpen, onClose, onSubmit }: CreateTenantDialogProps) {
  const [companyName, setCompanyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [tier, setTier] = useState('');
  const [tierOverrideNote, setTierOverrideNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setLoading(true);
    try {
      const success = await onSubmit({
        companyName: companyName.trim(),
        subdomain: subdomain.trim() || undefined,
        tier: tier || undefined,
        tierOverrideNote: tierOverrideNote.trim() || undefined,
      });

      if (success) {
        // Reset form and close
        setCompanyName('');
        setSubdomain('');
        setTier('');
        setTierOverrideNote('');
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const generateSubdomain = () => {
    const generated = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    setSubdomain(generated);
  };

  if (!isOpen) return null;

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
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid #2A2A38',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #2A2A38',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem', fontWeight: '600' }}>
            Create New Tenant
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8888A0',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            x
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                color: '#fca5a5',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Company Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: '#F0F0F5',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Company Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Acme Corporation"
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

          {/* Subdomain */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: '#F0F0F5',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Subdomain (optional)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="Auto-generated from company name"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: '#13131A',
                  border: '2px solid #2A2A38',
                  borderRadius: '8px',
                  color: '#F0F0F5',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={generateSubdomain}
                disabled={!companyName.trim()}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#2A2A38',
                  border: 'none',
                  borderRadius: '8px',
                  color: companyName.trim() ? '#00CCEE' : '#666680',
                  fontSize: '0.85rem',
                  cursor: companyName.trim() ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap',
                }}
              >
                Generate
              </button>
            </div>
            {subdomain && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#8888A0' }}>
                URL: {subdomain}.zanderos.com
              </p>
            )}
          </div>

          {/* Tier Override */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: '#F0F0F5',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Starting Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
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
            >
              {TIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#8888A0' }}>
              Non-FREE tiers will be set as tier override (manual grant)
            </p>
          </div>

          {/* Tier Override Note (only if tier selected) */}
          {tier && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  color: '#F0F0F5',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                }}
              >
                Override Note
              </label>
              <input
                type="text"
                value={tierOverrideNote}
                onChange={(e) => setTierOverrideNote(e.target.value)}
                placeholder="e.g., Partner account, VIP client"
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
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
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
              disabled={loading || !companyName.trim()}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: loading || !companyName.trim() ? '#1a4a5a' : '#00CCEE',
                border: 'none',
                borderRadius: '8px',
                color: '#1C1C26',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: loading || !companyName.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
