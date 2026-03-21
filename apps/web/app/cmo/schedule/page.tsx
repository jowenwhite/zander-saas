'use client';
import { useState, useEffect } from 'react';
import CMOLayout from '../components/CMOLayout';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  meetingUrl?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  eventType: string;
  priority: string;
  status: string;
  contact?: { id: string; firstName: string; lastName: string; email: string };
}

export default function CMOSchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'today' | 'week'>('today');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch('https://api.zanderos.com/calendar', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return date >= weekStart && date <= weekEnd;
  };

  const filteredEvents = events.filter(event => {
    if (view === 'today') return isToday(event.startTime);
    return isThisWeek(event.startTime);
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    background: active ? '#F57C00' : 'transparent',
    color: active ? '#000000' : '#8888A0',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return '#F57C00';
      case 'call': return '#17a2b8';
      case 'task': return '#28a745';
      case 'reminder': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <CMOLayout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5', margin: 0 }}>
              Marketing Schedule
            </h1>
            <p style={{ color: '#8888A0', marginTop: '0.5rem' }}>
              Team availability and marketing meetings
            </p>
          </div>
          <a
            href="/schedule"
            style={{
              padding: '0.75rem 1.5rem', background: '#F57C00', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            Full Calendar
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#1C1C26', padding: '0.5rem', borderRadius: '12px', width: 'fit-content', border: '1px solid #2A2A38' }}>
          <button onClick={() => setView('today')} style={tabStyle(view === 'today')}>Today</button>
          <button onClick={() => setView('week')} style={tabStyle(view === 'week')}>This Week</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.5rem' }}>Today's Events</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5' }}>
              {events.filter(e => isToday(e.startTime)).length}
            </div>
          </div>
          <div style={{ background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.5rem' }}>This Week</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F57C00' }}>
              {events.filter(e => isThisWeek(e.startTime)).length}
            </div>
          </div>
          <div style={{ background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.5rem' }}>Meetings</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#28a745' }}>
              {events.filter(e => e.eventType === 'meeting').length}
            </div>
          </div>
        </div>

        {/* Marketing Calendar Link */}
        <div style={{ background: 'rgba(245, 124, 0, 0.1)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(245, 124, 0, 0.3)' }}>
          <div>
            <span style={{ fontWeight: '600', color: '#F0F0F5' }}>Marketing Content Calendar</span>
            <span style={{ color: '#8888A0', marginLeft: '0.5rem' }}>Plan campaigns, social posts, and content</span>
          </div>
          <a href="/cmo/calendar" style={{ color: '#F57C00', fontWeight: '600', textDecoration: 'none' }}>Open Calendar</a>
        </div>

        {/* Events List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#8888A0' }}>Loading schedule...</div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ color: '#F0F0F5', marginBottom: '0.5rem' }}>No events {view === 'today' ? 'today' : 'this week'}</h3>
            <p style={{ color: '#8888A0' }}>Your schedule is clear</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredEvents.map(event => (
              <div
                key={event.id}
                style={{
                  background: '#1C1C26',
                  borderRadius: '12px',
                  border: '1px solid #2A2A38',
                  padding: '1.5rem',
                  borderLeft: `4px solid ${getEventTypeColor(event.eventType)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem', color: '#F0F0F5', fontWeight: '600' }}>{event.title}</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', color: '#8888A0' }}>
                        {view === 'week' && `${formatDate(event.startTime)} • `}
                        {event.allDay ? 'All Day' : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
                      </span>
                      {event.location && (
                        <span style={{ fontSize: '0.9rem', color: '#8888A0' }}>📍 {event.location}</span>
                      )}
                      {event.contact && (
                        <span style={{ fontSize: '0.9rem', color: '#8888A0' }}>
                          👤 {event.contact.firstName} {event.contact.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: `${getEventTypeColor(event.eventType)}20`,
                    color: getEventTypeColor(event.eventType),
                    textTransform: 'capitalize'
                  }}>
                    {event.eventType}
                  </span>
                </div>
                {event.description && (
                  <p style={{ margin: '1rem 0 0', color: '#8888A0', fontSize: '0.9rem' }}>{event.description}</p>
                )}
                {event.meetingUrl && (
                  <a
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#F57C00',
                      color: 'white',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CMOLayout>
  );
}
