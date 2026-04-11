'use client';

import { useState } from 'react';
import { HealthAlert } from '../hooks/useHealth';

interface AlertsPanelProps {
  alerts: HealthAlert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(
    (alert, idx) => !dismissedAlerts.has(`${alert.service}-${idx}`)
  );

  if (visibleAlerts.length === 0) {
    return null;
  }

  const dismissAlert = (service: string, idx: number) => {
    setDismissedAlerts((prev) => new Set(prev).add(`${service}-${idx}`));
  };

  const alertColors = {
    WARNING: { bg: '#4a3d0d', border: '#ffc107', icon: '⚠️' },
    ERROR: { bg: '#4a1a0d', border: '#fd7e14', icon: '🔴' },
    CRITICAL: { bg: '#4a0d0d', border: '#dc3545', icon: '🚨' },
  };

  return (
    <div
      style={{
        background: '#1C1C26',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          borderBottom: '1px solid #2A2A38',
          paddingBottom: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>🔔</span>
        <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem' }}>
          Active Alerts ({visibleAlerts.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {visibleAlerts.map((alert, idx) => {
          const colors = alertColors[alert.level];
          return (
            <div
              key={`${alert.service}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{colors.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      background: colors.border,
                      color: '#1C1C26',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}
                  >
                    {alert.level}
                  </span>
                  <span
                    style={{
                      color: '#8888A0',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {alert.service}
                  </span>
                </div>
                <div style={{ color: '#F0F0F5', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {alert.message}
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alert.service, idx)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8888A0',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                }}
                title="Dismiss"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
