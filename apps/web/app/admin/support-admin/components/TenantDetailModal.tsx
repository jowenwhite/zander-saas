'use client';

import { Tenant } from '../hooks/useTenants';
import { TierBadge } from './TierBadge';
import { StatusBadge } from './StatusBadge';
import { EngagementBar } from './EngagementBar';
import { ChurnRiskBadge } from './ChurnRiskBadge';

interface TenantDetailModalProps {
  tenant: Tenant;
  onClose: () => void;
  onRename: () => void;
  onTierChange: () => void;
  onTrialExtend: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export function TenantDetailModal({
  tenant,
  onClose,
  onRename,
  onTierChange,
  onTrialExtend,
  onArchive,
  onRestore,
}: TenantDetailModalProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTrialDaysRemaining = () => {
    if (!tenant.trialEndDate) return null;
    const end = new Date(tenant.trialEndDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const isArchived = tenant.status === 'ARCHIVED';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#13131A',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '700px',
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
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.5rem' }}>{tenant.name}</h2>
              <StatusBadge status={tenant.status} />
            </div>
            <div style={{ color: '#8888A0', fontSize: '0.85rem' }}>
              Created {formatDate(tenant.createdAt)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8888A0',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Subscription Section */}
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', color: '#F0F0F5', fontSize: '1rem' }}>
              Subscription
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  EFFECTIVE TIER
                </div>
                <TierBadge
                  tier={tenant.effectiveTier}
                  isOverride={!!tenant.tierOverride}
                  isTrial={tenant.trialActive}
                />
              </div>
              <div>
                <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  BASE TIER
                </div>
                <span style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>{tenant.subscriptionTier}</span>
              </div>
              {tenant.tierOverride && (
                <>
                  <div>
                    <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      TIER OVERRIDE
                    </div>
                    <span style={{ color: '#ffc107', fontSize: '0.9rem' }}>{tenant.tierOverride}</span>
                  </div>
                  <div>
                    <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      OVERRIDE NOTE
                    </div>
                    <span style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>
                      {tenant.tierOverrideNote || '--'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Trial Section (if active) */}
          {tenant.trialActive && (
            <div
              style={{
                background: '#1a3a4a',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1rem',
                border: '1px solid #17a2b8',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#17a2b8', fontSize: '1rem' }}>
                    Trial Active
                  </h3>
                  <div style={{ color: '#8888A0', fontSize: '0.85rem' }}>
                    {tenant.trialTier} tier until {formatDate(tenant.trialEndDate)}
                  </div>
                </div>
                <div
                  style={{
                    background: '#13131A',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#17a2b8' }}>
                    {trialDaysRemaining}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#8888A0' }}>days left</div>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Section */}
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', color: '#F0F0F5', fontSize: '1rem' }}>
              Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  USERS
                </div>
                <span style={{ color: '#F0F0F5', fontSize: '1.25rem', fontWeight: '600' }}>
                  {tenant.userCount}
                </span>
              </div>
              <div>
                <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  ENGAGEMENT
                </div>
                <EngagementBar score={tenant.engagementScore} />
              </div>
              <div>
                <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  CHURN RISK
                </div>
                <ChurnRiskBadge level={tenant.churnRiskLevel} />
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', color: '#F0F0F5', fontSize: '1rem' }}>
              Activity
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  LAST ACTIVITY
                </div>
                <span style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>
                  {formatDate(tenant.lastActivityAt)}
                </span>
              </div>
              {isArchived && (
                <div>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    ARCHIVED AT
                  </div>
                  <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>
                    {formatDate(tenant.archivedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid #2A2A38',
            }}
          >
            {!isArchived && (
              <>
                <button
                  onClick={onRename}
                  style={{
                    background: '#2A2A38',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    color: '#F0F0F5',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                  }}
                >
                  Rename
                </button>
                <button
                  onClick={onTierChange}
                  style={{
                    background: '#2A2A38',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    color: '#F0F0F5',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                  }}
                >
                  Change Tier
                </button>
                {tenant.trialActive && (
                  <button
                    onClick={onTrialExtend}
                    style={{
                      background: '#1a3a4a',
                      border: '1px solid #17a2b8',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      color: '#17a2b8',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    Extend Trial
                  </button>
                )}
                <div style={{ flex: 1 }} />
                <button
                  onClick={onArchive}
                  style={{
                    background: '#4a0d0d',
                    border: '1px solid #dc3545',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    color: '#dc3545',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                  }}
                >
                  Archive Tenant
                </button>
              </>
            )}
            {isArchived && (
              <button
                onClick={onRestore}
                style={{
                  background: '#0d4a2d',
                  border: '1px solid #28a745',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  color: '#28a745',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}
              >
                Restore Tenant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
