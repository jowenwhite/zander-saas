'use client';
import { useState, CSSProperties } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { PrebuiltTemplate } from '../types';

interface PrebuiltTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: PrebuiltTemplate[];
  onSelect: (template: PrebuiltTemplate, customName?: string) => void;
}

export default function PrebuiltTemplateModal({
  isOpen,
  onClose,
  templates,
  onSelect,
}: PrebuiltTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PrebuiltTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [step, setStep] = useState<'browse' | 'customize'>('browse');

  const handleClose = () => {
    setSelectedTemplate(null);
    setCustomName('');
    setStep('browse');
    onClose();
  };

  const handleSelectTemplate = (template: PrebuiltTemplate) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
    setStep('customize');
  };

  const handleBack = () => {
    setStep('browse');
    setSelectedTemplate(null);
    setCustomName('');
  };

  const handleCreate = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate, customName.trim() || undefined);
      handleClose();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'onboarding':
        return '#10B981';
      case 'marketing':
        return '#3B82F6';
      case 'sales':
        return '#F59E0B';
      case 'events':
        return '#8B5CF6';
      case 'transactional':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'onboarding':
        return '👋';
      case 'marketing':
        return '📰';
      case 'sales':
        return '💰';
      case 'events':
        return '🎉';
      case 'transactional':
        return '📬';
      default:
        return '📧';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'browse' ? 'Start from Template' : 'Customize Template'}
      subtitle={
        step === 'browse'
          ? 'Choose a pre-built template to get started quickly'
          : `Based on: ${selectedTemplate?.name}`
      }
      size="lg"
      footer={
        step === 'customize' ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" onClick={handleBack}>
              Back
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Create Template
            </Button>
          </div>
        ) : undefined
      }
    >
      {step === 'browse' ? (
        <div style={gridStyle}>
          {templates.map((template) => (
            <button
              key={template.id}
              style={templateCardStyle}
              onClick={() => handleSelectTemplate(template)}
            >
              <div style={thumbnailStyle}>
                <span style={{ fontSize: '3rem' }}>{getTemplateIcon(template.category)}</span>
              </div>
              <div style={cardContentStyle}>
                <div style={cardHeaderStyle}>
                  <h3 style={templateNameStyle}>{template.name}</h3>
                  <span
                    style={{
                      ...categoryBadgeStyle,
                      backgroundColor: `${getCategoryColor(template.category)}15`,
                      color: getCategoryColor(template.category),
                    }}
                  >
                    {template.category}
                  </span>
                </div>
                <p style={descriptionStyle}>{template.description}</p>
                <p style={subjectStyle}>Subject: {template.subject}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={customizeStyle}>
          <div style={previewContainerStyle}>
            <div style={previewLabelStyle}>Preview</div>
            <div style={previewBoxStyle}>
              <span style={{ fontSize: '4rem' }}>
                {selectedTemplate && getTemplateIcon(selectedTemplate.category)}
              </span>
              <p style={previewTextStyle}>{selectedTemplate?.description}</p>
              <p style={blockCountStyle}>
                {selectedTemplate?.body.blocks.length} blocks
              </p>
            </div>
          </div>

          <div style={formStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Template Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter a name for your template"
                style={inputStyle}
                autoFocus
              />
              <span style={hintStyle}>
                You can rename this later
              </span>
            </div>

            <div style={infoBoxStyle}>
              <h4 style={infoTitleStyle}>What's included:</h4>
              <ul style={infoListStyle}>
                <li>Pre-designed layout with {selectedTemplate?.body.blocks.length} content blocks</li>
                <li>Subject line: "{selectedTemplate?.subject}"</li>
                <li>Fully customizable after creation</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1rem',
  maxHeight: '60vh',
  overflowY: 'auto',
  padding: '0.25rem',
};

const templateCardStyle: CSSProperties = {
  background: 'white',
  border: '1px solid var(--zander-border-gray)',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s ease',
  width: '100%',
};

const thumbnailStyle: CSSProperties = {
  height: '120px',
  backgroundColor: 'var(--zander-off-white)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottom: '1px solid var(--zander-border-gray)',
};

const cardContentStyle: CSSProperties = {
  padding: '1rem',
};

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '0.5rem',
};

const templateNameStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const categoryBadgeStyle: CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '600',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  textTransform: 'uppercase',
};

const descriptionStyle: CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
  lineHeight: '1.4',
};

const subjectStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.75rem',
  color: 'var(--zander-dark-gray)',
  fontStyle: 'italic',
};

const customizeStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2rem',
};

const previewContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const previewLabelStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const previewBoxStyle: CSSProperties = {
  backgroundColor: 'var(--zander-off-white)',
  borderRadius: '8px',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  border: '1px solid var(--zander-border-gray)',
};

const previewTextStyle: CSSProperties = {
  margin: '1rem 0 0.5rem 0',
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
  textAlign: 'center',
};

const blockCountStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
  fontWeight: '500',
};

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
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

const inputStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '1rem',
  color: 'var(--zander-dark-gray)',
};

const hintStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
};

const infoBoxStyle: CSSProperties = {
  backgroundColor: 'var(--zander-off-white)',
  borderRadius: '8px',
  padding: '1rem',
  border: '1px solid var(--zander-border-gray)',
};

const infoTitleStyle: CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const infoListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: '1.25rem',
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
  lineHeight: '1.6',
};
