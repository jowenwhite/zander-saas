'use client';
import { CalendarViewType } from '../types';
import { getMonthName } from '../utils';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddEvent: () => void;
}

export default function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onAddEvent,
}: CalendarHeaderProps) {
  const formatDateDisplay = () => {
    const month = getMonthName(currentDate.getMonth());
    const year = currentDate.getFullYear();

    if (view === 'month') {
      return `${month} ${year}`;
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startMonth = getMonthName(startOfWeek.getMonth());
      const endMonth = getMonthName(endOfWeek.getMonth());

      if (startMonth === endMonth) {
        return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${year}`;
      }
      return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${year}`;
    } else {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[currentDate.getDay()];
      return `${dayName}, ${month} ${currentDate.getDate()}, ${year}`;
    }
  };

  const viewButtons: { value: CalendarViewType; label: string }[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      {/* Left: Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={onPrev}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          ←
        </button>
        <button
          onClick={onToday}
          style={{
            padding: '0.5rem 1rem',
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            color: 'var(--zander-navy)',
          }}
        >
          Today
        </button>
        <button
          onClick={onNext}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          →
        </button>
        <h2
          style={{
            margin: 0,
            marginLeft: '1rem',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--zander-navy)',
          }}
        >
          {formatDateDisplay()}
        </h2>
      </div>

      {/* Right: View Switcher + Add Event */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* View Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--zander-off-white)',
            borderRadius: '8px',
            padding: '4px',
          }}
        >
          {viewButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => onViewChange(btn.value)}
              style={{
                padding: '0.5rem 1rem',
                background: view === btn.value ? '#F57C00' : 'transparent',
                color: view === btn.value ? 'white' : 'var(--zander-gray)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Add Event Button */}
        <button
          onClick={onAddEvent}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#F57C00',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          + Add Event
        </button>
      </div>
    </div>
  );
}
