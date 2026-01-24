'use client';
import { CalendarDay, CalendarEvent } from '../types';
import { getHours, formatHour, getEventColor, getEventIcon, getShortMonthName } from '../utils';

interface WeekViewProps {
  days: CalendarDay[];
  onTimeSlotClick: (date: Date, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function WeekView({
  days,
  onTimeSlotClick,
  onEventClick,
}: WeekViewProps) {
  const hours = getHours();

  // Separate all-day events from timed events
  const getAllDayEvents = (day: CalendarDay) =>
    day.events.filter((e) => e.allDay);
  const getTimedEvents = (day: CalendarDay) =>
    day.events.filter((e) => !e.allDay);

  // Get hour from event start time
  const getEventHour = (event: CalendarEvent) => {
    const date = new Date(event.startDate);
    return date.getHours();
  };

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
          gridTemplateColumns: '60px repeat(7, 1fr)',
          borderBottom: '2px solid var(--zander-border-gray)',
        }}
      >
        {/* Empty corner */}
        <div
          style={{
            padding: '0.75rem',
            background: 'var(--zander-off-white)',
            borderRight: '1px solid var(--zander-border-gray)',
          }}
        />

        {/* Day columns */}
        {days.map((day) => (
          <div
            key={day.dateString}
            style={{
              padding: '0.75rem',
              textAlign: 'center',
              background: day.isToday ? 'rgba(245, 124, 0, 0.1)' : 'var(--zander-off-white)',
              borderRight: '1px solid var(--zander-border-gray)',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--zander-gray)',
                fontWeight: '500',
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.date.getDay()]}
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: day.isToday ? '#F57C00' : 'var(--zander-navy)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: day.isToday ? '#F57C00' : 'transparent',
                  color: day.isToday ? 'white' : 'inherit',
                }}
              >
                {day.date.getDate()}
              </span>
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                color: 'var(--zander-gray)',
              }}
            >
              {getShortMonthName(day.date.getMonth())}
            </div>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60px repeat(7, 1fr)',
          borderBottom: '2px solid var(--zander-border-gray)',
          minHeight: '40px',
        }}
      >
        <div
          style={{
            padding: '0.5rem',
            fontSize: '0.65rem',
            color: 'var(--zander-gray)',
            background: 'var(--zander-off-white)',
            borderRight: '1px solid var(--zander-border-gray)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          All Day
        </div>
        {days.map((day) => {
          const allDayEvents = getAllDayEvents(day);
          return (
            <div
              key={`allday-${day.dateString}`}
              style={{
                padding: '4px',
                borderRight: '1px solid var(--zander-border-gray)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {allDayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '500',
                    background: getEventColor(event.type),
                    color: 'white',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Hour rows */}
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {hours.map((hour) => (
          <div
            key={hour}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px repeat(7, 1fr)',
              borderBottom: '1px solid var(--zander-border-gray)',
              minHeight: '60px',
            }}
          >
            {/* Time label */}
            <div
              style={{
                padding: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--zander-gray)',
                background: 'var(--zander-off-white)',
                borderRight: '1px solid var(--zander-border-gray)',
                textAlign: 'right',
              }}
            >
              {formatHour(hour)}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const timedEvents = getTimedEvents(day).filter(
                (e) => getEventHour(e) === hour
              );
              return (
                <div
                  key={`${day.dateString}-${hour}`}
                  onClick={() => onTimeSlotClick(day.date, hour)}
                  style={{
                    borderRight: '1px solid var(--zander-border-gray)',
                    padding: '4px',
                    cursor: 'pointer',
                    background: day.isToday ? 'rgba(245, 124, 0, 0.02)' : 'white',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 124, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = day.isToday
                      ? 'rgba(245, 124, 0, 0.02)'
                      : 'white';
                  }}
                >
                  {timedEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: getEventColor(event.type),
                        color: 'white',
                        cursor: 'pointer',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderLeft: event.status === 'draft' ? '3px dashed rgba(255,255,255,0.5)' : 'none',
                      }}
                    >
                      <span>{getEventIcon(event.type)}</span>
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {event.title}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
