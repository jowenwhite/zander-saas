'use client';
import { CalendarEvent } from '../types';
import { getHours, formatHour, getEventColor, getEventIcon, getMonthName } from '../utils';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function DayView({
  date,
  events,
  onTimeSlotClick,
  onEventClick,
}: DayViewProps) {
  const hours = getHours();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const allDayEvents = events.filter((e) => e.allDay);
  const timedEvents = events.filter((e) => !e.allDay);

  const getEventHour = (event: CalendarEvent) => {
    const eventDate = new Date(event.startDate);
    return eventDate.getHours();
  };

  const getEventsForHour = (hour: number) => {
    return timedEvents.filter((e) => getEventHour(e) === hour);
  };

  const isToday = () => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '1.5rem',
      }}
    >
      {/* Main Day Schedule */}
      <div
        style={{
          background: 'white',
          border: '2px solid var(--zander-border-gray)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {/* Day Header */}
        <div
          style={{
            padding: '1.5rem',
            background: isToday() ? 'rgba(245, 124, 0, 0.1)' : 'var(--zander-off-white)',
            borderBottom: '2px solid var(--zander-border-gray)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: isToday() ? '#F57C00' : 'var(--zander-navy)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: '500' }}>
              {dayNames[date.getDay()].substring(0, 3).toUpperCase()}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{date.getDate()}</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
              {dayNames[date.getDay()]}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
              {getMonthName(date.getMonth())} {date.getDate()}, {date.getFullYear()}
            </div>
          </div>
          {isToday() && (
            <span
              style={{
                marginLeft: 'auto',
                padding: '0.25rem 0.75rem',
                background: '#F57C00',
                color: 'white',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              TODAY
            </span>
          )}
        </div>

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--zander-border-gray)',
              background: 'var(--zander-off-white)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--zander-gray)',
                marginBottom: '0.5rem',
              }}
            >
              ALL DAY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {allDayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: getEventColor(event.type),
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>{getEventIcon(event.type)}</span>
                  <span style={{ fontWeight: '600' }}>{event.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hourly schedule */}
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            return (
              <div
                key={hour}
                onClick={() => onTimeSlotClick(date, hour)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  borderBottom: '1px solid var(--zander-border-gray)',
                  minHeight: '60px',
                  cursor: 'pointer',
                }}
              >
                {/* Time */}
                <div
                  style={{
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: 'var(--zander-gray)',
                    fontWeight: '500',
                    background: 'var(--zander-off-white)',
                    borderRight: '1px solid var(--zander-border-gray)',
                  }}
                >
                  {formatHour(hour)}
                </div>

                {/* Events */}
                <div
                  style={{
                    padding: '0.5rem',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 124, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: getEventColor(event.type),
                        color: 'white',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        borderLeft: event.status === 'draft' ? '4px dashed rgba(255,255,255,0.5)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{getEventIcon(event.type)}</span>
                        <span style={{ fontWeight: '600' }}>{event.title}</span>
                        {event.status === 'draft' && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              fontSize: '0.65rem',
                              background: 'rgba(255,255,255,0.2)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            DRAFT
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            opacity: 0.9,
                            marginTop: '0.25rem',
                          }}
                        >
                          {event.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar: Agenda */}
      <div
        style={{
          background: 'white',
          border: '2px solid var(--zander-border-gray)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '2px solid var(--zander-border-gray)',
            background: 'var(--zander-off-white)',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '700',
              color: 'var(--zander-navy)',
            }}
          >
            Agenda
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
            {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
          </p>
        </div>

        <div style={{ padding: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--zander-gray)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
              <div>No events scheduled</div>
              <div style={{ fontSize: '0.875rem' }}>Click on the calendar to add one</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {events
                .sort((a, b) => {
                  if (a.allDay && !b.allDay) return -1;
                  if (!a.allDay && b.allDay) return 1;
                  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                })
                .map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'var(--zander-off-white)',
                      cursor: 'pointer',
                      borderLeft: `4px solid ${getEventColor(event.type)}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span>{getEventIcon(event.type)}</span>
                      <span
                        style={{
                          fontWeight: '600',
                          color: 'var(--zander-navy)',
                          fontSize: '0.875rem',
                        }}
                      >
                        {event.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                      {event.allDay
                        ? 'All day'
                        : new Date(event.startDate).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
