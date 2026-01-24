'use client';
import { useState, useEffect } from 'react';
import { MonthlyTheme, ThemeFormData } from '../types';
import { getMonthName } from '../utils';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: MonthlyTheme | null;
  currentDate: Date;
  onSave: (data: ThemeFormData, year: number, month: number) => void;
}

export default function ThemeModal({
  isOpen,
  onClose,
  theme,
  currentDate,
  onSave,
}: ThemeModalProps) {
  const [formData, setFormData] = useState<ThemeFormData>({
    title: '',
    description: '',
    focusAreas: [],
    goals: [],
  });
  const [focusAreaInput, setFocusAreaInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (theme) {
      setFormData({
        title: theme.title,
        description: theme.description || '',
        focusAreas: theme.focusAreas,
        goals: theme.goals,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        focusAreas: [],
        goals: [],
      });
    }
  }, [theme]);

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
    onSave(formData, currentDate.getFullYear(), currentDate.getMonth() + 1);
    onClose();
  };

  const addFocusArea = () => {
    if (focusAreaInput.trim()) {
      setFormData({
        ...formData,
        focusAreas: [...formData.focusAreas, focusAreaInput.trim()],
      });
      setFocusAreaInput('');
    }
  };

  const removeFocusArea = (index: number) => {
    setFormData({
      ...formData,
      focusAreas: formData.focusAreas.filter((_, i) => i !== index),
    });
  };

  const addGoal = () => {
    if (goalInput.trim()) {
      setFormData({
        ...formData,
        goals: [...formData.goals, goalInput.trim()],
      });
      setGoalInput('');
    }
  };

  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index),
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid var(--zander-border-gray)',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: 'var(--zander-navy)',
    fontSize: '0.875rem',
  };

  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();

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
          maxWidth: '550px',
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
            background: 'linear-gradient(135deg, rgba(245, 124, 0, 0.1) 0%, rgba(245, 124, 0, 0.05) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: '#F57C00',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem',
                }}
              >
                {monthName} {year}
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                {theme ? 'Edit Monthly Theme' : 'Set Monthly Theme'}
              </h2>
            </div>
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Theme Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Theme Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Customer Appreciation Month"
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the focus and strategy for this month..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Focus Areas */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Focus Areas</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={focusAreaInput}
                onChange={(e) => setFocusAreaInput(e.target.value)}
                placeholder="Add a focus area..."
                style={{ ...inputStyle, flex: 1 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFocusArea();
                  }
                }}
              />
              <button
                type="button"
                onClick={addFocusArea}
                style={{
                  padding: '0 1rem',
                  background: '#F57C00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Add
              </button>
            </div>
            {formData.focusAreas.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.focusAreas.map((area, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.375rem 0.75rem',
                      background: 'var(--zander-off-white)',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => removeFocusArea(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--zander-gray)',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Goals */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Monthly Goals</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Add a goal..."
                style={{ ...inputStyle, flex: 1 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGoal();
                  }
                }}
              />
              <button
                type="button"
                onClick={addGoal}
                style={{
                  padding: '0 1rem',
                  background: '#F57C00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Add
              </button>
            </div>
            {formData.goals.length > 0 && (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  color: 'var(--zander-gray)',
                }}
              >
                {formData.goals.map((goal, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ flex: 1 }}>{goal}</span>
                    <button
                      type="button"
                      onClick={() => removeGoal(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--zander-gray)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--zander-border-gray)',
            background: 'var(--zander-off-white)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
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
            {theme ? 'Save Theme' : 'Set Theme'}
          </button>
        </div>
      </div>
    </div>
  );
}
