'use client';
import { ReactNode, CSSProperties } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action
}: EmptyStateProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  };

  const iconStyle: CSSProperties = {
    fontSize: '4rem',
    marginBottom: '1.5rem',
    opacity: 0.8,
  };

  const titleStyle: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--zander-navy)',
    marginBottom: '0.5rem',
  };

  const descriptionStyle: CSSProperties = {
    fontSize: '1rem',
    color: 'var(--zander-gray)',
    marginBottom: action ? '1.5rem' : 0,
    maxWidth: '400px',
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>{icon}</div>
      <div style={titleStyle}>{title}</div>
      {description && <div style={descriptionStyle}>{description}</div>}
      {action && <div>{action}</div>}
    </div>
  );
}
