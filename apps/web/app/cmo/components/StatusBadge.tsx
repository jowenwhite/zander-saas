'use client';
import { CSSProperties } from 'react';

type BadgeStatus = 'active' | 'paused' | 'draft' | 'completed' | 'error';
type BadgeSize = 'sm' | 'md';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  size?: BadgeSize;
}

export default function StatusBadge({
  status,
  label,
  size = 'md'
}: StatusBadgeProps) {
  const statusConfig: Record<BadgeStatus, { bg: string; color: string; defaultLabel: string }> = {
    active: {
      bg: 'rgba(40, 167, 69, 0.1)',
      color: '#28a745',
      defaultLabel: 'Active'
    },
    paused: {
      bg: 'rgba(255, 193, 7, 0.1)',
      color: '#ffc107',
      defaultLabel: 'Paused'
    },
    draft: {
      bg: 'rgba(108, 117, 125, 0.1)',
      color: '#6c757d',
      defaultLabel: 'Draft'
    },
    completed: {
      bg: 'rgba(0, 123, 255, 0.1)',
      color: '#007bff',
      defaultLabel: 'Completed'
    },
    error: {
      bg: 'rgba(220, 53, 69, 0.1)',
      color: '#dc3545',
      defaultLabel: 'Error'
    }
  };

  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;

  const sizeStyles: Record<BadgeSize, CSSProperties> = {
    sm: {
      padding: '0.125rem 0.5rem',
      fontSize: '0.7rem',
    },
    md: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
    }
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '50px',
      fontWeight: '600',
      background: config.bg,
      color: config.color,
      ...sizeStyles[size]
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: config.color,
        marginRight: '0.375rem'
      }} />
      {displayLabel}
    </span>
  );
}
