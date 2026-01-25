'use client';
import { CSSProperties } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Asset } from '../types';

interface AssetPreviewModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
  onDownload: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export default function AssetPreviewModal({
  asset,
  isOpen,
  onClose,
  onCopyUrl,
  onDownload,
  onDelete,
}: AssetPreviewModalProps) {
  if (!asset) return null;

  const isImage = asset.assetType === 'image';
  const isVideo = asset.assetType === 'video';
  const isPDF = asset.mimeType?.includes('pdf');

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = () => {
    if (isVideo) return '🎥';
    if (isPDF) return '📄';
    if (asset.mimeType?.includes('word') || asset.mimeType?.includes('document')) return '📝';
    if (asset.mimeType?.includes('excel') || asset.mimeType?.includes('spreadsheet')) return '📊';
    return '📁';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={asset.name}
      subtitle={asset.folder || 'Uncategorized'}
      size="xl"
      footer={
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Are you sure you want to delete this asset?')) {
                onDelete(asset);
              }
            }}
          >
            Delete
          </Button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" onClick={() => onCopyUrl(asset.url)}>
              Copy URL
            </Button>
            <Button variant="secondary" onClick={() => onDownload(asset)}>
              Download
            </Button>
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div style={contentStyle}>
        {/* Preview */}
        <div style={previewContainerStyle}>
          {isImage ? (
            <img src={asset.url} alt={asset.name} style={previewImageStyle} />
          ) : isVideo ? (
            <video
              src={asset.url}
              controls
              style={previewVideoStyle}
            />
          ) : isPDF ? (
            <iframe
              src={asset.url}
              style={previewIframeStyle}
              title={asset.name}
            />
          ) : (
            <div style={previewPlaceholderStyle}>
              <span style={{ fontSize: '5rem' }}>{getFileIcon()}</span>
              <p style={{ margin: '1rem 0 0', color: 'var(--zander-gray)' }}>
                Preview not available
              </p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div style={metadataStyle}>
          <h3 style={metadataTitleStyle}>Details</h3>

          <div style={metadataRowStyle}>
            <span style={metadataLabelStyle}>Type</span>
            <span style={metadataValueStyle}>{asset.mimeType || asset.assetType}</span>
          </div>

          <div style={metadataRowStyle}>
            <span style={metadataLabelStyle}>Size</span>
            <span style={metadataValueStyle}>{formatFileSize(asset.fileSize)}</span>
          </div>

          <div style={metadataRowStyle}>
            <span style={metadataLabelStyle}>Folder</span>
            <span style={metadataValueStyle}>{asset.folder || 'Uncategorized'}</span>
          </div>

          <div style={metadataRowStyle}>
            <span style={metadataLabelStyle}>Uploaded</span>
            <span style={metadataValueStyle}>{formatDate(asset.createdAt)}</span>
          </div>

          {asset.description && (
            <div style={{ ...metadataRowStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={metadataLabelStyle}>Description</span>
              <span style={{ ...metadataValueStyle, marginTop: '0.25rem' }}>{asset.description}</span>
            </div>
          )}

          {asset.tags && asset.tags.length > 0 && (
            <div style={{ ...metadataRowStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={metadataLabelStyle}>Tags</span>
              <div style={tagsContainerStyle}>
                {asset.tags.map((tag, index) => (
                  <span key={index} style={tagStyle}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ ...metadataRowStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={metadataLabelStyle}>URL</span>
            <input
              type="text"
              value={asset.url}
              readOnly
              style={urlInputStyle}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

const contentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const previewContainerStyle: CSSProperties = {
  background: 'var(--zander-light-gray)',
  borderRadius: '8px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '300px',
  maxHeight: '400px',
};

const previewImageStyle: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '400px',
  objectFit: 'contain',
};

const previewVideoStyle: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '400px',
};

const previewIframeStyle: CSSProperties = {
  width: '100%',
  height: '400px',
  border: 'none',
};

const previewPlaceholderStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem',
};

const metadataStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const metadataTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--zander-navy)',
  borderBottom: '1px solid var(--zander-border-gray)',
  paddingBottom: '0.5rem',
};

const metadataRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const metadataLabelStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
  fontWeight: '500',
};

const metadataValueStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--zander-dark-gray)',
};

const tagsContainerStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '0.25rem',
};

const tagStyle: CSSProperties = {
  fontSize: '0.75rem',
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  background: 'rgba(245, 124, 0, 0.1)',
  color: '#F57C00',
  fontWeight: '500',
};

const urlInputStyle: CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
  background: 'var(--zander-off-white)',
  marginTop: '0.25rem',
};
