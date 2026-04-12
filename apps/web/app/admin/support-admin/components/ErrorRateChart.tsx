'use client';

import { HealthHistoryPoint } from '../hooks/useHealth';

interface ErrorRateChartProps {
  history: HealthHistoryPoint[];
}

export function ErrorRateChart({ history }: ErrorRateChartProps) {
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

  // Find max error rate for scaling
  const maxError = Math.max(...dataPoints.map((d) => d.errorRate), 1);
  const scaleMax = Math.max(maxError, 5); // Min 5% scale

  // Current value
  const current = dataPoints[dataPoints.length - 1];
  const currentErrorRate = current?.errorRate || 0;

  // Determine color based on error rate
  const getErrorColor = (rate: number) => {
    if (rate < 1) return '#28a745'; // Green - healthy
    if (rate < 3) return '#ffc107'; // Yellow - warning
    return '#dc3545'; // Red - critical
  };

  const errorColor = getErrorColor(currentErrorRate);

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
          <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem' }}>Error Rate</h3>
          <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.8rem' }}>
            Last 24 snapshots
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: errorColor,
              animation: currentErrorRate > 3 ? 'pulse 1s infinite' : 'none',
            }}
          />
          <span
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: errorColor,
            }}
          >
            {currentErrorRate.toFixed(2)}%
          </span>
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
            width: '35px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '0.65rem',
            color: '#666680',
          }}
        >
          <span>{scaleMax.toFixed(1)}%</span>
          <span>{(scaleMax / 2).toFixed(1)}%</span>
          <span>0%</span>
        </div>

        {/* Chart area with SVG line */}
        <div
          style={{
            marginLeft: '40px',
            height: '100%',
            position: 'relative',
            borderBottom: '1px solid #2A2A38',
          }}
        >
          {/* Grid lines */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              borderTop: '1px dashed #2A2A38',
            }}
          />

          {/* Area chart using CSS clip-path */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="errorGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={errorColor} stopOpacity="0" />
                <stop offset="100%" stopColor={errorColor} stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path
              d={`
                M 0 100
                ${dataPoints
                  .map((point, idx) => {
                    const x = dataPoints.length > 1 ? (idx / (dataPoints.length - 1)) * 100 : 50;
                    const y = 100 - (point.errorRate / scaleMax) * 100;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}
                L 100 100
                Z
              `}
              fill="url(#errorGradient)"
            />

            {/* Line */}
            <path
              d={dataPoints
                .map((point, idx) => {
                  const x = dataPoints.length > 1 ? (idx / (dataPoints.length - 1)) * 100 : 50;
                  const y = 100 - (point.errorRate / scaleMax) * 100;
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke={errorColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Data points */}
          {dataPoints.map((point, idx) => {
            const x = (idx / (dataPoints.length - 1)) * 100;
            const y = (point.errorRate / scaleMax) * 100;

            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  bottom: `${y}%`,
                  transform: 'translate(-50%, 50%)',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: getErrorColor(point.errorRate),
                  border: '2px solid #1C1C26',
                  opacity: idx === dataPoints.length - 1 ? 1 : 0,
                }}
                title={`${new Date(point.timestamp).toLocaleTimeString()}: ${point.errorRate.toFixed(2)}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Status indicator */}
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
        <span style={{ fontSize: '0.8rem', color: '#8888A0' }}>Status</span>
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: errorColor,
          }}
        >
          {currentErrorRate < 1 ? 'Excellent' : currentErrorRate < 3 ? 'Acceptable' : 'Needs Attention'}
        </span>
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
