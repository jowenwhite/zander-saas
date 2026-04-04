'use client';
import { ReactNode, CSSProperties } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  detail?: string;
  color?: string;
  gradient?: string;
  onClick?: () => void;
}

export default function KPICard({
  title,
  value,
  icon,
  trend,
  trendUp = true,
  detail,
  color = '#F57C00',
  gradient,
  onClick
}: KPICardProps) {
  const cardStyle: CSSProperties = {
    background: '#1C1C26',
    border: '2px solid #2A2A38',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    position: 'relative',
  };

  // Flat monochrome icon style - no colored backgrounds
  const iconStyle: CSSProperties = {
    color: '#00CCEE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2A2A38';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={iconStyle}>{icon}</div>
        {trend && (
          <span style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: trendUp ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
            color: trendUp ? '#28a745' : '#dc3545'
          }}>
            {trendUp ? '↑' : '↓'} {trend.replace(/[+-]/g, '')}
          </span>
        )}
      </div>
      <div style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#F0F0F5',
        marginBottom: '0.25rem'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: '#8888A0',
        marginBottom: detail ? '0.5rem' : 0
      }}>
        {title}
      </div>
      {detail && (
        <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
          {detail}
        </div>
      )}
    </div>
  );
}
