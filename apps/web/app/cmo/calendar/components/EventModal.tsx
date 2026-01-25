'use client';
import { useState, useEffect } from 'react';
import { CalendarEvent, CalendarEventType, CalendarEventStatus, EventFormData } from '../types';
import { eventTypeColors, eventTypeIcons } from '../utils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  selectedDate: Date | null;
  selectedHour: number | null;
  onSave: (data: EventFormData, eventId?: string) => void;
  onDelete?: (eventId: string) => void;
}

const eventTypes: { value: CalendarEventType; label: string }[] = [
  { value: 'email', label: 'Email Campaign' },
  { value: 'social', label: 'Social Post' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'other', label: 'Other' },
];

const eventStatuses: { value: CalendarEventStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function EventModal({
  isOpen,
  onClose,
  event,
  selectedDate,
  selectedHour,
  onSave,
  onDelete,
}: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    type: 'campaign',
    status: 'draft',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    allDay: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Extract ALL primitive values to avoid object reference issues in useEffect
  const eventId = event?.id;
  const eventTitle = event?.title;
  const eventDescription = event?.description;
  const eventType = event?.type;
  const eventStatus = event?.status;
  const eventStartDate = event?.startDate;
  const eventEndDate = event?.endDate;
  const eventAllDay = event?.allDay;
  const selectedDateStr = selectedDate?.toISOString();

  useEffect(() => {
    // Only initialize form when modal opens or event changes
    if (!isOpen) return;

    // Check if we have event data to populate (could be existing event or idea being scheduled)
    // Use eventStartDate as indicator since it's always set for events
    const hasEventData = eventId || eventTitle || eventStartDate;
    if (hasEventData) {
      try {
        // Safely parse dates with fallback
        const startDateObj = eventStartDate ? new Date(eventStartDate) : new Date();
        const endDateObj = eventEndDate ? new Date(eventEndDate) : startDateObj;

        // Validate dates are valid
        const startDateStr = !isNaN(startDateObj.getTime())
          ? startDateObj.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        const startTimeStr = !isNaN(startDateObj.getTime())
          ? startDateObj.toTimeString().slice(0, 5)
          : '09:00';
        const endDateStr = !isNaN(endDateObj.getTime())
          ? endDateObj.toISOString().split('T')[0]
          : startDateStr;
        const endTimeStr = !isNaN(endDateObj.getTime())
          ? endDateObj.toTimeString().slice(0, 5)
          : '10:00';

        setFormData({
          title: eventTitle || '',
          description: eventDescription || '',
          type: (eventType as CalendarEventType) || 'campaign',
          status: (eventStatus as CalendarEventStatus) || 'draft',
          startDate: startDateStr,
          startTime: startTimeStr,
          endDate: endDateStr,
          endTime: endTimeStr,
          allDay: eventAllDay ?? false,
        });
      } catch (err) {
        console.error('Error parsing event data:', err);
        // Fallback to defaults
        const now = new Date();
        setFormData({
          title: eventTitle || '',
          description: eventDescription || '',
          type: 'campaign',
          status: 'draft',
          startDate: now.toISOString().split('T')[0],
          startTime: '09:00',
          endDate: now.toISOString().split('T')[0],
          endTime: '10:00',
          allDay: false,
        });
      }
    } else if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const hour = selectedHour ?? 9;
      setFormData({
        title: '',
        description: '',
        type: 'campaign',
        status: 'draft',
        startDate: dateStr,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endDate: dateStr,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        allDay: false,
      });
    }
    setShowDeleteConfirm(false);
  }, [isOpen, eventId, eventTitle, eventDescription, eventType, eventStatus, eventStartDate, eventEndDate, eventAllDay, selectedDateStr, selectedHour]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, event?.id);
    onClose();
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid var(--zander-border-gray)',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: 'var(--zander-navy)',
    fontSize: '0.875rem',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--zander-border-gray)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
            {event ? 'Edit Event' : 'Add Event'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--zander-gray)',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Monthly Newsletter"
              required
              style={inputStyle}
            />
          </div>

          {/* Type & Status Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEventType })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {eventTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {eventTypeIcons[t.value]} {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CalendarEventStatus })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {eventStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* All Day Toggle */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#F57C00' }}
              />
              <span style={{ fontWeight: '500', color: 'var(--zander-navy)' }}>All Day Event</span>
            </label>
          </div>

          {/* Date/Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            {!formData.allDay && (
              <div>
                <label style={labelStyle}>Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {!formData.allDay && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add notes or details..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Color Preview */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Preview</label>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: eventTypeColors[formData.type],
                color: 'white',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderLeft: formData.status === 'draft' ? '4px dashed rgba(255,255,255,0.5)' : 'none',
              }}
            >
              <span>{eventTypeIcons[formData.type]}</span>
              {formData.title || 'Event Title'}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--zander-border-gray)',
            background: 'var(--zander-off-white)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {event && onDelete ? (
            showDeleteConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>Delete this event?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--zander-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: 'var(--zander-gray)',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: 'var(--zander-red)',
                  border: '2px solid var(--zander-red)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                }}
              >
                Delete
              </button>
            )
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: 'var(--zander-gray)',
                border: '2px solid var(--zander-border-gray)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#F57C00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              {event ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
