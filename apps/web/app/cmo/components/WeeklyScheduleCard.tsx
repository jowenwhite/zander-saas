'use client';
import { CSSProperties } from 'react';
import { ScheduleEvent, MonthlyTheme } from '../types/dashboard';
import Card from './Card';

interface WeeklyScheduleCardProps {
  events: ScheduleEvent[];
  monthlyTheme?: MonthlyTheme;
  loading?: boolean;
}

export default function WeeklyScheduleCard({
  events,
  monthlyTheme,
  loading = false,
}: WeeklyScheduleCardProps) {
  const typeIcons: Record<string, string> = {
    email: '📧',
    social: '📱',
    blog: '📝',
    campaign: '📣',
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    scheduled: { bg: 'rgba(245, 124, 0, 0.1)', color: '#F57C00' },
    published: { bg: 'rgba(40, 167, 69, 0.1)', color: '#28a745' },
    draft: { bg: 'rgba(108, 117, 125, 0.1)', color: '#6c757d' },
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card title="This Week's Schedule">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
          Loading schedule...
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="This Week's Schedule"
      action={
        <a
          href="/cmo/calendar"
          style={{
            color: '#F57C00',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '600',
          }}
        >
          View Calendar →
        </a>
      }
    >
      {monthlyTheme && (
        <div
          style={{
            background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🎯</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{monthlyTheme.name}</div>
            {monthlyTheme.description && (
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{monthlyTheme.description}</div>
            )}
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
          <div>No events scheduled this week</div>
          <a
            href="/cmo/calendar"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#F57C00',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            + Schedule Activity
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {events.slice(0, 5).map((event) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'var(--zander-off-white)',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{typeIcons[event.type] || '📌'}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: '600',
                    color: 'var(--zander-navy)',
                    fontSize: '0.875rem',
                  }}
                >
                  {event.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                  {formatDate(event.date)}
                </div>
              </div>
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  ...statusColors[event.status],
                }}
              >
                {event.status}
              </span>
            </div>
          ))}
          {events.length > 5 && (
            <div style={{ textAlign: 'center', color: 'var(--zander-gray)', fontSize: '0.875rem' }}>
              +{events.length - 5} more events
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
