'use client';
import { useState, CSSProperties } from 'react';
import { EmailBlock, EmailBlockType, EmailTemplateContent } from '../types';
import { createDefaultBlock, moveBlock, insertBlockAt, removeBlockAt, updateBlockAt } from '../utils';
import BlockRenderer from './BlockRenderer';

interface TemplateBuilderProps {
  content: EmailTemplateContent;
  onChange: (content: EmailTemplateContent) => void;
  selectedBlockIndex: number | null;
  onSelectBlock: (index: number | null) => void;
}

export default function TemplateBuilder({
  content,
  onChange,
  selectedBlockIndex,
  onSelectBlock,
}: TemplateBuilderProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingBlockIndex, setDraggingBlockIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    const blockType = e.dataTransfer.getData('blockType') as EmailBlockType;
    if (blockType) {
      // New block from toolbox
      const newBlock = createDefaultBlock(blockType);
      const newBlocks = insertBlockAt(content.blocks, newBlock, index);
      onChange({ ...content, blocks: newBlocks });
      onSelectBlock(index);
    } else if (draggingBlockIndex !== null && draggingBlockIndex !== index) {
      // Reordering existing block
      const newBlocks = moveBlock(content.blocks, draggingBlockIndex, index);
      onChange({ ...content, blocks: newBlocks });
      const newSelectedIndex = draggingBlockIndex < index ? index - 1 : index;
      onSelectBlock(newSelectedIndex);
    }
    setDraggingBlockIndex(null);
  };

  const handleBlockDragStart = (index: number) => {
    setDraggingBlockIndex(index);
  };

  const handleBlockDragEnd = () => {
    setDraggingBlockIndex(null);
    setDragOverIndex(null);
  };

  const handleUpdateBlock = (index: number, block: EmailBlock) => {
    const newBlocks = updateBlockAt(content.blocks, index, block);
    onChange({ ...content, blocks: newBlocks });
  };

  const handleDeleteBlock = (index: number) => {
    const newBlocks = removeBlockAt(content.blocks, index);
    onChange({ ...content, blocks: newBlocks });
    onSelectBlock(null);
  };

  const handleCanvasClick = () => {
    onSelectBlock(null);
  };

  return (
    <div style={containerStyle} onClick={handleCanvasClick}>
      <div
        style={{
          ...canvasStyle,
          width: `${content.settings.contentWidth}px`,
          backgroundColor: content.settings.backgroundColor,
        }}
      >
        {content.blocks.length === 0 ? (
          <div
            style={emptyCanvasStyle}
            onDragOver={(e) => handleDragOver(e, 0)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 0)}
          >
            <span style={{ fontSize: '3rem' }}>📧</span>
            <p style={emptyTextStyle}>Drag blocks here to start building</p>
            <p style={hintTextStyle}>or start from a pre-built template</p>
          </div>
        ) : (
          <>
            {content.blocks.map((block, index) => (
              <div key={block.id}>
                {/* Drop zone before each block */}
                <div
                  style={{
                    ...dropZoneStyle,
                    ...(dragOverIndex === index ? dropZoneActiveStyle : {}),
                  }}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                />

                {/* Block wrapper with drag handle */}
                <div
                  style={{
                    ...blockWrapperStyle,
                    opacity: draggingBlockIndex === index ? 0.5 : 1,
                  }}
                  draggable
                  onDragStart={() => handleBlockDragStart(index)}
                  onDragEnd={handleBlockDragEnd}
                >
                  {/* Drag handle */}
                  <div style={dragHandleStyle}>
                    <span style={dragIconStyle}>⋮⋮</span>
                  </div>

                  {/* Block content */}
                  <div style={{ flex: 1 }}>
                    <BlockRenderer
                      block={block}
                      isSelected={selectedBlockIndex === index}
                      onSelect={() => onSelectBlock(index)}
                    />
                  </div>

                  {/* Quick actions */}
                  {selectedBlockIndex === index && (
                    <div style={quickActionsStyle}>
                      <button
                        style={quickActionButtonStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(index);
                        }}
                        title="Delete block"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Drop zone after last block */}
            <div
              style={{
                ...dropZoneStyle,
                ...lastDropZoneStyle,
                ...(dragOverIndex === content.blocks.length ? dropZoneActiveStyle : {}),
              }}
              onDragOver={(e) => handleDragOver(e, content.blocks.length)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, content.blocks.length)}
            >
              <span style={dropZoneLabelStyle}>Drop block here</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const containerStyle: CSSProperties = {
  flex: 1,
  backgroundColor: '#e5e5e5',
  padding: '2rem',
  overflowY: 'auto',
  display: 'flex',
  justifyContent: 'center',
};

const canvasStyle: CSSProperties = {
  minHeight: '400px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  borderRadius: '4px',
  overflow: 'hidden',
};

const emptyCanvasStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  padding: '2rem',
  border: '2px dashed var(--zander-border-gray)',
  borderRadius: '8px',
  margin: '1rem',
  backgroundColor: 'white',
};

const emptyTextStyle: CSSProperties = {
  margin: '1rem 0 0.5rem 0',
  fontSize: '1rem',
  color: 'var(--zander-dark-gray)',
  fontWeight: '500',
};

const hintTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
};

const blockWrapperStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  transition: 'opacity 0.15s ease',
};

const dragHandleStyle: CSSProperties = {
  position: 'absolute',
  left: '-24px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '20px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'grab',
  opacity: 0.3,
  transition: 'opacity 0.15s ease',
};

const dragIconStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
  letterSpacing: '-2px',
};

const quickActionsStyle: CSSProperties = {
  position: 'absolute',
  right: '-32px',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const quickActionButtonStyle: CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'white',
  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
};

const dropZoneStyle: CSSProperties = {
  height: '4px',
  margin: '0',
  transition: 'all 0.15s ease',
  borderRadius: '2px',
};

const dropZoneActiveStyle: CSSProperties = {
  height: '40px',
  backgroundColor: 'var(--zander-blue)',
  opacity: 0.2,
  margin: '8px 0',
};

const lastDropZoneStyle: CSSProperties = {
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px dashed transparent',
  margin: '8px',
  borderRadius: '4px',
};

const dropZoneLabelStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
  opacity: 0,
  transition: 'opacity 0.15s ease',
};
