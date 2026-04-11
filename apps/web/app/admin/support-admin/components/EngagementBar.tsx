'use client';

interface EngagementBarProps {
  score: number | null;
}

export function EngagementBar({ score }: EngagementBarProps) {
  if (score === null || score === undefined) {
    return (
      <span style={{ color: '#666680', fontSize: '0.85rem' }}>--</span>
    );
  }

  const getColor = (value: number) => {
    if (value >= 70) return '#28a745';
    if (value >= 40) return '#ffc107';
    return '#dc3545';
  };

  const color = getColor(score);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '100px' }}>
      <div
        style={{
          flex: 1,
          height: '8px',
          background: '#2A2A38',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            background: color,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: '600',
          color,
          minWidth: '32px',
          textAlign: 'right',
        }}
      >
        {score}
      </span>
    </div>
  );
}
