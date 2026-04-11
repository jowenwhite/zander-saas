'use client';

interface ChurnRiskBadgeProps {
  level: string | null;
}

const riskColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  LOW: { bg: '#0d4a2d', text: '#28a745', border: '#28a745', icon: '>' },
  MEDIUM: { bg: '#4a3d0d', text: '#ffc107', border: '#ffc107', icon: '!' },
  HIGH: { bg: '#4a1a0d', text: '#fd7e14', border: '#fd7e14', icon: '!!' },
  CRITICAL: { bg: '#4a0d0d', text: '#dc3545', border: '#dc3545', icon: '!!!' },
};

export function ChurnRiskBadge({ level }: ChurnRiskBadgeProps) {
  if (!level) {
    return (
      <span style={{ color: '#666680', fontSize: '0.85rem' }}>--</span>
    );
  }

  const colors = riskColors[level] || riskColors.LOW;

  return (
    <span
      style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      {level === 'CRITICAL' && <span style={{ animation: 'pulse 1s infinite' }}>!</span>}
      {level}
    </span>
  );
}
