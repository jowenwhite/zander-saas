'use client';
import { CSSProperties } from 'react';
import { EmailBlock } from '../../types';

interface TextBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TextBlock({ block, isSelected, onSelect }: TextBlockProps) {
  const { content, settings } = block;
  const padding = settings.padding || { top: 20, right: 40, bottom: 20, left: 40 };

  return (
    <div
      style={{
        ...containerStyle,
        backgroundColor: settings.backgroundColor || '#ffffff',
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        textAlign: (settings.alignment as 'left' | 'center' | 'right') || 'left',
        outline: isSelected ? '2px solid var(--zander-blue)' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {content.html ? (
        <div
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <div style={placeholderStyle}>
          <span style={{ fontSize: '1.5rem' }}>📝</span>
          <span style={placeholderTextStyle}>Click to add text</span>
        </div>
      )}
    </div>
  );
}

const containerStyle: CSSProperties = {
  cursor: 'pointer',
  transition: 'outline 0.15s ease',
};

const textStyle: CSSProperties = {
  fontSize: '1rem',
  lineHeight: '1.6',
  color: '#333333', // Dark text for email preview (white background)
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
