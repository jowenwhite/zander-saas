'use client';
import { useState, useRef, CSSProperties } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { FOLDER_OPTIONS, FolderType } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, folder: string, description: string, tags: string[]) => Promise<void>;
  isUploading: boolean;
}

export default function UploadModal({ isOpen, onClose, onUpload, isUploading }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [folder, setFolder] = useState<FolderType>('Images');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    await onUpload(selectedFile, folder, description, tags);
    handleReset();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setFolder('Images');
    setDescription('');
    setTagsInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word') || file.type.includes('document')) return '📝';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
    return '📁';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Asset"
      subtitle="Upload images, documents, or videos to your brand library"
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Drag and drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            ...dropZoneStyle,
            borderColor: dragOver ? '#F57C00' : 'var(--zander-border-gray)',
            backgroundColor: dragOver ? 'rgba(245, 124, 0, 0.05)' : 'var(--zander-off-white)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,video/*"
            style={{ display: 'none' }}
          />

          {selectedFile ? (
            <div style={filePreviewStyle}>
              {preview ? (
                <img src={preview} alt="Preview" style={previewImageStyle} />
              ) : (
                <span style={{ fontSize: '3rem' }}>{getFileIcon(selectedFile)}</span>
              )}
              <div style={fileInfoStyle}>
                <span style={fileNameStyle}>{selectedFile.name}</span>
                <span style={fileSizeStyle}>{formatFileSize(selectedFile.size)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                style={removeButtonStyle}
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <span style={{ fontSize: '3rem' }}>📤</span>
              <p style={dropTextStyle}>
                Drag and drop a file here, or click to browse
              </p>
              <p style={dropSubtextStyle}>
                Supports images, PDFs, documents, and videos (max 50MB)
              </p>
            </>
          )}
        </div>

        {/* Folder selection */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Folder</label>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value as FolderType)}
            style={selectStyle}
          >
            {FOLDER_OPTIONS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for this asset..."
            style={textareaStyle}
            rows={3}
          />
        </div>

        {/* Tags */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Tags (optional)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Enter tags separated by commas"
            style={inputStyle}
          />
          <span style={hintStyle}>Example: logo, brand, primary</span>
        </div>
      </div>
    </Modal>
  );
}

const dropZoneStyle: CSSProperties = {
  border: '2px dashed',
  borderRadius: '12px',
  padding: '3rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: '200px',
};

const dropTextStyle: CSSProperties = {
  margin: '1rem 0 0.5rem',
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const dropSubtextStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
};

const filePreviewStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const previewImageStyle: CSSProperties = {
  maxWidth: '200px',
  maxHeight: '150px',
  objectFit: 'contain',
  borderRadius: '8px',
};

const fileInfoStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem',
};

const fileNameStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const fileSizeStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
};

const removeButtonStyle: CSSProperties = {
  background: 'none',
  border: '1px solid var(--zander-red)',
  color: 'var(--zander-red)',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '500',
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const selectStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '1rem',
  color: 'var(--zander-dark-gray)',
  background: 'white',
  cursor: 'pointer',
};

const inputStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '1rem',
  color: 'var(--zander-dark-gray)',
};

const textareaStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '1rem',
  color: 'var(--zander-dark-gray)',
  resize: 'vertical',
  fontFamily: 'inherit',
};

const hintStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
};
