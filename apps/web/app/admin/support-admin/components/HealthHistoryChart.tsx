'use client';

import { HealthHistoryPoint } from '../hooks/useDiagnostics';

interface HealthHistoryChartProps {
  history: HealthHistoryPoint[];
  metric: 'responseTime' | 'errorRate' | 'services';
  title: string;
  subtitle?: string;
}

export function HealthHistoryChart({ history, metric, title, subtitle }: HealthHistoryChartProps) {
  // Sample data to reduce points for better display (max 168 points for 7 days at 1hr intervals)
  const sampleData = (data: HealthHistoryPoint[], maxPoints: number): HealthHistoryPoint[] => {
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, idx) => idx % step === 0);
  };

  const dataPoints = sampleData(history, 168);

  if (dataPoints.length === 0) {
    return (
      <div
        style={{
          background: '#1C1C26',
          borderRadius: '12px',
          padding: '1.5rem',
          height: '300px',
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

  // Render different chart types based on metric
  if (metric === 'responseTime') {
    return <ResponseTimeHistoryChart data={dataPoints} title={title} subtitle={subtitle} />;
  }

  if (metric === 'errorRate') {
    return <ErrorRateHistoryChart data={dataPoints} title={title} subtitle={subtitle} />;
  }

  if (metric === 'services') {
    return <ServiceHealthChart data={dataPoints} title={title} subtitle={subtitle} />;
  }

  return null;
}

// Response Time Chart (7-day view)
function ResponseTimeHistoryChart({
  data,
  title,
  subtitle,
}: {
  data: HealthHistoryPoint[];
  title: string;
  subtitle?: string;
}) {
  const maxApiTime = Math.max(...data.map((d) => d.apiResponseTime), 1);
  const maxDbTime = Math.max(...data.map((d) => d.databaseLatency), 1);
  const maxTime = Math.max(maxApiTime, maxDbTime, 100);

  const avgApi = Math.round(data.reduce((sum, d) => sum + d.apiResponseTime, 0) / data.length);
  const avgDb = Math.round(data.reduce((sum, d) => sum + d.databaseLatency, 0) / data.length);
  const current = data[data.length - 1];

  // Group by day for x-axis labels
  const days = [...new Set(data.map((d) => new Date(d.timestamp).toLocaleDateString('en-US', { weekday: 'short' })))];

  return (
    <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem' }}>{title}</h3>
          {subtitle && <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.8rem' }}>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <div style={{ width: '12px', height: '3px', background: '#00CCEE', borderRadius: '2px' }} />
              <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>API</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00CCEE' }}>{current?.apiResponseTime || 0}ms</div>
            <div style={{ fontSize: '0.7rem', color: '#666680' }}>avg: {avgApi}ms</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <div style={{ width: '12px', height: '3px', background: '#9333ea', borderRadius: '2px' }} />
              <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>Database</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#9333ea' }}>{current?.databaseLatency || 0}ms</div>
            <div style={{ fontSize: '0.7rem', color: '#666680' }}>avg: {avgDb}ms</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height: '180px' }}>
        {/* Y-axis */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 20,
            width: '45px',
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

        {/* Chart area */}
        <div style={{ marginLeft: '50px', height: '160px', position: 'relative' }}>
          {/* Grid lines */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #2A2A38' }} />

          {/* SVG Lines */}
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* API Line */}
            <path
              d={data
                .map((point, idx) => {
                  const x = data.length > 1 ? (idx / (data.length - 1)) * 100 : 50;
                  const y = 100 - (point.apiResponseTime / maxTime) * 100;
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#00CCEE"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {/* DB Line */}
            <path
              d={data
                .map((point, idx) => {
                  const x = data.length > 1 ? (idx / (data.length - 1)) * 100 : 50;
                  const y = 100 - (point.databaseLatency / maxTime) * 100;
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#9333ea"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Bottom border */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderBottom: '1px solid #2A2A38' }} />
        </div>

        {/* X-axis labels */}
        <div
          style={{
            marginLeft: '50px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.65rem',
            color: '#666680',
            marginTop: '4px',
          }}
        >
          {days.slice(0, 7).map((day, idx) => (
            <span key={idx}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error Rate Chart (7-day view with area fill)
function ErrorRateHistoryChart({
  data,
  title,
  subtitle,
}: {
  data: HealthHistoryPoint[];
  title: string;
  subtitle?: string;
}) {
  const maxError = Math.max(...data.map((d) => d.errorRate), 1);
  const scaleMax = Math.max(maxError, 5);
  const avgError = (data.reduce((sum, d) => sum + d.errorRate, 0) / data.length).toFixed(2);
  const current = data[data.length - 1];

  const getErrorColor = (rate: number) => {
    if (rate < 1) return '#28a745';
    if (rate < 3) return '#ffc107';
    return '#dc3545';
  };

  const currentColor = getErrorColor(current?.errorRate || 0);

  const days = [...new Set(data.map((d) => new Date(d.timestamp).toLocaleDateString('en-US', { weekday: 'short' })))];

  return (
    <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem' }}>{title}</h3>
          {subtitle && <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.8rem' }}>{subtitle}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: currentColor,
              }}
            />
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: currentColor }}>
              {current?.errorRate?.toFixed(2) || '0.00'}%
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666680' }}>avg: {avgError}%</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height: '180px' }}>
        {/* Y-axis */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 20,
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

        {/* Chart area */}
        <div style={{ marginLeft: '40px', height: '160px', position: 'relative' }}>
          {/* Grid lines */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #2A2A38' }} />

          {/* SVG with area fill */}
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="errorAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={currentColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path
              d={`M 0 100 ${data
                .map((point, idx) => {
                  const x = data.length > 1 ? (idx / (data.length - 1)) * 100 : 50;
                  const y = 100 - (point.errorRate / scaleMax) * 100;
                  return `L ${x} ${y}`;
                })
                .join(' ')} L 100 100 Z`}
              fill="url(#errorAreaGradient)"
            />

            {/* Line */}
            <path
              d={data
                .map((point, idx) => {
                  const x = data.length > 1 ? (idx / (data.length - 1)) * 100 : 50;
                  const y = 100 - (point.errorRate / scaleMax) * 100;
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke={currentColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Bottom border */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderBottom: '1px solid #2A2A38' }} />
        </div>

        {/* X-axis labels */}
        <div
          style={{
            marginLeft: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.65rem',
            color: '#666680',
            marginTop: '4px',
          }}
        >
          {days.slice(0, 7).map((day, idx) => (
            <span key={idx}>{day}</span>
          ))}
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
        <span style={{ fontSize: '0.8rem', color: '#8888A0' }}>7-Day Status</span>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: currentColor }}>
          {parseFloat(avgError) < 1 ? 'Excellent' : parseFloat(avgError) < 3 ? 'Acceptable' : 'Needs Attention'}
        </span>
      </div>
    </div>
  );
}

// Service Health Chart (uptime bars)
function ServiceHealthChart({
  data,
  title,
  subtitle,
}: {
  data: HealthHistoryPoint[];
  title: string;
  subtitle?: string;
}) {
  // Calculate uptime percentage for each service
  const apiUptime = ((data.filter((d) => d.apiHealthy).length / data.length) * 100).toFixed(1);
  const dbUptime = ((data.filter((d) => d.databaseHealthy).length / data.length) * 100).toFixed(1);
  const emailUptime = ((data.filter((d) => d.emailHealthy).length / data.length) * 100).toFixed(1);
  const stripeUptime = ((data.filter((d) => d.stripeHealthy).length / data.length) * 100).toFixed(1);

  const services = [
    { name: 'API Server', uptime: parseFloat(apiUptime), color: '#00CCEE' },
    { name: 'Database', uptime: parseFloat(dbUptime), color: '#9333ea' },
    { name: 'Email Service', uptime: parseFloat(emailUptime), color: '#28a745' },
    { name: 'Stripe', uptime: parseFloat(stripeUptime), color: '#F0B323' },
  ];

  return (
    <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem' }}>{title}</h3>
        {subtitle && <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.8rem' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {services.map((service) => (
          <div key={service.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>{service.name}</span>
              <span
                style={{
                  color: service.uptime >= 99 ? '#28a745' : service.uptime >= 95 ? '#ffc107' : '#dc3545',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                {service.uptime}%
              </span>
            </div>
            <div style={{ height: '8px', background: '#2A2A38', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${service.uptime}%`,
                  height: '100%',
                  background: service.uptime >= 99 ? '#28a745' : service.uptime >= 95 ? '#ffc107' : '#dc3545',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
