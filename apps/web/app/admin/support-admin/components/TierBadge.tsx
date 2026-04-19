'use client';

interface TierBadgeProps {
  tier: string;
  isOverride?: boolean;
  isTrial?: boolean;
}

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  FREE: { bg: '#2A2A38', text: '#8888A0', border: '#3A3A48' },
  STARTER: { bg: '#1a3a2a', text: '#28a745', border: '#28a745' },
  PRO: { bg: '#1a2a4a', text: '#00CCEE', border: '#00CCEE' },
  BUSINESS: { bg: '#2a1a4a', text: '#9333ea', border: '#9333ea' },
  CONSULTING: { bg: '#3a1a1a', text: '#BF0A30', border: '#BF0A30' },
  ENTERPRISE: { bg: '#3a2a1a', text: '#F0B323', border: '#F0B323' },
};

export function TierBadge({ tier, isOverride, isTrial }: TierBadgeProps) {
  const colors = tierColors[tier] || tierColors.FREE;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '600',
          background: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          textTransform: 'uppercase',
        }}
      >
        {tier}
      </span>
      {isOverride && (
        <span
          style={{
            padding: '0.125rem 0.375rem',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: '600',
            background: '#4a3d0d',
            color: '#ffc107',
            border: '1px solid #ffc107',
          }}
          title="Tier Override Active"
        >
          OVERRIDE
        </span>
      )}
      {isTrial && (
        <span
          style={{
            padding: '0.125rem 0.375rem',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: '600',
            background: '#1a3a4a',
            color: '#17a2b8',
            border: '1px solid #17a2b8',
          }}
          title="Trial Active"
        >
          TRIAL
        </span>
      )}
    </div>
  );
}
