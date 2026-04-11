'use client';

interface SegmentCardProps {
  title: string;
  count: number;
  icon: string;
  color: 'red' | 'blue' | 'orange' | 'green';
  description: string;
  onClick?: () => void;
}

const colorMap = {
  red: { bg: '#4a0d0d', border: '#dc3545', text: '#dc3545' },
  blue: { bg: '#0d2a4a', border: '#00CCEE', text: '#00CCEE' },
  orange: { bg: '#4a3d0d', border: '#ffc107', text: '#ffc107' },
  green: { bg: '#0d4a1a', border: '#28a745', text: '#28a745' },
};

export function SegmentCard({ title, count, icon, color, description, onClick }: SegmentCardProps) {
  const colors = colorMap[color];

  return (
    <div
      onClick={onClick}
      style={{
        background: '#1C1C26',
        borderRadius: '12px',
        padding: '1.5rem',
        border: `2px solid ${count > 0 ? colors.border : '#2A2A38'}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 4px 20px ${colors.border}33`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: count > 0 ? colors.bg : '#13131A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
        {count > 0 && (
          <div
            style={{
              background: colors.bg,
              color: colors.text,
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}
          >
            Action Needed
          </div>
        )}
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <span
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: count > 0 ? colors.text : '#666680',
          }}
        >
          {count}
        </span>
      </div>

      <h3
        style={{
          margin: '0 0 0.25rem',
          color: '#F0F0F5',
          fontSize: '1rem',
          fontWeight: '600',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: '#8888A0',
          fontSize: '0.8rem',
        }}
      >
        {description}
      </p>
    </div>
  );
}
