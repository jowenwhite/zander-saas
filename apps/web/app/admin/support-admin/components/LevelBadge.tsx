'use client';

interface LevelBadgeProps {
  level: 'ERROR' | 'WARN' | 'INFO' | string;
}

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  ERROR: { bg: '#4a0d0d', text: '#dc3545', border: '#dc3545' },
  WARN: { bg: '#4a3d0d', text: '#ffc107', border: '#ffc107' },
  INFO: { bg: '#1a2a4a', text: '#00CCEE', border: '#00CCEE' },
  DEBUG: { bg: '#2A2A38', text: '#8888A0', border: '#3A3A48' },
};

export function LevelBadge({ level }: LevelBadgeProps) {
  const colors = levelColors[level.toUpperCase()] || levelColors.DEBUG;

  return (
    <span
      style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: '700',
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {level}
    </span>
  );
}
