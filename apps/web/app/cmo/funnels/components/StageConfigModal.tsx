'use client';
import { useState, useEffect } from 'react';
import { FunnelStage, FunnelStageType, StageFormData } from '../types';
import { getStageTypeInfo, getStageColor } from '../utils';
import StageTypeSelector from './StageTypeSelector';

interface StageConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: FunnelStage | null;
  onSave: (data: StageFormData) => void;
  onDelete?: () => void;
}

export default function StageConfigModal({
  isOpen,
  onClose,
  stage,
  onSave,
  onDelete,
}: StageConfigModalProps) {
  const [formData, setFormData] = useState<StageFormData>({
    name: '',
    stageType: 'landing_page',
    config: {},
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (stage) {
      setFormData({
        name: stage.name,
        stageType: stage.stageType,
        config: stage.config || {},
      });
    } else {
      setFormData({
        name: '',
        stageType: 'landing_page',
        config: {},
      });
    }
    setShowDeleteConfirm(false);
  }, [stage, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const stageTypeInfo = getStageTypeInfo(formData.stageType);

  const handleTypeChange = (type: FunnelStageType) => {
    const typeInfo = getStageTypeInfo(type);
    setFormData({
      ...formData,
      stageType: type,
      name: formData.name || typeInfo.label,
      config: {},
    });
  };

  const handleConfigChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      config: { ...formData.config, [key]: value },
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
            {stage ? 'Edit Stage' : 'Add Stage'}
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
        <form
          onSubmit={handleSubmit}
          style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}
        >
          {/* Stage Type Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Stage Type</label>
            <StageTypeSelector
              selected={formData.stageType}
              onChange={handleTypeChange}
            />
          </div>

          {/* Stage Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Stage Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={stageTypeInfo.label}
              required
              style={inputStyle}
            />
          </div>

          {/* Dynamic Config Fields */}
          {stageTypeInfo.configFields.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: getStageColor(formData.stageType),
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                {stageTypeInfo.label} Configuration
              </div>
              {stageTypeInfo.configFields.map((field) => (
                <div key={field.key} style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>
                    {field.label}
                    {field.required && ' *'}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={(formData.config[field.key] as string) || ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  ) : field.type === 'select' && field.options ? (
                    <select
                      value={(formData.config[field.key] as string) || ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
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
                      value={(formData.config[field.key] as string) || ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Preview */}
          <div style={{ marginTop: '1.5rem' }}>
            <label style={labelStyle}>Preview</label>
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: `${getStageColor(formData.stageType)}10`,
                borderLeft: `4px solid ${getStageColor(formData.stageType)}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{stageTypeInfo.icon}</span>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>
                  {formData.name || stageTypeInfo.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>
                  {stageTypeInfo.label}
                </div>
              </div>
            </div>
          </div>
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
          {stage && onDelete ? (
            showDeleteConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                  Delete this stage?
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
                Delete Stage
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
              {stage ? 'Save Changes' : 'Add Stage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
