'use client';
import { CSSProperties } from 'react';
import { EmailBlock, Padding } from '../types';
import { getBlockTypeInfo, ConfigField } from '../utils';

interface BlockPropertiesPanelProps {
  block: EmailBlock | null;
  onUpdate: (block: EmailBlock) => void;
  onDelete: () => void;
}

export default function BlockPropertiesPanel({
  block,
  onUpdate,
  onDelete,
}: BlockPropertiesPanelProps) {
  if (!block) {
    return (
      <div style={containerStyle}>
        <div style={emptyStyle}>
          <span style={{ fontSize: '2rem' }}>👆</span>
          <p style={emptyTextStyle}>Select a block to edit its properties</p>
        </div>
      </div>
    );
  }

  const blockInfo = getBlockTypeInfo(block.type);

  const handleContentChange = (key: string, value: any) => {
    onUpdate({
      ...block,
      content: { ...block.content, [key]: value },
    });
  };

  const handleSettingsChange = (key: string, value: any) => {
    onUpdate({
      ...block,
      settings: { ...block.settings, [key]: value },
    });
  };

  const handlePaddingChange = (side: keyof Padding, value: number) => {
    const currentPadding = block.settings.padding || { top: 20, right: 20, bottom: 20, left: 20 };
    onUpdate({
      ...block,
      settings: {
        ...block.settings,
        padding: { ...currentPadding, [side]: value },
      },
    });
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={iconStyle}>{blockInfo.icon}</span>
        <h3 style={titleStyle}>{blockInfo.label}</h3>
      </div>

      {/* Content Fields */}
      {blockInfo.contentFields.length > 0 && (
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>Content</h4>
          {blockInfo.contentFields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={block.content[field.key]}
              onChange={(value) => handleContentChange(field.key, value)}
            />
          ))}
        </div>
      )}

      {/* Common Settings */}
      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>Style</h4>

        <div style={fieldStyle}>
          <label style={labelStyle}>Background</label>
          <input
            type="color"
            value={block.settings.backgroundColor || '#ffffff'}
            onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
            style={colorInputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Alignment</label>
          <select
            value={block.settings.alignment || 'left'}
            onChange={(e) => handleSettingsChange('alignment', e.target.value)}
            style={selectStyle}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Padding</label>
          <div style={paddingGridStyle}>
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <div key={side} style={paddingInputContainerStyle}>
                <input
                  type="number"
                  value={block.settings.padding?.[side] || 20}
                  onChange={(e) => handlePaddingChange(side, parseInt(e.target.value) || 0)}
                  style={paddingInputStyle}
                />
                <span style={paddingLabelStyle}>{side.charAt(0).toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Block-specific Settings */}
      {blockInfo.settingsFields.length > 0 && (
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>Settings</h4>
          {blockInfo.settingsFields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={block.settings[field.key]}
              onChange={(value) => handleSettingsChange(field.key, value)}
            />
          ))}
        </div>
      )}

      {/* Delete Button */}
      <div style={deleteContainerStyle}>
        <button style={deleteButtonStyle} onClick={onDelete}>
          Delete Block
        </button>
      </div>
    </div>
  );
}

interface FieldInputProps {
  field: ConfigField;
  value: any;
  onChange: (value: any) => void;
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            style={textareaStyle}
            rows={4}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value ?? field.defaultValue ?? ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
            style={inputStyle}
          />
        );
      case 'color':
        return (
          <input
            type="color"
            value={value || field.defaultValue || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            style={colorInputStyle}
          />
        );
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={selectStyle}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value ?? field.defaultValue ?? false}
            onChange={(e) => onChange(e.target.checked)}
            style={checkboxStyle}
          />
        );
      case 'url':
      case 'text':
      default:
        return (
          <input
            type={field.type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            style={inputStyle}
          />
        );
    }
  };

  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{field.label}</label>
      {renderInput()}
    </div>
  );
}

const containerStyle: CSSProperties = {
  width: '280px',
  backgroundColor: '#1C1C26',
  borderLeft: '1px solid #2A2A38',
  padding: '1rem',
  overflowY: 'auto',
  height: '100%',
};

const emptyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  textAlign: 'center',
};

const emptyTextStyle: CSSProperties = {
  margin: '1rem 0 0 0',
  fontSize: '0.875rem',
  color: '#8888A0',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid #2A2A38',
};

const iconStyle: CSSProperties = {
  fontSize: '1.25rem',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '600',
  color: '#F0F0F5',
};

const sectionStyle: CSSProperties = {
  marginBottom: '1.5rem',
};

const sectionTitleStyle: CSSProperties = {
  margin: '0 0 0.75rem 0',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: '#8888A0',
  textTransform: 'uppercase',
};

const fieldStyle: CSSProperties = {
  marginBottom: '0.75rem',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: '500',
  color: '#F0F0F5',
  marginBottom: '0.25rem',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #2A2A38',
  fontSize: '0.875rem',
  background: '#13131A',
  color: '#F0F0F5',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #2A2A38',
  fontSize: '0.875rem',
  resize: 'vertical',
  fontFamily: 'inherit',
  background: '#13131A',
  color: '#F0F0F5',
};

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #2A2A38',
  fontSize: '0.875rem',
  backgroundColor: '#13131A',
  color: '#F0F0F5',
};

const colorInputStyle: CSSProperties = {
  width: '100%',
  height: '32px',
  padding: '2px',
  borderRadius: '4px',
  border: '1px solid #2A2A38',
  cursor: 'pointer',
};

const checkboxStyle: CSSProperties = {
  width: '18px',
  height: '18px',
  cursor: 'pointer',
};

const paddingGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.5rem',
};

const paddingInputContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const paddingInputStyle: CSSProperties = {
  width: '50px',
  padding: '0.25rem',
  borderRadius: '4px',
  border: '1px solid #2A2A38',
  fontSize: '0.8rem',
  textAlign: 'center',
  background: '#13131A',
  color: '#F0F0F5',
};

const paddingLabelStyle: CSSProperties = {
  fontSize: '0.7rem',
  color: '#8888A0',
};

const deleteContainerStyle: CSSProperties = {
  marginTop: 'auto',
  paddingTop: '1rem',
  borderTop: '1px solid #2A2A38',
};

const deleteButtonStyle: CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  backgroundColor: 'transparent',
  border: '1px solid #00CCEE',
  borderRadius: '6px',
  color: '#00CCEE',
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
};
