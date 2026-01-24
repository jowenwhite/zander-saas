'use client';
import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({
  children,
  title,
  subtitle,
  action,
  hover = false,
  padding = 'md',
  onClick
}: CardProps) {
  const paddingValues: Record<string, string> = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const cardStyle: CSSProperties = {
    background: 'white',
    border: '2px solid var(--zander-border-gray)',
    borderRadius: '12px',
    padding: paddingValues[padding],
    transition: 'all 0.2s ease',
    cursor: onClick || hover ? 'pointer' : 'default',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: title || subtitle ? '1rem' : '0',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.borderColor = '#F57C00';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.borderColor = 'var(--zander-border-gray)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {(title || subtitle || action) && (
        <div style={headerStyle}>
          <div>
            {title && (
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--zander-navy)',
                margin: 0,
                marginBottom: subtitle ? '0.25rem' : 0
              }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--zander-gray)',
                margin: 0
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
