'use client';
import { CalendarDay, CalendarEvent } from '../types';
import { getDayNames, getEventColor, getEventIcon } from '../utils';

interface CalendarGridProps {
  days: CalendarDay[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarGrid({
  days,
  onDayClick,
  onEventClick,
}: CalendarGridProps) {
  const dayNames = getDayNames(true);
  const maxVisibleEvents = 3;

  return (
    <div
      style={{
        background: 'white',
        border: '2px solid var(--zander-border-gray)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Day Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          background: 'var(--zander-off-white)',
          borderBottom: '2px solid var(--zander-border-gray)',
        }}
      >
        {dayNames.map((day) => (
          <div
            key={day}
            style={{
              padding: '0.75rem',
              textAlign: 'center',
              fontWeight: '600',
              color: 'var(--zander-gray)',
              fontSize: '0.875rem',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(6, minmax(100px, 1fr))',
        }}
      >
        {days.map((day, index) => {
          const visibleEvents = day.events.slice(0, maxVisibleEvents);
          const hiddenCount = day.events.length - maxVisibleEvents;

          return (
            <div
              key={day.dateString}
              onClick={() => onDayClick(day.date)}
              style={{
                borderRight: (index + 1) % 7 !== 0 ? '1px solid var(--zander-border-gray)' : 'none',
                borderBottom: index < 35 ? '1px solid var(--zander-border-gray)' : 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                background: day.isToday
                  ? 'rgba(245, 124, 0, 0.05)'
                  : day.isCurrentMonth
                  ? 'white'
                  : 'var(--zander-off-white)',
                minHeight: '100px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!day.isToday) {
                  e.currentTarget.style.background = 'rgba(245, 124, 0, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!day.isToday) {
                  e.currentTarget.style.background = day.isCurrentMonth
                    ? 'white'
                    : 'var(--zander-off-white)';
                }
              }}
            >
              {/* Date Number */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: '0.875rem',
                  fontWeight: day.isToday ? '700' : '500',
                  color: day.isToday
                    ? 'white'
                    : day.isCurrentMonth
                    ? 'var(--zander-navy)'
                    : 'var(--zander-gray)',
                  background: day.isToday ? '#F57C00' : 'transparent',
                  marginBottom: '0.5rem',
                }}
              >
                {day.date.getDate()}
              </div>

              {/* Events */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      background: getEventColor(event.type),
                      color: 'white',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderLeft: event.status === 'draft' ? '2px dashed rgba(255,255,255,0.5)' : 'none',
                    }}
                    title={event.title}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{getEventIcon(event.type)}</span>
                    {event.title}
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <div
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      color: 'var(--zander-gray)',
                      fontWeight: '500',
                    }}
                  >
                    +{hiddenCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
