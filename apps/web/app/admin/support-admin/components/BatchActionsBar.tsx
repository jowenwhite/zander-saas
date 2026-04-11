'use client';

interface BatchActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkTierOverride: () => void;
  onBulkTrialExtend: () => void;
  onBulkArchive: () => void;
}

export function BatchActionsBar({
  selectedCount,
  onClearSelection,
  onBulkTierOverride,
  onBulkTrialExtend,
  onBulkArchive,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1C1C26',
        border: '1px solid #00CCEE',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 8px 24px rgba(0, 204, 238, 0.2)',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            background: '#00CCEE',
            color: '#1C1C26',
            padding: '0.25rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '700',
          }}
        >
          {selectedCount}
        </span>
        <span style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>
          tenant{selectedCount > 1 ? 's' : ''} selected
        </span>
      </div>

      <div style={{ width: '1px', height: '24px', background: '#2A2A38' }} />

      <button
        onClick={onBulkTierOverride}
        style={{
          background: '#2A2A38',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          color: '#F0F0F5',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        Set Tier Override
      </button>

      <button
        onClick={onBulkTrialExtend}
        style={{
          background: '#2A2A38',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          color: '#17a2b8',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        Extend Trials
      </button>

      <button
        onClick={onBulkArchive}
        style={{
          background: '#2A2A38',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          color: '#dc3545',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        Archive All
      </button>

      <div style={{ width: '1px', height: '24px', background: '#2A2A38' }} />

      <button
        onClick={onClearSelection}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.5rem',
          color: '#8888A0',
          cursor: 'pointer',
          fontSize: '1.25rem',
          lineHeight: 1,
        }}
        title="Clear selection"
      >
        &times;
      </button>
    </div>
  );
}
