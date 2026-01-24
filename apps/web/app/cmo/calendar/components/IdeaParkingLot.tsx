'use client';
import { useState } from 'react';
import { ParkingLotIdea, ParkingLotFormData, CalendarEventType } from '../types';
import { eventTypeIcons, eventTypeColors } from '../utils';

interface IdeaParkingLotProps {
  ideas: ParkingLotIdea[];
  onAddIdea: (data: ParkingLotFormData) => void;
  onDeleteIdea: (id: string) => void;
  onScheduleIdea?: (idea: ParkingLotIdea) => void;
}

const eventTypes: { value: CalendarEventType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' },
  { value: 'blog', label: 'Blog' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'other', label: 'Other' },
];

const priorities: { value: 'high' | 'medium' | 'low'; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: '#E74C3C' },
  { value: 'medium', label: 'Medium', color: '#F57C00' },
  { value: 'low', label: 'Low', color: '#6c757d' },
];

export default function IdeaParkingLot({
  ideas,
  onAddIdea,
  onDeleteIdea,
  onScheduleIdea,
}: IdeaParkingLotProps) {
  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ParkingLotFormData>({
    title: '',
    description: '',
    type: 'campaign',
    priority: 'medium',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAddIdea(formData);
      setFormData({ title: '', description: '', type: 'campaign', priority: 'medium' });
      setShowForm(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = priorities.find((pr) => pr.value === priority);
    return p?.color || '#6c757d';
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
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          background: 'var(--zander-off-white)',
          borderBottom: expanded ? '2px solid var(--zander-border-gray)' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>💡</span>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: '700',
                color: 'var(--zander-navy)',
              }}
            >
              Idea Parking Lot
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
              {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'}
            </span>
          </div>
        </div>
        <span style={{ color: 'var(--zander-gray)', fontSize: '1.25rem' }}>
          {expanded ? '▾' : '▸'}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: '1rem' }}>
          {/* Add Idea Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--zander-off-white)',
                border: '2px dashed var(--zander-border-gray)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--zander-gray)',
                fontWeight: '600',
                marginBottom: ideas.length > 0 ? '1rem' : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>+</span> Add Idea
            </button>
          )}

          {/* Quick Add Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              style={{
                padding: '1rem',
                background: 'var(--zander-off-white)',
                borderRadius: '8px',
                marginBottom: ideas.length > 0 ? '1rem' : 0,
              }}
            >
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What's your idea?"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  marginBottom: '0.75rem',
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEventType })}
                  style={{
                    padding: '0.5rem',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {eventTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {eventTypeIcons[t.value]} {t.label}
                    </option>
                  ))}
                </select>

                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })
                  }
                  style={{
                    padding: '0.5rem',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} Priority
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: '', description: '', type: 'campaign', priority: 'medium' });
                  }}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: 'transparent',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: 'var(--zander-gray)',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: '#F57C00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Ideas List */}
          {ideas.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--zander-off-white)',
                    borderLeft: `4px solid ${eventTypeColors[idea.type]}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem' }}>{eventTypeIcons[idea.type]}</span>
                      <span
                        style={{
                          fontWeight: '600',
                          color: 'var(--zander-navy)',
                          fontSize: '0.875rem',
                        }}
                      >
                        {idea.title}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.6rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        background: `${getPriorityColor(idea.priority)}20`,
                        color: getPriorityColor(idea.priority),
                      }}
                    >
                      {idea.priority}
                    </span>
                  </div>

                  {idea.description && (
                    <p
                      style={{
                        margin: '0.25rem 0 0.5rem 0',
                        fontSize: '0.75rem',
                        color: 'var(--zander-gray)',
                      }}
                    >
                      {idea.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {onScheduleIdea && (
                      <button
                        onClick={() => onScheduleIdea(idea)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#F57C00',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                        }}
                      >
                        Schedule
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteIdea(idea.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: 'transparent',
                        color: 'var(--zander-gray)',
                        border: '1px solid var(--zander-border-gray)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showForm && (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--zander-gray)' }}>
                <div style={{ fontSize: '0.875rem' }}>No ideas yet</div>
                <div style={{ fontSize: '0.75rem' }}>Capture marketing ideas here</div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
