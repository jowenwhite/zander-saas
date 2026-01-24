'use client';
import { FunnelOverview } from '../types/dashboard';
import Card from './Card';

interface MarketingFunnelCardProps {
  funnel: FunnelOverview | null;
  loading?: boolean;
}

export default function MarketingFunnelCard({ funnel, loading = false }: MarketingFunnelCardProps) {
  if (loading) {
    return (
      <Card title="Marketing Funnel">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
          Loading funnel data...
        </div>
      </Card>
    );
  }

  if (!funnel) {
    return (
      <Card title="Marketing Funnel">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
          <div>No funnel data available</div>
        </div>
      </Card>
    );
  }

  const stages = [
    { key: 'visitors', label: 'Visitors', data: funnel.visitors, color: '#F57C00' },
    { key: 'leads', label: 'Leads', data: funnel.leads, color: '#3498DB' },
    { key: 'mqls', label: 'MQLs', data: funnel.mqls, color: '#9B59B6' },
    { key: 'croHandoff', label: 'CRO Handoff', data: funnel.croHandoff, color: '#27AE60' },
  ];

  const maxCount = Math.max(...stages.map((s) => s.data.count));

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <Card title="Marketing Funnel" subtitle={funnel.period}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {stages.map((stage, index) => (
          <div key={stage.key}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.875rem' }}>
                {stage.label}
              </span>
              <span style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>
                {formatNumber(stage.data.count)}
                {index > 0 && (
                  <span style={{ marginLeft: '0.5rem', color: stage.color, fontWeight: '600' }}>
                    ({stage.data.percentage}%)
                  </span>
                )}
              </span>
            </div>
            <div
              style={{
                height: '24px',
                background: 'var(--zander-off-white)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${maxCount > 0 ? (stage.data.count / maxCount) * 100 : 0}%`,
                  height: '100%',
                  background: `linear-gradient(135deg, ${stage.color} 0%, ${adjustColor(stage.color, -20)} 100%)`,
                  borderRadius: '6px',
                  transition: 'width 0.5s ease',
                  minWidth: stage.data.count > 0 ? '40px' : '0',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Conversion arrows */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--zander-off-white)',
          borderRadius: '8px',
        }}
      >
        {stages.slice(1).map((stage, index) => (
          <div key={stage.key} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: stage.color }}>
              {stage.data.percentage}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)' }}>
              {stages[index].label} → {stage.label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Helper function to darken colors
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
