'use client';
import { CSSProperties } from 'react';
import { StorageInfo } from '../types';

interface StorageIndicatorProps {
  storageInfo: StorageInfo | null;
}

export default function StorageIndicator({ storageInfo }: StorageIndicatorProps) {
  if (!storageInfo) {
    return (
      <div style={containerStyle}>
        <div style={labelRowStyle}>
          <span style={labelStyle}>Storage</span>
          <span style={valueStyle}>Loading...</span>
        </div>
        <div style={barBackgroundStyle}>
          <div style={{ ...barFillStyle, width: '0%' }} />
        </div>
      </div>
    );
  }

  const { usedFormatted, limitFormatted, percentUsed, canUpload } = storageInfo;

  // Color based on usage
  const getBarColor = () => {
    if (percentUsed >= 90) return '#EF4444'; // Red
    if (percentUsed >= 70) return '#F59E0B'; // Yellow/Orange
    return '#10B981'; // Green
  };

  return (
    <div style={containerStyle}>
      <div style={labelRowStyle}>
        <span style={labelStyle}>Storage</span>
        <span style={valueStyle}>
          {usedFormatted} / {limitFormatted}
          {!canUpload && (
            <span style={warningStyle}> (Limit reached)</span>
          )}
        </span>
      </div>
      <div style={barBackgroundStyle}>
        <div
          style={{
            ...barFillStyle,
            width: `${Math.min(percentUsed, 100)}%`,
            backgroundColor: getBarColor(),
          }}
        />
      </div>
      <span style={percentStyle}>{percentUsed}% used</span>
    </div>
  );
}

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '1rem 1.5rem',
  background: 'white',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
};

const labelRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const labelStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const valueStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
};

const warningStyle: CSSProperties = {
  color: '#EF4444',
  fontWeight: '600',
};

const barBackgroundStyle: CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: 'var(--zander-light-gray)',
  borderRadius: '4px',
  overflow: 'hidden',
};

const barFillStyle: CSSProperties = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.3s ease',
};

const percentStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
  textAlign: 'right',
};
