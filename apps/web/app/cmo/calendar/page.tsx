'use client';
import { useState, useEffect, useCallback } from 'react';
import { CMOLayout, LoadingSpinner } from '../components';
import {
  CalendarHeader,
  MonthlyThemeBanner,
  CalendarGrid,
  WeekView,
  DayView,
  EventModal,
  ThemeModal,
  IdeaParkingLot,
} from './components';
import {
  CalendarViewType,
  CalendarEvent,
  MonthlyTheme,
  ParkingLotIdea,
  EventFormData,
  ThemeFormData,
  ParkingLotFormData,
} from './types';
import {
  getMonthDays,
  getWeekDays,
  getPreviousMonth,
  getNextMonth,
  getPreviousWeek,
  getNextWeek,
  getPreviousDay,
  getNextDay,
  getDateRangeForView,
  formatDateForAPI,
} from './utils';

export default function CMOCalendarPage() {
  // View state
  const [view, setView] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Data state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [theme, setTheme] = useState<MonthlyTheme | null>(null);
  const [ideas, setIdeas] = useState<ParkingLotIdea[]>([]);

  // Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

  // Fetch data
  const fetchCalendarData = useCallback(async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const headers = { Authorization: `Bearer ${token}` };

      const { startDate, endDate } = getDateRangeForView(currentDate, view);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const [eventsRes, themeRes, ideasRes] = await Promise.all([
        fetch(`${apiUrl}/cmo/calendar/events?startDate=${startDate}&endDate=${endDate}`, { headers }).catch(
          () => null
        ),
        fetch(`${apiUrl}/cmo/calendar/themes/${year}/${month}`, { headers }).catch(() => null),
        fetch(`${apiUrl}/cmo/calendar/ideas`, { headers }).catch(() => null),
      ]);

      if (eventsRes?.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }

      if (themeRes?.ok) {
        const data = await themeRes.json();
        setTheme(data || null);
      } else {
        setTheme(null);
      }

      if (ideasRes?.ok) {
        const data = await ideasRes.json();
        setIdeas(data || []);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, view, apiUrl]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Navigation handlers
  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(getPreviousMonth(currentDate));
    } else if (view === 'week') {
      setCurrentDate(getPreviousWeek(currentDate));
    } else {
      setCurrentDate(getPreviousDay(currentDate));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(getNextMonth(currentDate));
    } else if (view === 'week') {
      setCurrentDate(getNextWeek(currentDate));
    } else {
      setCurrentDate(getNextDay(currentDate));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedHour(null);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedDate(date);
    setSelectedHour(hour);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setSelectedHour(null);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (data: EventFormData, eventId?: string) => {
    try {
      const token = localStorage.getItem('zander_token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const startDateTime = data.allDay
        ? `${data.startDate}T00:00:00`
        : `${data.startDate}T${data.startTime}:00`;
      const endDateTime = data.allDay
        ? `${data.endDate || data.startDate}T23:59:59`
        : `${data.endDate || data.startDate}T${data.endTime}:00`;

      const body = {
        title: data.title,
        description: data.description,
        eventType: data.type,
        startTime: startDateTime,
        endTime: endDateTime,
        allDay: data.allDay,
      };

      if (eventId) {
        await fetch(`${apiUrl}/cmo/calendar/events/${eventId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(body),
        });
      } else {
        await fetch(`${apiUrl}/cmo/calendar/events`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
      }

      fetchCalendarData();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const token = localStorage.getItem('zander_token');
      await fetch(`${apiUrl}/cmo/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCalendarData();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Theme handlers
  const handleSaveTheme = async (data: ThemeFormData, year: number, month: number) => {
    try {
      const token = localStorage.getItem('zander_token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const body = {
        year,
        month,
        name: data.title,
        description: data.description,
        focusAreas: data.focusAreas,
      };

      await fetch(`${apiUrl}/cmo/calendar/themes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      fetchCalendarData();
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Parking lot handlers
  const handleAddIdea = async (data: ParkingLotFormData) => {
    try {
      const token = localStorage.getItem('zander_token');
      await fetch(`${apiUrl}/cmo/calendar/ideas`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.type,
          priority: data.priority,
        }),
      });
      fetchCalendarData();
    } catch (error) {
      console.error('Error adding idea:', error);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      const token = localStorage.getItem('zander_token');
      await fetch(`${apiUrl}/cmo/calendar/ideas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCalendarData();
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const handleScheduleIdea = (idea: ParkingLotIdea) => {
    setSelectedDate(new Date());
    setSelectedHour(9);
    setSelectedEvent({
      id: '',
      title: idea.title,
      description: idea.description,
      type: idea.type,
      status: 'draft',
      startDate: formatDateForAPI(new Date()),
      allDay: false,
    });
    setShowEventModal(true);
  };

  // Compute calendar days
  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth(), events);
  const weekDays = getWeekDays(currentDate, events);
  const dayEvents = events.filter((e) => e.startDate.startsWith(formatDateForAPI(currentDate)));

  if (loading) {
    return (
      <CMOLayout>
        <LoadingSpinner message="Loading calendar..." fullPage />
      </CMOLayout>
    );
  }

  return (
    <CMOLayout>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--zander-navy)',
              margin: 0,
              marginBottom: '0.25rem',
            }}
          >
            Marketing Calendar
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
            Plan and schedule your marketing activities
          </p>
        </div>
      </div>

      {/* Calendar Header */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onAddEvent={() => {
          setSelectedDate(new Date());
          setSelectedHour(null);
          setSelectedEvent(null);
          setShowEventModal(true);
        }}
      />

      {/* Monthly Theme Banner */}
      <MonthlyThemeBanner
        theme={theme ? {
          ...theme,
          focusAreas: theme.focusAreas || [],
          goals: theme.goals || [],
        } : null}
        currentDate={currentDate}
        onEditTheme={() => setShowThemeModal(true)}
        onCreateTheme={() => setShowThemeModal(true)}
      />

      {/* Main Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: view === 'day' ? '1fr' : '1fr 280px',
          gap: '1.5rem',
        }}
      >
        {/* Calendar View */}
        <div>
          {view === 'month' && (
            <CalendarGrid
              days={monthDays}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'week' && (
            <WeekView
              days={weekDays}
              onTimeSlotClick={handleTimeSlotClick}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'day' && (
            <DayView
              date={currentDate}
              events={dayEvents}
              onTimeSlotClick={handleTimeSlotClick}
              onEventClick={handleEventClick}
            />
          )}
        </div>

        {/* Sidebar - Parking Lot (not shown in day view as it has its own sidebar) */}
        {view !== 'day' && (
          <div>
            <IdeaParkingLot
              ideas={ideas.map((idea) => ({
                ...idea,
                type: (idea as any).category || 'other',
                createdAt: (idea as any).createdAt || new Date().toISOString(),
              }))}
              onAddIdea={handleAddIdea}
              onDeleteIdea={handleDeleteIdea}
              onScheduleIdea={handleScheduleIdea}
            />
          </div>
        )}
      </div>

      {/* Event Modal - key forces remount to avoid stale state issues */}
      <EventModal
        key={selectedEvent?.id || 'new'}
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setSelectedDate(null);
          setSelectedHour(null);
        }}
        event={selectedEvent}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Theme Modal */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        theme={theme}
        currentDate={currentDate}
        onSave={handleSaveTheme}
      />
    </CMOLayout>
  );
}
