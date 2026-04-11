'use client';

import { useHealth } from '../hooks/useHealth';
import { StatusCard } from './StatusCard';
import { AlertsPanel } from './AlertsPanel';
import { ResponseTimeChart } from './ResponseTimeChart';
import { ErrorRateChart } from './ErrorRateChart';

export function HealthTab() {
  const { health, history, loading, error, getRelativeTime, refresh } = useHealth(5000);

  if (loading && !health) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          color: '#8888A0',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #2A2A38',
              borderTop: '3px solid #00CCEE',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <div>Loading system health...</div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <div
          style={{
            background: '#4a0d0d',
            border: '1px solid #dc3545',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <h3 style={{ margin: '1rem 0 0.5rem', color: '#F0F0F5' }}>Health Check Failed</h3>
          <p style={{ color: '#8888A0', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={refresh}
            style={{
              background: '#00CCEE',
              color: '#1C1C26',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    HEALTHY: '#28a745',
    DEGRADED: '#ffc107',
    DOWN: '#dc3545',
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
          background: '#1C1C26',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: health?.status === 'HEALTHY' ? '#0d4a2d' : health?.status === 'DEGRADED' ? '#4a3d0d' : '#4a0d0d',
              borderRadius: '8px',
              border: `1px solid ${statusColors[health?.status || 'HEALTHY']}`,
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: statusColors[health?.status || 'HEALTHY'],
                animation: 'pulse 2s infinite',
              }}
            />
            <span
              style={{
                fontWeight: '700',
                fontSize: '1.1rem',
                color: statusColors[health?.status || 'HEALTHY'],
              }}
            >
              {health?.status || 'UNKNOWN'}
            </span>
          </div>
          <div style={{ color: '#8888A0', fontSize: '0.9rem' }}>
            Check took {health?.checkDurationMs || 0}ms
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: '#666680', fontSize: '0.85rem' }}>
            Updated: <span style={{ color: '#F0F0F5' }}>{getRelativeTime()}</span>
          </div>
          <button
            onClick={refresh}
            style={{
              background: '#2A2A38',
              color: '#F0F0F5',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {health?.alerts && health.alerts.length > 0 && (
        <AlertsPanel alerts={health.alerts} />
      )}

      {/* Status Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {health?.services && (
          <>
            <StatusCard service="api" data={health.services.api} />
            <StatusCard service="database" data={health.services.database} />
            <StatusCard service="email" data={health.services.email} />
            <StatusCard service="stripe" data={health.services.stripe} />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <ResponseTimeChart history={history} />
        <ErrorRateChart history={history} />
      </div>

      {/* System Metrics Summary */}
      {health?.metrics && (
        <div
          style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ margin: '0 0 1rem', color: '#F0F0F5', fontSize: '1rem' }}>
            System Metrics
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '1rem',
            }}
          >
            <MetricCard label="Tenants" value={health.metrics.totalTenants} />
            <MetricCard label="Active Users" value={health.metrics.totalActiveUsers} />
            <MetricCard label="Requests (24h)" value={health.metrics.totalRequests.toLocaleString()} />
            <MetricCard label="Tokens Used" value={health.metrics.totalTokensUsed.toLocaleString()} />
            <MetricCard label="P95 Response" value={`${health.metrics.p95ResponseTime.toFixed(0)}ms`} />
            <MetricCard
              label="Error Rate"
              value={`${health.metrics.errorRatePercent}%`}
              highlight={health.metrics.errorRatePercent > 1}
            />
          </div>
        </div>
      )}

      {/* Polling indicator */}
      <div
        style={{
          marginTop: '1rem',
          textAlign: 'center',
          color: '#666680',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#28a745',
            animation: 'pulse 2s infinite',
          }}
        />
        Auto-refreshing every 5 seconds
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// Helper component for metric cards
function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        background: '#13131A',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          color: '#8888A0',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: highlight ? '#ffc107' : '#F0F0F5',
        }}
      >
        {value}
      </div>
    </div>
  );
}
