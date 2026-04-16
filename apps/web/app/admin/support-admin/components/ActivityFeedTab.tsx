'use client';

import { useMemo } from 'react';
import { useActivityFeed, ActivityEvent } from '../hooks/useActivityFeed';

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  signup: { label: 'Signup', icon: '🎉', color: '#22c55e' },
  tier_change: { label: 'Tier Change', icon: '📊', color: '#3b82f6' },
  token_spike: { label: 'Token Spike', icon: '⚡', color: '#f59e0b' },
  error: { label: 'Error', icon: '❌', color: '#ef4444' },
  zander_action: { label: 'Zander', icon: '🤖', color: '#8b5cf6' },
  tenant_management: { label: 'Tenant Mgmt', icon: '🏢', color: '#6366f1' },
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: 'rgba(59, 130, 246, 0.15)', text: '#7dd3fc', border: 'rgba(59, 130, 246, 0.3)' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
  success: { bg: 'rgba(34, 197, 94, 0.15)', text: '#86efac', border: 'rgba(34, 197, 94, 0.3)' },
};

const TIME_FILTERS = [
  { value: 1, label: '1 hour' },
  { value: 6, label: '6 hours' },
  { value: 24, label: '24 hours' },
  { value: 72, label: '3 days' },
  { value: 168, label: '7 days' },
];

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function ActivityCard({ event }: { event: ActivityEvent }) {
  const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.error;
  const severityStyle = SEVERITY_COLORS[event.severity] || SEVERITY_COLORS.info;

  return (
    <div
      style={{
        background: '#13131A',
        borderRadius: '8px',
        border: `1px solid ${severityStyle.border}`,
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{config.icon}</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              background: config.color,
              color: 'white',
              textTransform: 'uppercase',
            }}
          >
            {config.label}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              padding: '2px 6px',
              borderRadius: '4px',
              background: severityStyle.bg,
              color: severityStyle.text,
              textTransform: 'uppercase',
            }}
          >
            {event.severity}
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#8888A0' }}>
          {formatTimestamp(event.timestamp)}
        </span>
      </div>

      <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#F0F0F5', lineHeight: 1.5 }}>
        {event.description}
      </p>

      {event.tenantName && (
        <div style={{ fontSize: '12px', color: '#8888A0', marginBottom: '8px' }}>
          <strong style={{ color: '#00CCEE' }}>Tenant:</strong> {event.tenantName}
        </div>
      )}

      {Object.keys(event.metadata).length > 0 && (
        <div
          style={{
            background: '#0A0A0F',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          {Object.entries(event.metadata)
            .filter(([key]) => !['stack'].includes(key))
            .slice(0, 5)
            .map(([key, value]) => (
              <div key={key} style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                <span style={{ color: '#8888A0', minWidth: '100px' }}>{key}:</span>
                <span style={{ color: '#F0F0F5' }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export function ActivityFeedTab() {
  const {
    activities,
    loading,
    error,
    filters,
    pagination,
    timeRange,
    eventType,
    setEventType,
    hours,
    setHours,
    refresh,
    loadMore,
  } = useActivityFeed();

  const stats = useMemo(() => {
    if (!filters?.typeCounts) return null;
    return filters.typeCounts;
  }, [filters]);

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#F0F0F5' }}>
              📡 Activity Feed
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#8888A0' }}>
              Real-time platform activity across all tenants
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#00CCEE',
              color: '#13131A',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
              <div
                key={type}
                onClick={() => setEventType(eventType === type ? null : type)}
                style={{
                  background: eventType === type ? config.color : '#13131A',
                  color: eventType === type ? 'white' : '#F0F0F5',
                  border: `2px solid ${eventType === type ? config.color : '#2A2A38'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{config.icon}</span>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 700 }}>{stats[type] || 0}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{config.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              border: '1px solid #2A2A38',
              borderRadius: '6px',
              fontSize: '14px',
              background: '#13131A',
              color: '#F0F0F5',
            }}
          >
            {TIME_FILTERS.map((tf) => (
              <option key={tf.value} value={tf.value}>
                Last {tf.label}
              </option>
            ))}
          </select>

          {eventType && (
            <button
              onClick={() => setEventType(null)}
              style={{
                padding: '8px 12px',
                background: '#2A2A38',
                border: '1px solid #3A3A48',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#F0F0F5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Showing: {EVENT_TYPE_CONFIG[eventType]?.label || eventType}</span>
              <span style={{ fontWeight: 'bold', color: '#00CCEE' }}>x</span>
            </button>
          )}

          {timeRange && (
            <span style={{ fontSize: '12px', color: '#8888A0' }}>
              {new Date(timeRange.startDate).toLocaleString()} - {new Date(timeRange.endDate).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            color: '#fca5a5',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && activities.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#8888A0' }}>
          Loading activity feed...
        </div>
      )}

      {/* Empty State */}
      {!loading && activities.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#8888A0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', color: '#F0F0F5' }}>No activity found</div>
          <div style={{ fontSize: '14px' }}>
            Try adjusting the time range or filters
          </div>
        </div>
      )}

      {/* Activity List */}
      {activities.length > 0 && (
        <div>
          {activities.map((event) => (
            <ActivityCard key={event.id} event={event} />
          ))}

          {/* Load More */}
          {pagination?.hasMore && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <button
                onClick={loadMore}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: '#2A2A38',
                  border: '2px solid #3A3A48',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#F0F0F5',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Loading...' : `Load More (${pagination.total - pagination.offset - pagination.limit} remaining)`}
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {pagination && (
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#8888A0', marginTop: '16px' }}>
              Showing {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} events
            </div>
          )}
        </div>
      )}
    </div>
  );
}
