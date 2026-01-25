'use client';
import { CSSProperties } from 'react';
import { EmailBlock } from '../../types';

interface ColumnsBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ColumnsBlock({ block, isSelected, onSelect }: ColumnsBlockProps) {
  const { content, settings } = block;
  const padding = settings.padding || { top: 20, right: 20, bottom: 20, left: 20 };
  const columns = content.columns || [
    { width: 50, blocks: [] },
    { width: 50, blocks: [] },
  ];
  const columnGap = settings.columnGap || 20;

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
          display: 'flex',
          gap: `${columnGap}px`,
        }}
      >
        {columns.map((column: { width: number; blocks: EmailBlock[] }, index: number) => (
          <div
            key={index}
            style={{
              flex: column.width,
              minHeight: '80px',
              backgroundColor: 'var(--zander-off-white)',
              borderRadius: '4px',
              border: '2px dashed var(--zander-border-gray)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {column.blocks.length === 0 ? (
              <span style={placeholderTextStyle}>
                Column {index + 1}
              </span>
            ) : (
              <span style={placeholderTextStyle}>
                {column.blocks.length} block(s)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const containerStyle: CSSProperties = {
  cursor: 'pointer',
  transition: 'outline 0.15s ease',
};

const placeholderTextStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
};
