'use client';

import { useDiagnostics } from '../hooks/useDiagnostics';
import { ErrorLogViewer } from './ErrorLogViewer';
import { HealthHistoryChart } from './HealthHistoryChart';

export function DiagnosticsTab() {
  const { history, stats, loading, error, lastUpdated, refresh } = useDiagnostics(7);

  const formatDate = (date: Date | null) => {
    if (!date) return '--';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard
          label="7-Day Uptime"
          value={`${stats.uptimePercent}%`}
          color={parseFloat(stats.uptimePercent) >= 99 ? '#28a745' : parseFloat(stats.uptimePercent) >= 95 ? '#ffc107' : '#dc3545'}
          subtext={`${stats.healthyCount} healthy / ${stats.degradedCount} degraded / ${stats.downCount} down`}
        />
        <StatCard
          label="Avg API Response"
          value={`${stats.avgApiResponseTime}ms`}
          color={stats.avgApiResponseTime < 200 ? '#28a745' : stats.avgApiResponseTime < 500 ? '#ffc107' : '#dc3545'}
          subtext={`max: ${stats.maxApiResponseTime}ms`}
        />
        <StatCard
          label="Avg DB Latency"
          value={`${stats.avgDbLatency}ms`}
          color={stats.avgDbLatency < 50 ? '#28a745' : stats.avgDbLatency < 100 ? '#ffc107' : '#dc3545'}
          subtext="7-day average"
        />
        <StatCard
          label="Avg Error Rate"
          value={`${stats.avgErrorRate}%`}
          color={parseFloat(stats.avgErrorRate) < 1 ? '#28a745' : parseFloat(stats.avgErrorRate) < 3 ? '#ffc107' : '#dc3545'}
          subtext={`max: ${stats.maxErrorRate.toFixed(2)}%`}
        />
      </div>

      {/* Error Log Viewer */}
      <ErrorLogViewer />

      {/* 7-Day Health Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}
      >
        <HealthHistoryChart
          history={history}
          metric="responseTime"
          title="Response Time Trend"
          subtitle="7-day API & Database latency"
        />
        <HealthHistoryChart
          history={history}
          metric="errorRate"
          title="Error Rate Trend"
          subtitle="7-day error percentage"
        />
      </div>

      {/* Service Uptime */}
      <HealthHistoryChart
        history={history}
        metric="services"
        title="Service Uptime"
        subtitle="7-day availability by service"
      />

      {/* Footer with last updated */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#666680',
          fontSize: '0.75rem',
        }}
      >
        {loading && <span>Loading diagnostics data...</span>}
        {error && <span style={{ color: '#dc3545' }}>Error: {error}</span>}
        {!loading && !error && lastUpdated && (
          <>
            <span>Data as of {formatDate(lastUpdated)}</span>
            <button
              onClick={refresh}
              style={{
                background: 'none',
                border: 'none',
                color: '#00CCEE',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textDecoration: 'underline',
              }}
            >
              Refresh
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({
  label,
  value,
  color,
  subtext,
}: {
  label: string;
  value: string;
  color: string;
  subtext: string;
}) {
  return (
    <div
      style={{
        background: '#1C1C26',
        borderRadius: '12px',
        padding: '1.25rem',
        minWidth: 0,
      }}
    >
      <div
        style={{
          color: '#8888A0',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color,
          marginBottom: '0.25rem',
        }}
      >
        {value}
      </div>
      <div style={{ color: '#666680', fontSize: '0.7rem' }}>{subtext}</div>
    </div>
  );
}
