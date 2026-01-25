'use client';
import { useState, useEffect, CSSProperties } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; subject: string; category: string }) => void;
  title: string;
  initialData?: {
    name: string;
    subject: string;
    category: string;
  };
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'events', label: 'Events' },
  { value: 'transactional', label: 'Transactional' },
];

export default function TemplateModal({
  isOpen,
  onClose,
  onSave,
  title,
  initialData,
}: TemplateModalProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSubject(initialData.subject);
      setCategory(initialData.category);
    } else {
      setName('');
      setSubject('');
      setCategory('general');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), subject: subject.trim(), category });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Enter template details"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} disabled={!name.trim()}>
            {initialData ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Template Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Welcome Email"
            style={inputStyle}
            autoFocus
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Welcome to {{company_name}}!"
            style={inputStyle}
          />
          <span style={hintStyle}>Use {'{{variable}}'} for dynamic content</span>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={selectStyle}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}

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

const selectStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--zander-border-gray)',
  fontSize: '1rem',
  color: 'var(--zander-dark-gray)',
  background: 'white',
  cursor: 'pointer',
};

const hintStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
};
