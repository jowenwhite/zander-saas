'use client';
import { CSSProperties } from 'react';
import { EmailBlock } from '../../types';

interface DividerBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DividerBlock({ block, isSelected, onSelect }: DividerBlockProps) {
  const { content, settings } = block;
  const padding = settings.padding || { top: 15, right: 40, bottom: 15, left: 40 };

  return (
    <div
      style={{
        ...containerStyle,
        backgroundColor: settings.backgroundColor || '#ffffff',
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        outline: isSelected ? '2px solid var(--zander-blue)' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        style={{
          width: `${content.lineWidth || 100}%`,
          height: `${content.lineThickness || 1}px`,
          backgroundColor: content.lineColor || '#dddddd',
          borderStyle: content.lineStyle || 'solid',
          borderWidth: content.lineStyle !== 'solid' ? `${content.lineThickness || 1}px` : 0,
          borderColor: content.lineColor || '#dddddd',
          margin: '0 auto',
        }}
      />
    </div>
  );
}

const containerStyle: CSSProperties = {
  cursor: 'pointer',
  transition: 'outline 0.15s ease',
};
