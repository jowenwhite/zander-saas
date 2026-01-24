'use client';
import { useState } from 'react';
import { MonthlyTheme } from '../types';
import { getMonthName } from '../utils';

interface MonthlyThemeBannerProps {
  theme: MonthlyTheme | null;
  currentDate: Date;
  onEditTheme: () => void;
  onCreateTheme: () => void;
}

export default function MonthlyThemeBanner({
  theme,
  currentDate,
  onEditTheme,
  onCreateTheme,
}: MonthlyThemeBannerProps) {
  const [expanded, setExpanded] = useState(false);

  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();

  if (!theme) {
    return (
      <div
        style={{
          background: 'var(--zander-off-white)',
          border: '2px dashed var(--zander-border-gray)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <div>
            <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>
              No theme set for {monthName} {year}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
              Set a monthly marketing theme to focus your efforts
            </div>
          </div>
        </div>
        <button
          onClick={onCreateTheme}
          style={{
            padding: '0.5rem 1rem',
            background: '#F57C00',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
          }}
        >
          Set Theme
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(245, 124, 0, 0.1) 0%, rgba(245, 124, 0, 0.05) 100%)',
        border: '2px solid rgba(245, 124, 0, 0.3)',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                color: '#F57C00',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {monthName} {year} Theme
            </div>
            <div
              style={{
                fontWeight: '700',
                color: 'var(--zander-navy)',
                fontSize: '1.125rem',
              }}
            >
              {theme.title}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'var(--zander-gray)',
            }}
          >
            {expanded ? 'Less' : 'More'}
          </button>
          <button
            onClick={onEditTheme}
            style={{
              padding: '0.5rem 1rem',
              background: 'white',
              color: '#F57C00',
              border: '2px solid #F57C00',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}
          >
            Edit
          </button>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(245, 124, 0, 0.2)',
          }}
        >
          {theme.description && (
            <p
              style={{
                margin: '0 0 1rem 0',
                color: 'var(--zander-gray)',
                fontSize: '0.875rem',
              }}
            >
              {theme.description}
            </p>
          )}

          {theme.focusAreas.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--zander-navy)',
                  marginBottom: '0.5rem',
                }}
              >
                Focus Areas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {theme.focusAreas.map((area, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: 'white',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      color: 'var(--zander-navy)',
                    }}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {theme.goals.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--zander-navy)',
                  marginBottom: '0.5rem',
                }}
              >
                Goals
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  color: 'var(--zander-gray)',
                  fontSize: '0.875rem',
                }}
              >
                {theme.goals.map((goal, idx) => (
                  <li key={idx}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
