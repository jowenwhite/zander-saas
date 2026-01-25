'use client';
import { CSSProperties } from 'react';
import { EmailBlock } from '../../types';

interface ImageBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ImageBlock({ block, isSelected, onSelect }: ImageBlockProps) {
  const { content, settings } = block;
  const padding = settings.padding || { top: 20, right: 20, bottom: 20, left: 20 };

  const getImageWidth = () => {
    if (content.width === 'full') return '100%';
    return `${content.width || 400}px`;
  };

  const imageElement = content.src ? (
    <img
      src={content.src}
      alt={content.alt || 'Image'}
      style={{
        maxWidth: getImageWidth(),
        width: content.width === 'full' ? '100%' : 'auto',
        height: 'auto',
        display: 'block',
      }}
    />
  ) : (
    <div style={placeholderStyle}>
      <span style={{ fontSize: '2rem' }}>🖼️</span>
      <span style={placeholderTextStyle}>Add an image</span>
    </div>
  );

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
      {content.linkUrl ? (
        <a href={content.linkUrl} style={{ display: 'inline-block' }}>
          {imageElement}
        </a>
      ) : (
        imageElement
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
  padding: '2rem',
  backgroundColor: 'var(--zander-off-white)',
  borderRadius: '8px',
  border: '2px dashed var(--zander-border-gray)',
};

const placeholderTextStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
};
