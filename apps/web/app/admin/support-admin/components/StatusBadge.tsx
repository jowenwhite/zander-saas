'use client';

interface StatusBadgeProps {
  status: 'ACTIVE' | 'ARCHIVED';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'ACTIVE';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        background: isActive ? '#0d4a2d' : '#2A2A38',
        color: isActive ? '#28a745' : '#8888A0',
        border: `1px solid ${isActive ? '#28a745' : '#3A3A48'}`,
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isActive ? '#28a745' : '#666680',
          animation: isActive ? 'pulse 2s infinite' : 'none',
        }}
      />
      {status}
    </span>
  );
}
