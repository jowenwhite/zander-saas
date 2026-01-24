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
    background: 'white',
    border: '2px solid var(--zander-border-gray)',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    position: 'relative',
  };

  const iconBoxStyle: CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: gradient || `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
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
        e.currentTarget.style.borderColor = 'var(--zander-border-gray)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={iconBoxStyle}>{icon}</div>
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
        color: 'var(--zander-navy)',
        marginBottom: '0.25rem'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: 'var(--zander-gray)',
        marginBottom: detail ? '0.5rem' : 0
      }}>
        {title}
      </div>
      {detail && (
        <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
          {detail}
        </div>
      )}
    </div>
  );
}

// Helper function to darken/lighten colors
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
