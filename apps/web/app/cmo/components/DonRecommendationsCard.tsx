'use client';
import { DonRecommendation } from '../types/dashboard';
import Card from './Card';
import Button from './Button';

interface DonRecommendationsCardProps {
  recommendations: DonRecommendation[];
  loading?: boolean;
}

export default function DonRecommendationsCard({
  recommendations,
  loading = false,
}: DonRecommendationsCardProps) {
  const typeStyles: Record<string, { bg: string; borderColor: string }> = {
    insight: { bg: 'rgba(52, 152, 219, 0.1)', borderColor: '#3498DB' },
    action: { bg: 'rgba(245, 124, 0, 0.1)', borderColor: '#F57C00' },
    warning: { bg: 'rgba(231, 76, 60, 0.1)', borderColor: '#E74C3C' },
  };

  const priorityBadges: Record<string, { bg: string; color: string }> = {
    high: { bg: 'rgba(231, 76, 60, 0.1)', color: '#E74C3C' },
    medium: { bg: 'rgba(245, 124, 0, 0.1)', color: '#F57C00' },
    low: { bg: 'rgba(108, 117, 125, 0.1)', color: '#6c757d' },
  };

  if (loading) {
    return (
      <Card title="Don's Recommendations">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
          <div>Don is analyzing your marketing data...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Don's Recommendations"
      subtitle="AI-powered insights for your marketing"
      action={
        <span style={{ fontSize: '1.5rem' }}>🤖</span>
      }
    >
      {recommendations.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
          <div>No recommendations right now</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Everything looks great!
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                padding: '1rem',
                background: typeStyles[rec.type]?.bg || 'var(--zander-off-white)',
                borderRadius: '8px',
                borderLeft: `4px solid ${typeStyles[rec.type]?.borderColor || '#F57C00'}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{rec.icon}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: '600',
                        color: 'var(--zander-navy)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {rec.title}
                    </span>
                    <span
                      style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        ...priorityBadges[rec.priority],
                      }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--zander-gray)',
                      marginBottom: rec.actionUrl ? '0.75rem' : 0,
                    }}
                  >
                    {rec.description}
                  </div>
                  {rec.actionUrl && (
                    <a
                      href={rec.actionUrl}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.375rem 0.75rem',
                        background: '#F57C00',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      Take Action →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
