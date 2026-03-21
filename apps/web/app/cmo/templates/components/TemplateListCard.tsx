'use client';
import { useState, CSSProperties } from 'react';
import { EmailTemplate } from '../types';
import { parseTemplateBody } from '../utils';

interface TemplateListCardProps {
  template: EmailTemplate;
  onClick: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function TemplateListCard({
  template,
  onClick,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplateListCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const body = parseTemplateBody(template.body);
  const blockCount = body.blocks.length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'draft':
      default:
        return '#6B7280';
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return 'General';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div style={cardStyle} onClick={onClick}>
      {/* Preview Area */}
      <div style={previewStyle}>
        <div style={previewContentStyle}>
          <span style={{ fontSize: '2.5rem' }}>📧</span>
          <span style={blockCountStyle}>{blockCount} blocks</span>
        </div>
      </div>

      {/* Info */}
      <div style={infoStyle}>
        <div style={headerRowStyle}>
          <h3 style={nameStyle}>{template.name}</h3>
          <div style={{ position: 'relative' }}>
            <button
              style={menuButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              ⋮
            </button>
            {showMenu && (
              <div style={menuStyle} onClick={(e) => e.stopPropagation()}>
                <button
                  style={menuItemStyle}
                  onClick={() => {
                    setShowMenu(false);
                    onEdit();
                  }}
                >
                  Edit Details
                </button>
                <button
                  style={menuItemStyle}
                  onClick={() => {
                    setShowMenu(false);
                    onDuplicate();
                  }}
                >
                  Duplicate
                </button>
                <button
                  style={{ ...menuItemStyle, color: '#00CCEE' }}
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {template.subject && (
          <p style={subjectStyle}>{template.subject}</p>
        )}

        <div style={metaStyle}>
          <span
            style={{
              ...statusBadgeStyle,
              backgroundColor: `${getStatusColor(template.status)}15`,
              color: getStatusColor(template.status),
            }}
          >
            {template.status}
          </span>
          <span style={categoryStyle}>{getCategoryLabel(template.category)}</span>
        </div>

        <span style={dateStyle}>Updated {formatDate(template.updatedAt)}</span>
      </div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: '#1C1C26',
  borderRadius: '12px',
  border: '1px solid #2A2A38',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const previewStyle: CSSProperties = {
  height: '140px',
  backgroundColor: '#13131A',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottom: '1px solid #2A2A38',
};

const previewContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
};

const blockCountStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: '#8888A0',
  fontWeight: '500',
};

const infoStyle: CSSProperties = {
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const nameStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '600',
  color: '#F0F0F5',
};

const menuButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.25rem',
  color: '#8888A0',
  cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
};

const menuStyle: CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  background: '#1C1C26',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  border: '1px solid #2A2A38',
  zIndex: 10,
  minWidth: '140px',
  overflow: 'hidden',
};

const menuItemStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.75rem 1rem',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  fontSize: '0.875rem',
  cursor: 'pointer',
  color: '#F0F0F5',
};

const subjectStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  color: '#8888A0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const metaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '0.25rem',
};

const statusBadgeStyle: CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '600',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  textTransform: 'uppercase',
};

const categoryStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: '#8888A0',
};

const dateStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: '#8888A0',
};
