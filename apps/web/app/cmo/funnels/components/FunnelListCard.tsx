'use client';
import { Funnel } from '../types';
import {
  formatNumber,
  formatConversionRate,
  getStatusBadgeStyle,
  getStatusLabel,
  calculateFunnelConversion,
} from '../utils';

interface FunnelListCardProps {
  funnel: Funnel;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function FunnelListCard({
  funnel,
  onClick,
  onEdit,
  onDelete,
}: FunnelListCardProps) {
  const statusStyle = getStatusBadgeStyle(funnel.status);
  const conversionRate = calculateFunnelConversion(funnel.totalVisits, funnel.totalConversions);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: '2px solid var(--zander-border-gray)',
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#F57C00';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--zander-border-gray)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--zander-navy)',
              }}
            >
              {funnel.name}
            </h3>
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.7rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: statusStyle.bg,
                color: statusStyle.color,
              }}
            >
              {getStatusLabel(funnel.status)}
            </span>
          </div>
          {funnel.description && (
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: 'var(--zander-gray)',
                lineHeight: 1.4,
              }}
            >
              {funnel.description.length > 100
                ? funnel.description.substring(0, 100) + '...'
                : funnel.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onEdit}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'var(--zander-off-white)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--zander-gray)',
              fontSize: '0.875rem',
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'var(--zander-off-white)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--zander-red)',
              fontSize: '0.875rem',
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--zander-off-white)',
          borderRadius: '8px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            STAGES
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
            {funnel.stages.length}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            VISITS
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
            {formatNumber(funnel.totalVisits)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            CONVERSIONS
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
            {formatNumber(funnel.totalConversions)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            CONVERSION RATE
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#27AE60' }}>
            {formatConversionRate(conversionRate)}
          </div>
        </div>
      </div>

      {/* Goal */}
      {funnel.conversionGoal && (
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--zander-gray)',
          }}
        >
          <span>🎯</span>
          <span>Goal: {funnel.conversionGoal}</span>
        </div>
      )}
    </div>
  );
}
