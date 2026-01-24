// Calendar View Types
export type CalendarViewType = 'month' | 'week' | 'day';

// Event Types
export type CalendarEventType =
  | 'email'
  | 'social'
  | 'blog'
  | 'campaign'
  | 'webinar'
  | 'other';

export type CalendarEventStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'cancelled';

// Calendar Event
export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  color?: string;
};

// Monthly Theme
export type MonthlyTheme = {
  id: string;
  month: number;
  year: number;
  title: string;
  description?: string;
  focusAreas: string[];
  goals: string[];
};

// Parking Lot Idea
export type ParkingLotIdea = {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
};

// Calendar Day (for grid rendering)
export type CalendarDay = {
  date: Date;
  dateString: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
};

// API Response Types
export type CalendarEventsResponse = {
  events: CalendarEvent[];
  total: number;
};

export type MonthlyThemeResponse = {
  theme: MonthlyTheme | null;
};

export type ParkingLotResponse = {
  ideas: ParkingLotIdea[];
};

// Event Form Data (for create/edit)
export type EventFormData = {
  title: string;
  description: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
};

// Theme Form Data (for create/edit)
export type ThemeFormData = {
  title: string;
  description: string;
  focusAreas: string[];
  goals: string[];
};

// Parking Lot Form Data
export type ParkingLotFormData = {
  title: string;
  description: string;
  type: CalendarEventType;
  priority: 'high' | 'medium' | 'low';
};
