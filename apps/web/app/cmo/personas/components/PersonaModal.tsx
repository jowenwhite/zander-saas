'use client';
import { useState, useEffect, CSSProperties } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

interface PersonaFormData {
  name: string;
  tagline: string;
  painPoints: string[];
  goals: string[];
  preferredChannels: string[];
}

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PersonaFormData) => void;
  initialData?: PersonaFormData;
}

const CHANNEL_OPTIONS = [
  'Email',
  'SMS',
  'Social Media',
  'Direct Mail',
  'Phone',
  'In-Person',
  'Webinars',
  'Content Marketing',
];

export default function PersonaModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PersonaModalProps) {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [painPointsText, setPainPointsText] = useState('');
  const [goalsText, setGoalsText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTagline(initialData.tagline || '');
      setPainPointsText(initialData.painPoints?.join('\n') || '');
      setGoalsText(initialData.goals?.join('\n') || '');
      setSelectedChannels(initialData.preferredChannels || []);
    } else {
      setName('');
      setTagline('');
      setPainPointsText('');
      setGoalsText('');
      setSelectedChannels([]);
    }
  }, [initialData, isOpen]);

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const data: PersonaFormData = {
        name: name.trim(),
        tagline: tagline.trim(),
        painPoints: painPointsText
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean),
        goals: goalsText
          .split('\n')
          .map((g) => g.trim())
          .filter(Boolean),
        preferredChannels: selectedChannels,
      };
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Persona' : 'Create Persona'}
      subtitle="Define your ideal customer profile"
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={!name.trim() || saving}
          >
            {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create Persona'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Persona Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Budget-Conscious Homeowner"
            style={inputStyle}
            autoFocus
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g., First-time homebuyer looking for affordable upgrades"
            style={inputStyle}
          />
          <span style={hintStyle}>A brief description of this persona</span>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Pain Points</label>
          <textarea
            value={painPointsText}
            onChange={(e) => setPainPointsText(e.target.value)}
            placeholder="Enter each pain point on a new line:&#10;- Limited budget&#10;- Overwhelmed by choices&#10;- Worried about quality"
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          />
          <span style={hintStyle}>One pain point per line</span>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Goals</label>
          <textarea
            value={goalsText}
            onChange={(e) => setGoalsText(e.target.value)}
            placeholder="Enter each goal on a new line:&#10;- Find affordable options&#10;- Understand the process&#10;- Get expert guidance"
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          />
          <span style={hintStyle}>One goal per line</span>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Preferred Channels</label>
          <div style={channelsContainerStyle}>
            {CHANNEL_OPTIONS.map((channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => toggleChannel(channel)}
                style={{
                  ...channelButtonStyle,
                  background: selectedChannels.includes(channel) ? '#F57C00' : '#2A2A38',
                  color: selectedChannels.includes(channel) ? 'white' : '#8888A0',
                  borderColor: selectedChannels.includes(channel) ? '#F57C00' : '#2A2A38',
                }}
              >
                {channel}
              </button>
            ))}
          </div>
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
  color: '#F0F0F5',
};

const inputStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid #2A2A38',
  fontSize: '1rem',
  color: '#F0F0F5',
  background: '#1C1C26',
};

const hintStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: '#8888A0',
};

const channelsContainerStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const channelButtonStyle: CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid',
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'all 0.15s',
};
