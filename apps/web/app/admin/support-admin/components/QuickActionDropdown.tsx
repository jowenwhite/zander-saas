'use client';

import { useState, useRef, useEffect } from 'react';
import { SegmentedTenant } from '../hooks/useEngagement';

type ActionType =
  | 'reactivation_email'
  | 'offer_discount'
  | 'extend_trial'
  | 'upgrade_offer'
  | 'schedule_demo'
  | 'feedback_survey'
  | 'winback_campaign'
  | 'exit_survey'
  | 'view_tickets';

interface ActionConfig {
  label: string;
  type: ActionType;
  icon: string;
}

interface QuickActionDropdownProps {
  tenant: SegmentedTenant;
  segment: 'at_risk' | 'power_users' | 'churning';
  onAction: (tenant: SegmentedTenant, actionType: ActionType) => void;
}

const segmentActions: Record<string, ActionConfig[]> = {
  at_risk: [
    { label: 'Send reactivation email', type: 'reactivation_email', icon: '' },
    { label: 'Offer discount', type: 'offer_discount', icon: '%' },
    { label: 'Extend trial', type: 'extend_trial', icon: '+' },
  ],
  power_users: [
    { label: 'Send upgrade offer', type: 'upgrade_offer', icon: '*' },
    { label: 'Schedule demo', type: 'schedule_demo', icon: '#' },
    { label: 'Ask for feedback', type: 'feedback_survey', icon: '?' },
  ],
  churning: [
    { label: 'Win-back campaign', type: 'winback_campaign', icon: '<' },
    { label: 'Exit survey', type: 'exit_survey', icon: '>' },
    { label: 'View support tickets', type: 'view_tickets', icon: '!' },
  ],
};

export function QuickActionDropdown({ tenant, segment, onAction }: QuickActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const actions = segmentActions[segment] || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#2A2A38',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          color: '#F0F0F5',
          cursor: 'pointer',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        Actions
        <span style={{ fontSize: '0.7rem' }}>{isOpen ? '^' : 'v'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '0.25rem',
            background: '#1C1C26',
            border: '1px solid #2A2A38',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 100,
            minWidth: '200px',
            overflow: 'hidden',
          }}
        >
          {actions.map((action) => (
            <button
              key={action.type}
              onClick={() => {
                onAction(tenant, action.type);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: 'none',
                color: '#F0F0F5',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2A2A38';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ width: '20px', textAlign: 'center', color: '#8888A0' }}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export type { ActionType };
