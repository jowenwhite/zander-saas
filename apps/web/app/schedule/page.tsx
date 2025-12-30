'use client';
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import AuthGuard from '../components/AuthGuard';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  meetingUrl?: string;
  meetingPlatform?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  eventType: string;
  category?: string;
  priority: string;
  color?: string;
  willBeRecorded: boolean;
  recordingConsentStatus?: string;
  recordingDisclosureSent: boolean;
  contactId?: string;
  dealId?: string;
  agenda?: string;
  prepNotes?: string;
  status: string;
  contact?: { id: string; firstName: string; lastName: string; email: string };
  createdBy?: { id: string; firstName: string; lastName: string };
  attendees?: EventAttendee[];
}

interface EventAttendee {
  id: string;
  userId?: string;
  contactId?: string;
  email?: string;
  name?: string;
  responseStatus: string;
  recordingConsentStatus?: string;
  user?: { firstName: string; lastName: string; email: string };
  contact?: { firstName: string; lastName: string; email: string };
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const API_URL = 'https://api.zanderos.com';

interface TreasuryItem {
  id: string;
  type: string;
  name: string;
  description?: string;
  category?: string;
  executive?: string;
  industry?: string;
  channels: string[];
  content: any;
  stepCount?: number;
  duration?: string;
}

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'today' | 'week' | 'month' | 'agenda'>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTreasuryModal, setShowTreasuryModal] = useState(false);
  const [treasuryItems, setTreasuryItems] = useState<TreasuryItem[]>([]);
  const [treasuryLoading, setTreasuryLoading] = useState(false);
  const [treasuryFilter, setTreasuryFilter] = useState<{
    category: string;
    executive: string;
    industry: string;
  }>({ category: '', executive: '', industry: '' });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [saving, setSaving] = useState(false);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    meetingUrl: '',
    meetingPlatform: '',
    startTime: '',
    endTime: '',
    allDay: false,
    eventType: 'meeting',
    category: 'client',
    priority: 'normal',
    willBeRecorded: false,
    contactId: '',
    agenda: '',
    attendees: [] as { contactId?: string; email?: string; name?: string }[],
    reminders: [{ type: 'email', timing: 15 }]
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('zander_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };
  // Fetch Treasury Items for Assemblies
  const fetchTreasuryItems = async () => {
    setTreasuryLoading(true);
    try {
      const params = new URLSearchParams();
      if (treasuryFilter.category) params.append('category', treasuryFilter.category);
      if (treasuryFilter.executive) params.append('executive', treasuryFilter.executive);
      if (treasuryFilter.industry) params.append('industry', treasuryFilter.industry);
      
      const res = await fetch(`${API_URL}/treasury/assemblies?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setTreasuryItems(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch treasury items:', err);
    } finally {
      setTreasuryLoading(false);
    }
  };

  useEffect(() => {
    if (showTreasuryModal) {
      fetchTreasuryItems();
    }
  }, [showTreasuryModal, treasuryFilter]);

  const handleAddFromTreasury = async (item: TreasuryItem) => {
    try {
      // Create a new calendar event from the assembly template
      const res = await fetch(`${API_URL}/calendar-events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: item.name,
          description: item.description,
          duration: item.duration || '30',
          eventType: 'meeting',
          status: 'scheduled',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        })
      });
      if (res.ok) {
        await fetchEvents();
        setShowTreasuryModal(false);
        alert(`Added "${item.name}" assembly template!`);
      }
    } catch (err) {
      console.error('Failed to add from treasury:', err);
      alert('Failed to add template');
    }
  };



  useEffect(() => {
    fetchEvents();
    fetchContacts();
  }, [view, selectedDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('zander_token');
      let url = `${API_URL}/calendar-events`;
      
      if (view === 'today') {
        url = `${API_URL}/calendar-events/today`;
      } else if (view === 'week') {
        const start = getWeekStart(selectedDate);
        const end = getWeekEnd(selectedDate);
        url = `${API_URL}/calendar-events/range?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
      } else if (view === 'month') {
        const start = getMonthStart(selectedDate);
        const end = getMonthEnd(selectedDate);
        url = `${API_URL}/calendar-events/range?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
      } else {
        url = `${API_URL}/calendar-events/upcoming?limit=20`;
      }

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const res = await fetch(`${API_URL}/contacts`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.data || data || []);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      alert('Please fill in title, start time, and end time');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('zander_token');
      const res = await fetch(`${API_URL}/calendar-events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newEvent,
          startTime: new Date(newEvent.startTime).toISOString(),
          endTime: new Date(newEvent.endTime).toISOString(),
          contactId: newEvent.contactId || undefined
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        resetNewEvent();
        fetchEvents();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.message || 'Failed to create event'));
      }
    } catch (err) {
      alert('Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const token = localStorage.getItem('zander_token');
      const res = await fetch(`${API_URL}/calendar-events/${eventId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchEvents();
        setShowEventModal(false);
      }
    } catch (err) {
      alert('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('zander_token');
      const res = await fetch(`${API_URL}/calendar-events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchEvents();
        setShowEventModal(false);
        setSelectedEvent(null);
      }
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      location: '',
      meetingUrl: '',
      meetingPlatform: '',
      startTime: '',
      endTime: '',
      allDay: false,
      eventType: 'meeting',
      category: 'client',
      priority: 'normal',
      willBeRecorded: false,
      contactId: '',
      agenda: '',
      attendees: [],
      reminders: [{ type: 'email', timing: 15 }]
    });
  };

  // Date helpers
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getWeekEnd = (date: Date) => {
    const d = getWeekStart(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDateFull = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '👥';
      case 'call': return '📞';
      case 'task': return '✅';
      case 'reminder': return '🔔';
      case 'block': return '🚫';
      case 'shift': return '⏰';
      default: return '📅';
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'zoom': return '📹 Zoom';
      case 'google_meet': return '🎥 Google Meet';
      case 'teams': return '💼 Teams';
      case 'phone': return '📞 Phone';
      case 'in_person': return '🏢 In Person';
      default: return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#BF0A30';
      case 'high': return '#F0B323';
      case 'normal': return '#0C2340';
      case 'low': return '#6c757d';
      default: return '#0C2340';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'client': return '#BF0A30';
      case 'internal': return '#0C2340';
      case 'personal': return '#27AE60';
      case 'work_shift': return '#F0B323';
      default: return '#6c757d';
    }
  };

  // Get today's date info for header
  const today = new Date();
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.startTime);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingCount = events.filter(e => new Date(e.startTime) > today).length;

  // Recording disclosure text
  const RECORDING_DISCLOSURE = `📹 RECORDING NOTICE: This meeting may be recorded for quality assurance and internal purposes. By attending, you consent to being recorded. If you do not consent, please notify the organizer before the meeting begins.`;

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <NavBar activeModule="cro" />
        <Sidebar />

        <main style={{ marginLeft: '240px', marginTop: '64px', padding: '2rem' }}>
          {/* Page Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
            borderRadius: '12px',
            padding: '2rem',
            color: 'white',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                  📅 Schedule
                </h1>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  {formatDateFull(today.toISOString())} • {todayEvents.length} event{todayEvents.length !== 1 ? 's' : ''} today • {upcomingCount} upcoming
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowTreasuryModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  🏛️ The Treasury
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--zander-gold)',
                    color: 'var(--zander-navy)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  + New Assembly
                </button>
              </div>
            </div>
          </div>

          {/* View Tabs & Navigation */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '2px solid var(--zander-border-gray)',
            marginBottom: '1.5rem',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { id: 'today', label: 'Today', icon: '📍' },
                { id: 'week', label: 'Week', icon: '📆' },
                { id: 'month', label: 'Month', icon: '🗓️' },
                { id: 'agenda', label: 'Agenda', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as any)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: view === tab.id ? 'var(--zander-navy)' : 'transparent',
                    color: view === tab.id ? 'white' : 'var(--zander-navy)',
                    border: view === tab.id ? 'none' : '1px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {(view === 'week' || view === 'month') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => {
                    const d = new Date(selectedDate);
                    if (view === 'week') d.setDate(d.getDate() - 7);
                    else d.setMonth(d.getMonth() - 1);
                    setSelectedDate(d);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'transparent',
                    border: '1px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ←
                </button>
                <span style={{ fontWeight: '600', color: 'var(--zander-navy)', minWidth: '150px', textAlign: 'center' }}>
                  {view === 'week' 
                    ? `${formatDate(getWeekStart(selectedDate).toISOString())} - ${formatDate(getWeekEnd(selectedDate).toISOString())}`
                    : selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  }
                </span>
                <button
                  onClick={() => {
                    const d = new Date(selectedDate);
                    if (view === 'week') d.setDate(d.getDate() + 7);
                    else d.setMonth(d.getMonth() + 1);
                    setSelectedDate(d);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'transparent',
                    border: '1px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  →
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--zander-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Today
                </button>
              </div>
            )}
          </div>

          {/* Events Content */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '2px solid var(--zander-border-gray)',
            minHeight: '400px'
          }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
                Loading schedule...
              </div>
            ) : events.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--zander-navy)' }}>No Events Scheduled</h3>
                <p style={{ color: 'var(--zander-gray)', marginBottom: '1.5rem' }}>
                  {view === 'today' ? "Your day is clear! Schedule something or enjoy the free time." : "No events found for this period."}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--zander-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Schedule Event
                </button>
              </div>
            ) : (
              <div style={{ padding: '1.5rem' }}>
                {/* Today View - Timeline style */}
                {view === 'today' && (
                  <div>
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--zander-navy)' }}>Today's Schedule</h3>
                    {events.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          padding: '1rem',
                          marginBottom: '0.75rem',
                          background: 'var(--zander-off-white)',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${getCategoryColor(event.category)}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ minWidth: '80px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                            {formatTime(event.startTime)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                            {formatTime(event.endTime)}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span>{getEventTypeIcon(event.eventType)}</span>
                            <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{event.title}</span>
                            {event.willBeRecorded && (
                              <span style={{
                                background: '#BF0A30',
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: '700'
                              }}>
                                🔴 RECORDING
                              </span>
                            )}
                            {event.priority === 'urgent' && (
                              <span style={{
                                background: 'var(--zander-red)',
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: '700'
                              }}>
                                URGENT
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                            {event.contact && `${event.contact.firstName} ${event.contact.lastName}`}
                            {event.contact && event.meetingPlatform && ' • '}
                            {event.meetingPlatform && getPlatformIcon(event.meetingPlatform)}
                            {event.location && !event.meetingPlatform && `📍 ${event.location}`}
                          </div>
                        </div>
                        {event.meetingUrl && (
                          <a
                            href={event.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#27AE60',
                              color: 'white',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontWeight: '600',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            🚀 Join
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Agenda View - List style */}
                {view === 'agenda' && (
                  <div>
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--zander-navy)' }}>Upcoming Events</h3>
                    {events.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          padding: '1rem',
                          marginBottom: '0.75rem',
                          background: 'var(--zander-off-white)',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${getCategoryColor(event.category)}`,
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ minWidth: '120px' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                            {formatDate(event.startTime)}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span>{getEventTypeIcon(event.eventType)}</span>
                            <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{event.title}</span>
                            {event.willBeRecorded && (
                              <span style={{
                                background: '#BF0A30',
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: '700'
                              }}>
                                🔴 REC
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                            {event.contact && `${event.contact.firstName} ${event.contact.lastName}`}
                            {event.meetingPlatform && ` • ${getPlatformIcon(event.meetingPlatform)}`}
                          </div>
                        </div>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          background: `${getCategoryColor(event.category)}20`,
                          color: getCategoryColor(event.category),
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          alignSelf: 'center'
                        }}>
                          {event.category || 'general'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Week View - Simple grid */}
                {view === 'week' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--zander-border-gray)', borderRadius: '8px', overflow: 'hidden' }}>
                      {Array.from({ length: 7 }).map((_, i) => {
                        const d = new Date(getWeekStart(selectedDate));
                        d.setDate(d.getDate() + i);
                        const dayEvents = events.filter(e => new Date(e.startTime).toDateString() === d.toDateString());
                        const isToday = d.toDateString() === today.toDateString();
                        
                        return (
                          <div key={i} style={{ background: 'white', minHeight: '150px' }}>
                            <div style={{
                              padding: '0.75rem',
                              borderBottom: '1px solid var(--zander-border-gray)',
                              background: isToday ? 'var(--zander-red)' : 'var(--zander-off-white)',
                              color: isToday ? 'white' : 'var(--zander-navy)',
                              fontWeight: '600',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.75rem' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                              <div style={{ fontSize: '1.25rem' }}>{d.getDate()}</div>
                            </div>
                            <div style={{ padding: '0.5rem' }}>
                              {dayEvents.slice(0, 3).map((event) => (
                                <div
                                  key={event.id}
                                  onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    marginBottom: '0.25rem',
                                    background: getCategoryColor(event.category),
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {formatTime(event.startTime)} {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', textAlign: 'center' }}>
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Month View - Calendar grid */}
                {view === 'month' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--zander-border-gray)', borderRadius: '8px', overflow: 'hidden' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} style={{
                          padding: '0.5rem',
                          background: 'var(--zander-navy)',
                          color: 'white',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.75rem'
                        }}>
                          {day}
                        </div>
                      ))}
                      {(() => {
                        const monthStart = getMonthStart(selectedDate);
                        const monthEnd = getMonthEnd(selectedDate);
                        const startDay = monthStart.getDay();
                        const daysInMonth = monthEnd.getDate();
                        const cells = [];
                        
                        // Empty cells before month starts
                        for (let i = 0; i < startDay; i++) {
                          cells.push(<div key={`empty-${i}`} style={{ background: '#f8f9fa', minHeight: '80px' }} />);
                        }
                        
                        // Days of month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                          const dayEvents = events.filter(e => new Date(e.startTime).toDateString() === d.toDateString());
                          const isToday = d.toDateString() === today.toDateString();
                          
                          cells.push(
                            <div key={day} style={{ background: 'white', minHeight: '80px', padding: '0.25rem' }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: isToday ? 'var(--zander-red)' : 'transparent',
                                color: isToday ? 'white' : 'var(--zander-navy)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: isToday ? '700' : '400',
                                fontSize: '0.875rem',
                                marginBottom: '0.25rem'
                              }}>
                                {day}
                              </div>
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}
                                  style={{
                                    padding: '0.125rem 0.25rem',
                                    marginBottom: '0.125rem',
                                    background: getCategoryColor(event.category),
                                    color: 'white',
                                    borderRadius: '2px',
                                    fontSize: '0.6rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div style={{ fontSize: '0.6rem', color: 'var(--zander-gray)' }}>
                                  +{dayEvents.length - 2}
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        return cells;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Create Event Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto'
            }}>
              <div style={{ background: 'var(--zander-navy)', color: 'white', padding: '1.5rem', borderRadius: '12px 12px 0 0' }}>
                <h2 style={{ margin: 0 }}>New Assembly</h2>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {/* Title */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g., Client Meeting with Johnson Corp"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Date/Time Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Start *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      End *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Type & Category Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Event Type
                    </label>
                    <select
                      value={newEvent.eventType}
                      onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                    >
                      <option value="meeting">👥 Meeting</option>
                      <option value="call">📞 Call</option>
                      <option value="task">✅ Task</option>
                      <option value="reminder">🔔 Reminder</option>
                      <option value="block">🚫 Block Time</option>
                      <option value="shift">⏰ Work Shift</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Category
                    </label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                    >
                      <option value="client">🔴 Client</option>
                      <option value="internal">🔵 Internal</option>
                      <option value="personal">🟢 Personal</option>
                      <option value="work_shift">🟡 Work Shift</option>
                    </select>
                  </div>
                </div>

                {/* Meeting Platform */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Meeting Platform
                    </label>
                    <select
                      value={newEvent.meetingPlatform}
                      onChange={(e) => setNewEvent({ ...newEvent, meetingPlatform: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                    >
                      <option value="">Select Platform...</option>
                      <option value="zoom">📹 Zoom</option>
                      <option value="google_meet">🎥 Google Meet</option>
                      <option value="teams">💼 Microsoft Teams</option>
                      <option value="phone">📞 Phone Call</option>
                      <option value="in_person">🏢 In Person</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Meeting URL
                    </label>
                    <input
                      type="url"
                      value={newEvent.meetingUrl}
                      onChange={(e) => setNewEvent({ ...newEvent, meetingUrl: e.target.value })}
                      placeholder="https://zoom.us/j/..."
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Contact */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                    Related Contact
                  </label>
                  <select
                    value={newEvent.contactId}
                    onChange={(e) => setNewEvent({ ...newEvent, contactId: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }}
                  >
                    <option value="">Select Contact...</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                    ))}
                  </select>
                </div>

                {/* Recording Toggle */}
                <div style={{
                  padding: '1rem',
                  background: newEvent.willBeRecorded ? 'rgba(191, 10, 48, 0.1)' : 'var(--zander-off-white)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: newEvent.willBeRecorded ? '2px solid var(--zander-red)' : '2px solid var(--zander-border-gray)'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newEvent.willBeRecorded}
                      onChange={(e) => setNewEvent({ ...newEvent, willBeRecorded: e.target.checked })}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--zander-red)' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>
                        🔴 This meeting will be recorded
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                        Recording disclosure will be automatically included in invitations
                      </div>
                    </div>
                  </label>
                  {newEvent.willBeRecorded && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: 'var(--zander-navy)',
                      border: '1px solid var(--zander-red)'
                    }}>
                      <strong>⚠️ Recording Disclosure (will be added to invite):</strong>
                      <p style={{ margin: '0.5rem 0 0', lineHeight: '1.5' }}>{RECORDING_DISCLOSURE}</p>
                    </div>
                  )}
                </div>

                {/* Agenda */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                    Agenda / Notes
                  </label>
                  <textarea
                    value={newEvent.agenda}
                    onChange={(e) => setNewEvent({ ...newEvent, agenda: e.target.value })}
                    placeholder="Meeting agenda, topics to discuss, preparation notes..."
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '1rem', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--zander-border-gray)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setShowCreateModal(false); resetNewEvent(); }}
                  style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: 'var(--zander-gray)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: saving ? 'var(--zander-gray)' : 'var(--zander-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto'
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${getCategoryColor(selectedEvent.category)} 0%, ${getCategoryColor(selectedEvent.category)}dd 100%)`,
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px 12px 0 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getEventTypeIcon(selectedEvent.eventType)}</span>
                      <h2 style={{ margin: 0 }}>{selectedEvent.title}</h2>
                    </div>
                    <div style={{ opacity: 0.9 }}>
                      {formatDateFull(selectedEvent.startTime)} • {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                    </div>
                  </div>
                  {selectedEvent.willBeRecorded && (
                    <span style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      🔴 RECORDING
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                {/* Contact & Platform */}
                {(selectedEvent.contact || selectedEvent.meetingPlatform) && (
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {selectedEvent.contact && (
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--zander-off-white)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>👤</span>
                        <span>{selectedEvent.contact.firstName} {selectedEvent.contact.lastName}</span>
                      </div>
                    )}
                    {selectedEvent.meetingPlatform && (
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--zander-off-white)', borderRadius: '8px' }}>
                        {getPlatformIcon(selectedEvent.meetingPlatform)}
                      </div>
                    )}
                    {selectedEvent.location && (
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--zander-off-white)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📍</span>
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Join Button */}
                {selectedEvent.meetingUrl && (
                  <a
                    href={selectedEvent.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #27AE60 0%, #219a52 100%)',
                      color: 'white',
                      borderRadius: '8px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      fontWeight: '700',
                      marginBottom: '1rem'
                    }}
                  >
                    🚀 Join Meeting
                  </a>
                )}

                {/* Recording Notice */}
                {selectedEvent.willBeRecorded && (
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(191, 10, 48, 0.1)',
                    border: '1px solid var(--zander-red)',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontWeight: '600', color: 'var(--zander-red)', marginBottom: '0.5rem' }}>
                      🔴 Recording Notice
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--zander-navy)', lineHeight: '1.5' }}>
                      {RECORDING_DISCLOSURE}
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--zander-gray)' }}>
                      Disclosure sent: {selectedEvent.recordingDisclosureSent ? '✅ Yes' : '⏳ Pending'}
                      {selectedEvent.recordingConsentStatus && ` • Consent: ${selectedEvent.recordingConsentStatus}`}
                    </div>
                  </div>
                )}

                {/* Agenda */}
                {selectedEvent.agenda && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', color: 'var(--zander-navy)' }}>📋 Agenda</h4>
                    <div style={{
                      padding: '1rem',
                      background: 'var(--zander-off-white)',
                      borderRadius: '8px',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9rem',
                      lineHeight: '1.6'
                    }}>
                      {selectedEvent.agenda}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedEvent.description && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', color: 'var(--zander-navy)' }}>📝 Description</h4>
                    <p style={{ margin: 0, color: 'var(--zander-gray)', lineHeight: '1.6' }}>
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: `${getPriorityColor(selectedEvent.priority)}20`,
                    color: getPriorityColor(selectedEvent.priority),
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {selectedEvent.priority} priority
                  </span>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: selectedEvent.status === 'scheduled' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                    color: selectedEvent.status === 'scheduled' ? '#27AE60' : 'var(--zander-gray)',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {selectedEvent.status}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--zander-border-gray)', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '2px solid var(--zander-red)',
                    color: 'var(--zander-red)',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleUpdateEvent(selectedEvent.id, { status: 'cancelled' })}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'transparent',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: 'var(--zander-gray)'
                    }}
                  >
                    Cancel Event
                  </button>
                  <button
                    onClick={() => { setShowEventModal(false); setSelectedEvent(null); }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'var(--zander-navy)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TREASURY MODAL */}
        {showTreasuryModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--zander-gold) 0%, #d4a017 100%)',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🏛️ The Treasury
                  </h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--zander-navy)', opacity: 0.8, fontSize: '0.9rem' }}>
                    Pre-built assembly templates ready to customize
                  </p>
                </div>
                <button
                  onClick={() => setShowTreasuryModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
              {/* Filters */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--zander-border-gray)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <select
                  value={treasuryFilter.category}
                  onChange={(e) => setTreasuryFilter({ ...treasuryFilter, category: e.target.value })}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--zander-border-gray)' }}
                >
                  <option value="">All Categories</option>
                  <option value="sales">Sales</option>
                  <option value="meeting">Meeting</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="operations">Operations</option>
                </select>
                <select
                  value={treasuryFilter.executive}
                  onChange={(e) => setTreasuryFilter({ ...treasuryFilter, executive: e.target.value })}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--zander-border-gray)' }}
                >
                  <option value="">All Executives</option>
                  <option value="CRO">CRO</option>
                  <option value="CFO">CFO</option>
                  <option value="COO">COO</option>
                  <option value="CMO">CMO</option>
                </select>
                <select
                  value={treasuryFilter.industry}
                  onChange={(e) => setTreasuryFilter({ ...treasuryFilter, industry: e.target.value })}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--zander-border-gray)' }}
                >
                  <option value="">All Industries</option>
                  <option value="general">General</option>
                  <option value="cabinet_millwork">Cabinet & Millwork</option>
                  <option value="professional_services">Professional Services</option>
                  <option value="trades">Trades</option>
                </select>
              </div>
              {/* Content */}
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                {treasuryLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Loading templates...</p>
                  </div>
                ) : treasuryItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>No Templates Found</h3>
                    <p style={{ margin: 0 }}>Try adjusting your filters or check back later for new templates.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {treasuryItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          border: '2px solid var(--zander-border-gray)',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--zander-gold)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--zander-border-gray)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>📅</span>
                          {item.duration && (
                            <span style={{
                              background: 'rgba(0, 86, 135, 0.1)',
                              color: 'var(--zander-blue)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: '600'
                            }}>
                              {item.duration}
                            </span>
                          )}
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)', fontSize: '1rem' }}>{item.name}</h4>
                        <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                          {item.description || 'No description available'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                          {item.executive && (
                            <span style={{ background: 'var(--zander-off-white)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--zander-navy)' }}>
                              {item.executive}
                            </span>
                          )}
                          {item.industry && (
                            <span style={{ background: 'var(--zander-off-white)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--zander-navy)' }}>
                              {item.industry.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddFromTreasury(item)}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            background: 'var(--zander-navy)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          + Use Template
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
