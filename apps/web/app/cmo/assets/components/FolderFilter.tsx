'use client';
import { CSSProperties } from 'react';
import { FolderInfo } from '../types';

interface FolderFilterProps {
  folders: FolderInfo[];
  total: number;
  activeFolder: string | null;
  onFolderChange: (folder: string | null) => void;
}

export default function FolderFilter({
  folders,
  total,
  activeFolder,
  onFolderChange,
}: FolderFilterProps) {
  return (
    <div style={containerStyle}>
      <button
        style={{
          ...tabStyle,
          ...(activeFolder === null ? activeTabStyle : {}),
        }}
        onClick={() => onFolderChange(null)}
      >
        All
        <span style={countStyle}>{total}</span>
      </button>

      {folders.map((folder) => (
        <button
          key={folder.name}
          style={{
            ...tabStyle,
            ...(activeFolder === folder.name ? activeTabStyle : {}),
          }}
          onClick={() => onFolderChange(folder.name)}
        >
          {folder.name}
          <span style={countStyle}>{folder.count}</span>
        </button>
      ))}
    </div>
  );
}

const containerStyle: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
};

const tabStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
  background: 'white',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: 'var(--zander-gray)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const activeTabStyle: CSSProperties = {
  background: '#F57C00',
  borderColor: '#F57C00',
  color: 'white',
};

const countStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '20px',
  height: '20px',
  padding: '0 6px',
  borderRadius: '10px',
  background: 'rgba(0, 0, 0, 0.1)',
  fontSize: '0.75rem',
  fontWeight: '600',
};
