'use client';
import { useState, useEffect } from 'react';
import { Workflow, WorkflowFormData, WorkflowTriggerType } from '../types';
import { getTriggerTypes, getTriggerTypeInfo } from '../utils';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
  onSave: (data: WorkflowFormData) => void;
  onDelete?: () => void;
}

export default function WorkflowModal({
  isOpen,
  onClose,
  workflow,
  onSave,
  onDelete,
}: WorkflowModalProps) {
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    description: '',
    triggerType: 'manual',
    triggerConfig: {},
    status: 'draft',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const triggerTypes = getTriggerTypes();

  useEffect(() => {
    if (workflow) {
      setFormData({
        name: workflow.name,
        description: workflow.description || '',
        triggerType: workflow.triggerType,
        triggerConfig: workflow.triggerConfig || {},
        status: workflow.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        triggerType: 'manual',
        triggerConfig: {},
        status: 'draft',
      });
    }
    setShowDeleteConfirm(false);
  }, [workflow, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedTriggerInfo = getTriggerTypeInfo(formData.triggerType);

  const handleTriggerTypeChange = (type: WorkflowTriggerType) => {
    setFormData({
      ...formData,
      triggerType: type,
      triggerConfig: {},
    });
  };

  const handleTriggerConfigChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      triggerConfig: { ...formData.triggerConfig, [key]: value },
    });
  };

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
          maxWidth: '600px',
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
            {workflow ? 'Edit Workflow' : 'Create Workflow'}
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
            <label style={labelStyle}>Workflow Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., New Lead Welcome Series"
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
              placeholder="What does this workflow do?"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Trigger Type */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Trigger Type *</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
              }}
            >
              {triggerTypes.map((trigger) => {
                const isSelected = formData.triggerType === trigger.type;
                return (
                  <button
                    key={trigger.type}
                    type="button"
                    onClick={() => handleTriggerTypeChange(trigger.type)}
                    style={{
                      padding: '0.75rem 0.5rem',
                      border: `2px solid ${isSelected ? '#F57C00' : 'var(--zander-border-gray)'}`,
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(245, 124, 0, 0.1)' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{trigger.icon}</div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        color: isSelected ? '#F57C00' : 'var(--zander-navy)',
                      }}
                    >
                      {trigger.label}
                    </div>
                  </button>
                );
              })}
            </div>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.8rem',
                color: 'var(--zander-gray)',
              }}
            >
              {selectedTriggerInfo.description}
            </p>
          </div>

          {/* Trigger Config Fields */}
          {selectedTriggerInfo.configFields.length > 0 && (
            <div
              style={{
                padding: '1rem',
                background: 'var(--zander-off-white)',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#F57C00',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                Trigger Configuration
              </div>
              {selectedTriggerInfo.configFields.map((field) => (
                <div key={field.key} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ ...labelStyle, fontSize: '0.8rem' }}>
                    {field.label}
                    {field.required && ' *'}
                  </label>
                  {field.type === 'select' && field.options ? (
                    <select
                      value={(formData.triggerConfig[field.key] as string) || ''}
                      onChange={(e) => handleTriggerConfigChange(field.key, e.target.value)}
                      required={field.required}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={(formData.triggerConfig[field.key] as string) || ''}
                      onChange={(e) => handleTriggerConfigChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
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
          {workflow && onDelete ? (
            showDeleteConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                  Delete this workflow?
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
              {workflow ? 'Save Changes' : 'Create Workflow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
