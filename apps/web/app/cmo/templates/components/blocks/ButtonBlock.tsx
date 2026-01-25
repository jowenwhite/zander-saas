'use client';
import { CSSProperties } from 'react';
import { EmailBlock } from '../../types';

interface ButtonBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ButtonBlock({ block, isSelected, onSelect }: ButtonBlockProps) {
  const { content, settings } = block;
  const padding = settings.padding || { top: 20, right: 40, bottom: 20, left: 40 };

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
      <a
        href={content.url || '#'}
        style={{
          display: content.fullWidth ? 'block' : 'inline-block',
          backgroundColor: content.buttonColor || '#F57C00',
          color: content.textColor || '#ffffff',
          padding: '12px 24px',
          borderRadius: `${content.borderRadius || 6}px`,
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '1rem',
          textAlign: 'center',
        }}
        onClick={(e) => e.preventDefault()}
      >
        {content.text || 'Click Here'}
      </a>
    </div>
  );
}

const containerStyle: CSSProperties = {
  cursor: 'pointer',
  transition: 'outline 0.15s ease',
};
