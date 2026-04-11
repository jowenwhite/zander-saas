'use client';

import { HealthHistoryPoint } from '../hooks/useHealth';

interface ResponseTimeChartProps {
  history: HealthHistoryPoint[];
}

export function ResponseTimeChart({ history }: ResponseTimeChartProps) {
  // Get last 24 data points for display
  const dataPoints = history.slice(-24);

  if (dataPoints.length === 0) {
    return (
      <div
        style={{
          background: '#1C1C26',
          borderRadius: '12px',
          padding: '1.5rem',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8888A0',
        }}
      >
        No historical data available
      </div>
    );
  }

  // Find max values for scaling
  const maxApiTime = Math.max(...dataPoints.map((d) => d.apiResponseTime), 1);
  const maxDbTime = Math.max(...dataPoints.map((d) => d.databaseLatency), 1);
  const maxTime = Math.max(maxApiTime, maxDbTime, 100); // Min 100ms scale

  // Current values
  const current = dataPoints[dataPoints.length - 1];

  return (
    <div
      style={{
        background: '#1C1C26',
        borderRadius: '12px',
        padding: '1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem' }}>Response Time</h3>
          <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.8rem' }}>
            Last 24 snapshots
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '3px', background: '#00CCEE', borderRadius: '2px' }} />
            <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>API</span>
            <span style={{ fontSize: '0.85rem', color: '#F0F0F5', fontWeight: '600' }}>
              {current?.apiResponseTime || 0}ms
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '3px', background: '#9333ea', borderRadius: '2px' }} />
            <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>DB</span>
            <span style={{ fontSize: '0.85rem', color: '#F0F0F5', fontWeight: '600' }}>
              {current?.databaseLatency || 0}ms
            </span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div style={{ position: 'relative', height: '120px' }}>
        {/* Y-axis labels */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '0.65rem',
            color: '#666680',
          }}
        >
          <span>{maxTime}ms</span>
          <span>{Math.round(maxTime / 2)}ms</span>
          <span>0ms</span>
        </div>

        {/* Chart bars */}
        <div
          style={{
            marginLeft: '45px',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px',
            borderBottom: '1px solid #2A2A38',
          }}
        >
          {dataPoints.map((point, idx) => {
            const apiHeight = (point.apiResponseTime / maxTime) * 100;
            const dbHeight = (point.databaseLatency / maxTime) * 100;

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1px',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
                title={`${new Date(point.timestamp).toLocaleTimeString()}\nAPI: ${point.apiResponseTime}ms\nDB: ${point.databaseLatency}ms`}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '8px',
                    height: `${apiHeight}%`,
                    background: 'linear-gradient(to top, #00CCEE, #00AACC)',
                    borderRadius: '2px 2px 0 0',
                    minHeight: '2px',
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    maxWidth: '8px',
                    height: `${dbHeight}%`,
                    background: 'linear-gradient(to top, #9333ea, #7c3aed)',
                    borderRadius: '2px 2px 0 0',
                    minHeight: '2px',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* P95 indicator */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#13131A',
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: '#8888A0' }}>P95 Response Time</span>
        <span style={{ fontSize: '1rem', fontWeight: '600', color: '#F0F0F5' }}>
          {current?.p95ResponseTime?.toFixed(0) || 0}ms
        </span>
      </div>
    </div>
  );
}
