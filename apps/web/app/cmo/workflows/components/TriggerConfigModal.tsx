'use client';
import { useState, useEffect } from 'react';
import { WorkflowTriggerType } from '../types';
import { getTriggerTypes, getTriggerTypeInfo } from '../utils';

interface TriggerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, unknown>;
  onSave: (triggerType: WorkflowTriggerType, triggerConfig: Record<string, unknown>) => void;
}

export default function TriggerConfigModal({
  isOpen,
  onClose,
  triggerType,
  triggerConfig,
  onSave,
}: TriggerConfigModalProps) {
  const [selectedType, setSelectedType] = useState<WorkflowTriggerType>(triggerType);
  const [config, setConfig] = useState<Record<string, unknown>>(triggerConfig);

  const triggerTypes = getTriggerTypes();

  useEffect(() => {
    setSelectedType(triggerType);
    setConfig(triggerConfig);
  }, [triggerType, triggerConfig, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedTriggerInfo = getTriggerTypeInfo(selectedType);

  const handleTypeChange = (type: WorkflowTriggerType) => {
    setSelectedType(type);
    setConfig({});
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedType, config);
    onClose();
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
          maxWidth: '550px',
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
            Configure Trigger
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
          {/* Trigger Type */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Trigger Type</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
              }}
            >
              {triggerTypes.map((trigger) => {
                const isSelected = selectedType === trigger.type;
                return (
                  <button
                    key={trigger.type}
                    type="button"
                    onClick={() => handleTypeChange(trigger.type)}
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
                        fontSize: '0.65rem',
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
                Trigger Settings
              </div>
              {selectedTriggerInfo.configFields.map((field) => (
                <div key={field.key} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ ...labelStyle, fontSize: '0.8rem' }}>
                    {field.label}
                    {field.required && ' *'}
                  </label>
                  {field.type === 'select' && field.options ? (
                    <select
                      value={(config[field.key] as string) || ''}
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
                      value={(config[field.key] as string) || ''}
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
            <label style={labelStyle}>Trigger Preview</label>
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(245, 124, 0, 0.1)',
                borderLeft: '4px solid #F57C00',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{selectedTriggerInfo.icon}</span>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>
                  Trigger
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>
                  {selectedTriggerInfo.label}
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
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
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
            Save Trigger
          </button>
        </div>
      </div>
    </div>
  );
}
