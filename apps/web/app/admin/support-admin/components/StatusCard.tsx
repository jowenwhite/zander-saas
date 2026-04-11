'use client';

import { ServiceHealth } from '../hooks/useHealth';

interface StatusCardProps {
  service: 'api' | 'database' | 'email' | 'stripe';
  data: ServiceHealth;
}

const serviceConfig = {
  api: { icon: '🌐', name: 'API', description: 'Backend Services' },
  database: { icon: '🗄️', name: 'Database', description: 'PostgreSQL RDS' },
  email: { icon: '📧', name: 'Email', description: 'Resend Service' },
  stripe: { icon: '💳', name: 'Stripe', description: 'Payment Service' },
};

export function StatusCard({ service, data }: StatusCardProps) {
  const config = serviceConfig[service];
  const status = data.healthy ? 'HEALTHY' : 'DOWN';

  const statusColors = {
    HEALTHY: { bg: '#0d4a2d', border: '#28a745', text: '#28a745' },
    DEGRADED: { bg: '#4a3d0d', border: '#ffc107', text: '#ffc107' },
    DOWN: { bg: '#4a0d0d', border: '#dc3545', text: '#dc3545' },
  };

  const colors = statusColors[status];

  // Get the primary metric based on service type
  const getPrimaryMetric = () => {
    if (service === 'api') {
      return { label: 'Response', value: `${data.responseTime || 0}ms` };
    }
    if (service === 'database') {
      return { label: 'Latency', value: `${data.latency || 0}ms` };
    }
    if (service === 'email') {
      return { label: 'Delivery', value: `${data.deliveryRate || 0}%` };
    }
    return { label: 'Status', value: data.healthy ? 'OK' : 'Error' };
  };

  const getSecondaryMetric = () => {
    if (service === 'api') {
      return { label: 'Uptime', value: `${data.uptime || 99.9}%` };
    }
    if (service === 'database') {
      return { label: 'Pool', value: `${data.connections || 0}/${data.maxConnections || 100}` };
    }
    return null;
  };

  const primaryMetric = getPrimaryMetric();
  const secondaryMetric = getSecondaryMetric();

  return (
    <div
      style={{
        background: '#1C1C26',
        borderRadius: '12px',
        border: `2px solid ${colors.border}`,
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Status indicator glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: colors.border,
          boxShadow: `0 0 20px ${colors.border}`,
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{config.icon}</span>
        <div>
          <div style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '1rem' }}>{config.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>{config.description}</div>
        </div>
      </div>

      {/* Status Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: colors.bg,
          padding: '0.375rem 0.75rem',
          borderRadius: '20px',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: colors.border,
            animation: data.healthy ? 'pulse 2s infinite' : 'none',
          }}
        />
        <span style={{ fontWeight: '600', color: colors.text, fontSize: '0.8rem' }}>
          {status}
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#8888A0', textTransform: 'uppercase' }}>
            {primaryMetric.label}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F0F0F5' }}>
            {primaryMetric.value}
          </div>
        </div>
        {secondaryMetric && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#8888A0', textTransform: 'uppercase' }}>
              {secondaryMetric.label}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F0F0F5' }}>
              {secondaryMetric.value}
            </div>
          </div>
        )}
      </div>

      {/* Last checked */}
      {data.lastChecked && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#666680' }}>
          Last checked: {new Date(data.lastChecked).toLocaleTimeString()}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
