'use client';
import { useState, CSSProperties } from 'react';
import { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  onCopyUrl: (url: string) => void;
  onDownload: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onClick: (asset: Asset) => void;
}

export default function AssetCard({
  asset,
  onCopyUrl,
  onDownload,
  onDelete,
  onClick,
}: AssetCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isImage = asset.assetType === 'image';
  const isVideo = asset.assetType === 'video';

  const getFileIcon = () => {
    if (isVideo) return '🎥';
    if (asset.mimeType?.includes('pdf')) return '📄';
    if (asset.mimeType?.includes('word') || asset.mimeType?.includes('document')) return '📝';
    if (asset.mimeType?.includes('excel') || asset.mimeType?.includes('spreadsheet')) return '📊';
    return '📁';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onClick(asset)}
    >
      {/* Thumbnail/Preview */}
      <div style={thumbnailContainerStyle}>
        {isImage && !imageError ? (
          <img
            src={asset.thumbnailUrl || asset.url}
            alt={asset.name}
            style={thumbnailImageStyle}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={iconContainerStyle}>
            <span style={{ fontSize: '3rem' }}>{getFileIcon()}</span>
          </div>
        )}

        {/* Hover overlay with actions */}
        {showActions && (
          <div style={overlayStyle} onClick={(e) => e.stopPropagation()}>
            <button
              style={actionButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                onCopyUrl(asset.url);
              }}
              title="Copy URL"
            >
              📋
            </button>
            <button
              style={actionButtonStyle}
              onClick={(e) => {
                e.stopPropagation();
                onDownload(asset);
              }}
              title="Download"
            >
              ⬇️
            </button>
            <button
              style={{ ...actionButtonStyle, ...deleteButtonStyle }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(asset);
              }}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={infoStyle}>
        <span style={nameStyle} title={asset.name}>
          {asset.name}
        </span>
        <div style={metaStyle}>
          <span style={folderBadgeStyle}>{asset.folder || 'Uncategorized'}</span>
          {asset.fileSize && (
            <span style={sizeStyle}>{formatFileSize(asset.fileSize)}</span>
          )}
        </div>
        <span style={dateStyle}>{formatDate(asset.createdAt)}</span>
      </div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid var(--zander-border-gray)',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
};

const thumbnailContainerStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  paddingTop: '75%', // 4:3 aspect ratio
  backgroundColor: 'var(--zander-off-white)',
  overflow: 'hidden',
};

const thumbnailImageStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const iconContainerStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--zander-light-gray)',
};

const overlayStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
};

const actionButtonStyle: CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  border: 'none',
  background: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  transition: 'transform 0.2s ease',
};

const deleteButtonStyle: CSSProperties = {
  background: '#FEE2E2',
};

const infoStyle: CSSProperties = {
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const nameStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const metaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const folderBadgeStyle: CSSProperties = {
  fontSize: '0.75rem',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  background: 'rgba(245, 124, 0, 0.1)',
  color: '#F57C00',
  fontWeight: '500',
};

const sizeStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
};

const dateStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
};
