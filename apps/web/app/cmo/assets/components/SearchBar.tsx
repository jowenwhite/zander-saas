'use client';
import { useState, useEffect, CSSProperties } from 'react';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  onTypeChange: (type: string | null) => void;
  onSortChange: (sort: 'newest' | 'oldest' | 'name' | 'size') => void;
  activeType: string | null;
  activeSort: 'newest' | 'oldest' | 'name' | 'size';
}

export default function SearchBar({
  onSearchChange,
  onTypeChange,
  onSortChange,
  activeType,
  activeSort,
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  return (
    <div style={containerStyle}>
      {/* Search Input */}
      <div style={searchContainerStyle}>
        <span style={searchIconStyle}>🔍</span>
        <input
          type="text"
          placeholder="Search assets..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={searchInputStyle}
        />
        {searchValue && (
          <button
            style={clearButtonStyle}
            onClick={() => setSearchValue('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div style={filterGroupStyle}>
        <label style={filterLabelStyle}>Type:</label>
        <select
          value={activeType || ''}
          onChange={(e) => onTypeChange(e.target.value || null)}
          style={selectStyle}
        >
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {/* Sort */}
      <div style={filterGroupStyle}>
        <label style={filterLabelStyle}>Sort:</label>
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as any)}
          style={selectStyle}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name (A-Z)</option>
          <option value="size">Size (Largest)</option>
        </select>
      </div>
    </div>
  );
}

const containerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
};

const searchContainerStyle: CSSProperties = {
  position: 'relative',
  flex: '1 1 300px',
  maxWidth: '400px',
};

const searchIconStyle: CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '0.875rem',
  pointerEvents: 'none',
};

const searchInputStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem 2.5rem 0.75rem 2.5rem',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '0.875rem',
  color: 'var(--zander-dark-gray)',
  background: 'white',
};

const clearButtonStyle: CSSProperties = {
  position: 'absolute',
  right: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  padding: '4px 8px',
  cursor: 'pointer',
  color: 'var(--zander-gray)',
  fontSize: '0.75rem',
};

const filterGroupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const filterLabelStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
  fontWeight: '500',
};

const selectStyle: CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '0.875rem',
  color: 'var(--zander-dark-gray)',
  background: 'white',
  cursor: 'pointer',
};
