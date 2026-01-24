'use client';
import { TopContent } from '../types/dashboard';
import Card from './Card';

interface TopContentCardProps {
  items: TopContent[];
  loading?: boolean;
  isPlaceholder?: boolean;
}

export default function TopContentCard({
  items,
  loading = false,
  isPlaceholder = false,
}: TopContentCardProps) {
  const typeIcons: Record<string, string> = {
    email: '📧',
    social: '📱',
    landing_page: '🌐',
    campaign: '📣',
  };

  if (loading) {
    return (
      <Card title="Top Performing Content">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
          Loading content...
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Top Performing Content"
      subtitle={isPlaceholder ? 'Sample data - create campaigns to see real metrics' : 'Last 30 days'}
    >
      {items.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div>No content performance data yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'var(--zander-off-white)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background:
                    index === 0
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : index === 1
                      ? 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)'
                      : 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: 'white',
                }}
              >
                {index + 1}
              </div>
              <span style={{ fontSize: '1.25rem' }}>{typeIcons[item.type] || '📌'}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '600',
                    color: 'var(--zander-navy)',
                    fontSize: '0.875rem',
                  }}
                >
                  {item.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{item.metric}</div>
              </div>
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  background: 'rgba(40, 167, 69, 0.1)',
                  color: '#28a745',
                }}
              >
                ↑ {item.trend}%
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
