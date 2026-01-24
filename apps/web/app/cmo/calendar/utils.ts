import { CalendarDay, CalendarEvent, CalendarEventType } from './types';

// Event type colors
export const eventTypeColors: Record<CalendarEventType, string> = {
  email: '#3498DB',
  social: '#9B59B6',
  blog: '#27AE60',
  campaign: '#F57C00',
  webinar: '#E74C3C',
  other: '#6c757d',
};

// Event type icons
export const eventTypeIcons: Record<CalendarEventType, string> = {
  email: '📧',
  social: '📱',
  blog: '📝',
  campaign: '📣',
  webinar: '🎥',
  other: '📌',
};

// Get color for event type
export function getEventColor(type: CalendarEventType): string {
  return eventTypeColors[type] || eventTypeColors.other;
}

// Get icon for event type
export function getEventIcon(type: CalendarEventType): string {
  return eventTypeIcons[type] || eventTypeIcons.other;
}

// Format date for API (YYYY-MM-DD)
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse date string to Date
export function parseAPIDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

// Get month name
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

// Get short month name
export function getShortMonthName(month: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[month];
}

// Get day names
export function getDayNames(short = false): string[] {
  if (short) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
}

// Check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Check if date is today
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// Get days for month view grid (includes days from prev/next month to fill grid)
export function getMonthDays(year: number, month: number, events: CalendarEvent[] = []): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDay.getDate();

  // Days from previous month
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const date = new Date(year, month - 1, dayNum);
    const dateString = formatDateForAPI(date);
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: events.filter(e => e.startDate.startsWith(dateString)),
    });
  }

  // Days in current month
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const date = new Date(year, month, dayNum);
    const dateString = formatDateForAPI(date);
    days.push({
      date,
      dateString,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      events: events.filter(e => e.startDate.startsWith(dateString)),
    });
  }

  // Days from next month to complete the grid (6 rows × 7 days = 42)
  const remainingDays = 42 - days.length;
  for (let dayNum = 1; dayNum <= remainingDays; dayNum++) {
    const date = new Date(year, month + 1, dayNum);
    const dateString = formatDateForAPI(date);
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: events.filter(e => e.startDate.startsWith(dateString)),
    });
  }

  return days;
}

// Get days for week view
export function getWeekDays(date: Date, events: CalendarEvent[] = []): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date();

  // Find Sunday of the current week
  const dayOfWeek = date.getDay();
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(sunday);
    currentDate.setDate(sunday.getDate() + i);
    const dateString = formatDateForAPI(currentDate);

    days.push({
      date: currentDate,
      dateString,
      isCurrentMonth: currentDate.getMonth() === date.getMonth(),
      isToday: isSameDay(currentDate, today),
      events: events.filter(e => e.startDate.startsWith(dateString)),
    });
  }

  return days;
}

// Get hours for day/week view (7am to 9pm)
export function getHours(): number[] {
  return Array.from({ length: 15 }, (_, i) => i + 7); // 7 to 21 (9pm)
}

// Format hour for display (12-hour format)
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

// Group events by date
export function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  return events.reduce((acc, event) => {
    const dateKey = event.startDate.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
}

// Navigate to previous month
export function getPreviousMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

// Navigate to next month
export function getNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

// Navigate to previous week
export function getPreviousWeek(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() - 7);
  return newDate;
}

// Navigate to next week
export function getNextWeek(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + 7);
  return newDate;
}

// Navigate to previous day
export function getPreviousDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() - 1);
  return newDate;
}

// Navigate to next day
export function getNextDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + 1);
  return newDate;
}

// Get date range for API query based on view
export function getDateRangeForView(
  date: Date,
  view: 'month' | 'week' | 'day'
): { startDate: string; endDate: string } {
  let start: Date;
  let end: Date;

  if (view === 'month') {
    // First day of the previous month (to include prev month days in grid)
    start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    // Last day of next month (to include next month days in grid)
    end = new Date(date.getFullYear(), date.getMonth() + 2, 0);
  } else if (view === 'week') {
    // Sunday of current week
    const dayOfWeek = date.getDay();
    start = new Date(date);
    start.setDate(date.getDate() - dayOfWeek);
    // Saturday of current week
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else {
    // Single day
    start = new Date(date);
    end = new Date(date);
  }

  return {
    startDate: formatDateForAPI(start),
    endDate: formatDateForAPI(end),
  };
}
