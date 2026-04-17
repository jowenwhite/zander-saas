'use client';
import { useState } from 'react';
import { X, Check, Lock, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { getRequiredTier, getTierConfig, TIER_HIERARCHY, SubscriptionTier } from '../../lib/tier-config';
import { getToken } from '../utils/auth';

interface Executive {
  id: string;
  label: string;
  role: string;
  fullTitle: string;
  color: string;
}

interface UpgradeModalProps {
  executive: Executive;
  currentTier: SubscriptionTier;
  onClose: () => void;
}

export default function UpgradeModal({ executive, currentTier, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConsultingTier = currentTier === 'CONSULTING';
  const requiredTier = getRequiredTier(executive.id);
  // For CONSULTING tier users, default to STARTER as the suggested upgrade
  const effectiveRequiredTier = isConsultingTier ? 'STARTER' : requiredTier;
  const tierConfig = effectiveRequiredTier ? getTierConfig(effectiveRequiredTier) : null;
  const currentTierConfig = getTierConfig(currentTier);

  const handleUpgrade = async () => {
    // For CONSULTING tier users, direct them to add a subscription
    if (!effectiveRequiredTier) {
      setError('Upgrade not available. Please contact support.');
      return;
    }

    // Enterprise tier requires contacting sales
    if (effectiveRequiredTier === 'ENTERPRISE') {
      window.location.href = '/contact?reason=enterprise';
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/billing/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: effectiveRequiredTier,
          successUrl: `${window.location.origin}/upgrade-success?tier=${effectiveRequiredTier}`,
          cancelUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start upgrade. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#1C1C26',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          border: '1px solid #2A2A38',
          overflow: 'hidden',
        }}
      >
        {/* Header with executive preview */}
        <div
          style={{
            background: `linear-gradient(135deg, ${executive.color}22 0%, ${executive.color}11 100%)`,
            padding: '2rem',
            borderBottom: '1px solid #2A2A38',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              color: '#8888A0',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: executive.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                position: 'relative',
              }}
            >
              {executive.label[0]}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={12} style={{ color: '#F0F0F5' }} />
              </div>
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.5rem', fontWeight: '700' }}>
                Unlock {executive.label}
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.95rem' }}>
                {executive.fullTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          <div
            style={{
              background: isConsultingTier ? 'rgba(0,204,238,0.1)' : 'rgba(124,58,237,0.1)',
              border: isConsultingTier ? '1px solid rgba(0,204,238,0.3)' : '1px solid rgba(124,58,237,0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Zap size={20} style={{ color: isConsultingTier ? '#00CCEE' : '#7C3AED' }} />
            <span style={{ color: '#F0F0F5', fontSize: '0.95rem' }}>
              {isConsultingTier
                ? `Your consulting package includes HQ access. Add a subscription to unlock ${executive.label}.`
                : `${executive.label} requires ${tierConfig?.displayName || 'a higher tier'} plan`
              }
            </span>
          </div>

          {/* Current vs Required */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#55556A', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Current Plan
                </p>
                <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '1.1rem', fontWeight: '600' }}>
                  {currentTierConfig.displayName}
                </p>
              </div>
              <ArrowRight size={20} style={{ color: '#55556A', margin: '0 1rem' }} />
              <div style={{ flex: 1, textAlign: 'right' }}>
                <p style={{ margin: 0, color: '#55556A', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Required Plan
                </p>
                <p style={{ margin: '0.25rem 0 0', color: '#00CCEE', fontSize: '1.1rem', fontWeight: '600' }}>
                  {tierConfig?.displayName}
                </p>
              </div>
            </div>
          </div>

          {/* Features list */}
          {tierConfig && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.75rem', color: '#F0F0F5', fontWeight: '600' }}>
                What you'll get with {tierConfig.displayName}:
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {tierConfig.features.slice(0, 5).map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#8888A0',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <Check size={16} style={{ color: '#00CCEE', flexShrink: 0 }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price */}
          {tierConfig && tierConfig.monthlyPrice !== null && (
            <div
              style={{
                background: '#09090F',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ color: '#8888A0', fontSize: '0.9rem' }}>Starting at </span>
              <span style={{ color: '#F0F0F5', fontSize: '2rem', fontWeight: '700' }}>
                ${tierConfig.monthlyPrice}
              </span>
              <span style={{ color: '#8888A0', fontSize: '0.9rem' }}>/month</span>
            </div>
          )}

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#EF4444',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.875rem',
                borderRadius: '8px',
                border: '1px solid #2A2A38',
                background: 'transparent',
                color: '#8888A0',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                flex: 2,
                padding: '0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: loading ? '#555' : '#00CCEE',
                color: loading ? '#888' : '#000',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Upgrade Now
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
