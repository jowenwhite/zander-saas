'use client';
import { useState, useEffect } from 'react';
import { Funnel, FunnelFormData, FunnelStatus } from '../types';

interface FunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  funnel: Funnel | null;
  onSave: (data: FunnelFormData) => void;
  onDelete?: () => void;
}

const statusOptions: { value: FunnelStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
];

export default function FunnelModal({
  isOpen,
  onClose,
  funnel,
  onSave,
  onDelete,
}: FunnelModalProps) {
  const [formData, setFormData] = useState<FunnelFormData>({
    name: '',
    description: '',
    conversionGoal: '',
    status: 'draft',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (funnel) {
      setFormData({
        name: funnel.name,
        description: funnel.description || '',
        conversionGoal: funnel.conversionGoal || '',
        status: funnel.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        conversionGoal: '',
        status: 'draft',
      });
    }
    setShowDeleteConfirm(false);
  }, [funnel, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid var(--zander-border-gray)',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: 'var(--zander-navy)',
    fontSize: '0.875rem',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--zander-border-gray)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--zander-navy)',
            }}
          >
            {funnel ? 'Edit Funnel' : 'Create Funnel'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--zander-gray)',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Funnel Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Lead Generation Funnel"
              required
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this funnel for?"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Conversion Goal */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Conversion Goal</label>
            <input
              type="text"
              value={formData.conversionGoal}
              onChange={(e) => setFormData({ ...formData, conversionGoal: e.target.value })}
              placeholder="e.g., Schedule a demo, Sign up for trial"
              style={inputStyle}
            />
          </div>

          {/* Status (only show for editing) */}
          {funnel && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as FunnelStatus })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--zander-border-gray)',
            background: 'var(--zander-off-white)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {funnel && onDelete ? (
            showDeleteConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                  Delete this funnel?
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--zander-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: 'var(--zander-gray)',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: 'var(--zander-red)',
                  border: '2px solid var(--zander-red)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                }}
              >
                Delete
              </button>
            )
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: 'var(--zander-gray)',
                border: '2px solid var(--zander-border-gray)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#F57C00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              {funnel ? 'Save Changes' : 'Create Funnel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
