'use client';

import { SegmentedTenant } from '../hooks/useEngagement';
import { EngagementBar } from './EngagementBar';
import { TierBadge } from './TierBadge';
import { QuickActionDropdown, ActionType } from './QuickActionDropdown';

interface SegmentPanelProps {
  title: string;
  icon: string;
  segment: 'at_risk' | 'power_users' | 'churning';
  tenants: SegmentedTenant[];
  onAction: (tenant: SegmentedTenant, actionType: ActionType) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function SegmentPanel({
  title,
  icon,
  segment,
  tenants,
  onAction,
  expanded = true,
  onToggleExpand,
}: SegmentPanelProps) {
  const getSegmentColor = () => {
    switch (segment) {
      case 'at_risk':
        return '#ffc107';
      case 'power_users':
        return '#00CCEE';
      case 'churning':
        return '#dc3545';
      default:
        return '#8888A0';
    }
  };

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <div
      style={{
        background: '#1C1C26',
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${tenants.length > 0 ? getSegmentColor() + '44' : '#2A2A38'}`,
      }}
    >
      {/* Header */}
      <div
        onClick={onToggleExpand}
        style={{
          padding: '1rem 1.5rem',
          borderBottom: expanded && tenants.length > 0 ? '1px solid #2A2A38' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: onToggleExpand ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>{icon}</span>
          <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.1rem' }}>{title}</h3>
          <span
            style={{
              background: getSegmentColor() + '22',
              color: getSegmentColor(),
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            {tenants.length}
          </span>
        </div>
        {onToggleExpand && (
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8888A0',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {expanded ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {/* Content */}
      {expanded && tenants.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#13131A' }}>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  Company
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  Tier
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    minWidth: '140px',
                  }}
                >
                  Engagement
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  {segment === 'power_users' ? 'Users' : 'Days Inactive'}
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  Reason
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'right',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    width: '120px',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  style={{
                    borderTop: '1px solid #2A2A38',
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500', color: '#F0F0F5' }}>{tenant.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666680' }}>
                      Last active: {formatRelativeTime(tenant.lastActivityAt)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <TierBadge
                      tier={tenant.effectiveTier}
                      isOverride={!!tenant.tierOverride}
                      isTrial={tenant.trialActive}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <EngagementBar score={tenant.engagementScore} />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {segment === 'power_users' ? (
                      <span style={{ color: '#F0F0F5', fontWeight: '500' }}>{tenant.userCount}</span>
                    ) : (
                      <span
                        style={{
                          color: tenant.daysInactive > 30 ? '#dc3545' : tenant.daysInactive > 14 ? '#ffc107' : '#F0F0F5',
                          fontWeight: '500',
                        }}
                      >
                        {tenant.daysInactive}d
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: '#8888A0', fontSize: '0.9rem' }}>{tenant.segmentReason}</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <QuickActionDropdown tenant={tenant} segment={segment} onAction={onAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {expanded && tenants.length === 0 && (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#8888A0',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>{icon}</div>
          <div>No tenants in this segment</div>
        </div>
      )}
    </div>
  );
}
