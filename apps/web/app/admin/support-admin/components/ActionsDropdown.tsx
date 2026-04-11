'use client';

import { useState, useRef, useEffect } from 'react';
import { Tenant } from '../hooks/useTenants';

interface ActionsDropdownProps {
  tenant: Tenant;
  onView: () => void;
  onRename: () => void;
  onTierChange: () => void;
  onTrialExtend: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export function ActionsDropdown({
  tenant,
  onView,
  onRename,
  onTierChange,
  onTrialExtend,
  onArchive,
  onRestore,
}: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isArchived = tenant.status === 'ARCHIVED';

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#2A2A38',
          border: 'none',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          color: '#F0F0F5',
          cursor: 'pointer',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        Actions
        <span style={{ fontSize: '0.65rem' }}>{isOpen ? '>' : '<'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.25rem',
            background: '#1C1C26',
            border: '1px solid #2A2A38',
            borderRadius: '8px',
            minWidth: '180px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => {
              onView();
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'transparent',
              color: '#F0F0F5',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A38')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>View Details</span>
          </button>

          {!isArchived && (
            <>
              <button
                onClick={() => {
                  onRename();
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#F0F0F5',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A38')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Rename
              </button>

              <button
                onClick={() => {
                  onTierChange();
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#F0F0F5',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A38')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Change Tier
              </button>

              {tenant.trialActive && (
                <button
                  onClick={() => {
                    onTrialExtend();
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#17a2b8',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A38')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Extend Trial
                </button>
              )}

              <div style={{ borderTop: '1px solid #2A2A38', margin: '0.25rem 0' }} />

              <button
                onClick={() => {
                  onArchive();
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#dc3545',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A38')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Archive
              </button>
            </>
          )}

          {isArchived && (
            <button
              onClick={() => {
                onRestore();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'transparent',
                color: '#28a745',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2A38')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Restore
            </button>
          )}
        </div>
      )}
    </div>
  );
}
