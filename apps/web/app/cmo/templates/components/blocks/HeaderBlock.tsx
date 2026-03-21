'use client';
import { CSSProperties } from 'react';
import { EmailBlock } from '../../types';

interface HeaderBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
}

export default function HeaderBlock({ block, isSelected, onSelect }: HeaderBlockProps) {
  const { content, settings } = block;
  const padding = settings.padding || { top: 25, right: 20, bottom: 25, left: 20 };

  return (
    <div
      style={{
        ...containerStyle,
        backgroundColor: settings.backgroundColor || '#ffffff',
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        textAlign: (settings.alignment as 'left' | 'center' | 'right') || 'center',
        outline: isSelected ? '2px solid var(--zander-blue)' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {content.logoUrl ? (
        <img
          src={content.logoUrl}
          alt={content.logoAlt || 'Logo'}
          style={{
            maxWidth: `${content.logoWidth || 150}px`,
            height: 'auto',
          }}
        />
      ) : (
        <div style={placeholderStyle}>
          <span style={{ fontSize: '1.5rem' }}>🔝</span>
          <span style={placeholderTextStyle}>Add your logo</span>
        </div>
      )}
    </div>
  );
}

const containerStyle: CSSProperties = {
  cursor: 'pointer',
  transition: 'outline 0.15s ease',
};

const placeholderStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '1rem',
  backgroundColor: '#13131A',
  borderRadius: '8px',
  border: '2px dashed #2A2A38',
};

const placeholderTextStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: '#8888A0',
};
