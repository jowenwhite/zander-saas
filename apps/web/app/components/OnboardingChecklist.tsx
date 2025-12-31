'use client';

import { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  time: string;
  completed: boolean;
  link?: string;
}

interface OnboardingChecklistProps {
  onDismiss: () => void;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'welcome', label: 'Welcome to Zander', time: '', completed: true },
  { id: 'pillars', label: 'Understand the Five Pillars', time: '', completed: true },
  { id: 'email', label: 'Connect your email', time: '5 min', completed: false, link: '/settings' },
  { id: 'contact', label: 'Add your first contact', time: '2 min', completed: false, link: '/people' },
  { id: 'deal', label: 'Create your first deal', time: '3 min', completed: false, link: '/deals' },
  { id: 'treasury', label: 'Explore The Treasury', time: '5 min', completed: false, link: '/treasury' },
  { id: 'dashboard', label: 'Customize your dashboard', time: '3 min', completed: false, link: '/production' },
];

export default function OnboardingChecklist({ onDismiss }: OnboardingChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Load checklist state from API
    const loadChecklist = async () => {
      try {
        const res = await fetch('/api/users/onboarding/status');
        if (res.ok) {
          const data = await res.json();
          if (data.onboardingChecklist) {
            setChecklist(prev => prev.map(item => ({
              ...item,
              completed: data.onboardingChecklist[item.id] || item.completed,
            })));
          }
        }
      } catch (error) {
        console.error('Failed to load checklist:', error);
      }
    };
    loadChecklist();
  }, []);

  const toggleItem = async (id: string) => {
    const newChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(newChecklist);

    // Save to API
    const checklistState = newChecklist.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.completed,
    }), {});

    await fetch('/api/users/onboarding/checklist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: checklistState }),
    });
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;
  const allComplete = completedCount === checklist.length;

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        style={{
          background: 'linear-gradient(135deg, #0C2340, #1a3a5c)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          margin: '0.5rem',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: `conic-gradient(#F0B323 ${progress}%, #374151 ${progress}%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#0C2340',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 'bold',
          }}>
            {completedCount}/{checklist.length}
          </div>
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Getting Started</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0C2340, #1a3a5c)',
      borderRadius: '8px',
      margin: '0.5rem',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{ color: '#F0B323', margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>
            Getting Started
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
            {completedCount} of {checklist.length} complete
          </p>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0.25rem',
          }}
        >
          −
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '3px',
        background: 'rgba(255,255,255,0.1)',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #BF0A30, #F0B323)',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Checklist Items */}
      <div style={{ padding: '0.5rem' }}>
        {checklist.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: item.completed ? 'default' : 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={() => !item.completed && item.link && (window.location.href = item.link)}
            onMouseEnter={(e) => {
              if (!item.completed) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: item.completed ? 'none' : '2px solid rgba(255,255,255,0.3)',
                background: item.completed ? '#28a745' : 'transparent',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginRight: '0.75rem',
                fontSize: '0.7rem',
                flexShrink: 0,
              }}
            >
              {item.completed && '✓'}
            </button>
            <span style={{
              flex: 1,
              color: item.completed ? 'rgba(255,255,255,0.5)' : 'white',
              fontSize: '0.85rem',
              textDecoration: item.completed ? 'line-through' : 'none',
            }}>
              {item.label}
            </span>
            {item.time && !item.completed && (
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                {item.time}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {allComplete ? (
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
        }}>
          <p style={{ color: '#F0B323', margin: '0 0 0.5rem', fontWeight: '600' }}>
            🎉 You're all set!
          </p>
          <button
            onClick={onDismiss}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Dismiss Checklist
          </button>
        </div>
      ) : (
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.75rem', textAlign: 'center' }}>
            💡 Click any item to get started
          </p>
        </div>
      )}
    </div>
  );
}