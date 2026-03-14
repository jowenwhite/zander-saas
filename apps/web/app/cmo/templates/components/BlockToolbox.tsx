'use client';
import { CSSProperties } from 'react';
import { EmailBlockType } from '../types';
import { getBlocksByCategory, BlockTypeInfo } from '../utils';

interface BlockToolboxProps {
  onDragStart: (type: EmailBlockType) => void;
}

export default function BlockToolbox({ onDragStart }: BlockToolboxProps) {
  const categories = getBlocksByCategory();

  const handleDragStart = (e: React.DragEvent, type: EmailBlockType) => {
    e.dataTransfer.setData('blockType', type);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(type);
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Blocks</h3>

      <div style={categoryContainerStyle}>
        <h4 style={categoryTitleStyle}>Structure</h4>
        {categories.structure.map((block) => (
          <BlockItem key={block.type} block={block} onDragStart={handleDragStart} />
        ))}
      </div>

      <div style={categoryContainerStyle}>
        <h4 style={categoryTitleStyle}>Content</h4>
        {categories.content.map((block) => (
          <BlockItem key={block.type} block={block} onDragStart={handleDragStart} />
        ))}
      </div>

      <div style={categoryContainerStyle}>
        <h4 style={categoryTitleStyle}>Footer</h4>
        {categories.footer.map((block) => (
          <BlockItem key={block.type} block={block} onDragStart={handleDragStart} />
        ))}
      </div>
    </div>
  );
}

interface BlockItemProps {
  block: BlockTypeInfo;
  onDragStart: (e: React.DragEvent, type: EmailBlockType) => void;
}

function BlockItem({ block, onDragStart }: BlockItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, block.type)}
      style={blockItemStyle}
    >
      <span style={iconStyle}>{block.icon}</span>
      <span style={labelStyle}>{block.label}</span>
    </div>
  );
}

const containerStyle: CSSProperties = {
  width: '160px',
  backgroundColor: 'white',
  borderRight: '1px solid var(--zander-border-gray)',
  padding: '1rem',
  overflowY: 'auto',
  height: '100%',
};

const titleStyle: CSSProperties = {
  margin: '0 0 1rem 0',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#13131A',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const categoryContainerStyle: CSSProperties = {
  marginBottom: '1.5rem',
};

const categoryTitleStyle: CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '0.75rem',
  fontWeight: '500',
  color: '#8888A0',
  textTransform: 'uppercase',
};

const blockItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  backgroundColor: '#1C1C26',
  borderRadius: '6px',
  marginBottom: '0.5rem',
  cursor: 'grab',
  transition: 'all 0.15s ease',
  border: '1px solid transparent',
};

const iconStyle: CSSProperties = {
  fontSize: '1rem',
};

const labelStyle: CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--zander-dark-gray)',
  fontWeight: '500',
};
