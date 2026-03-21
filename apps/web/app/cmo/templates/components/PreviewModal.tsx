'use client';
import { useState, CSSProperties } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { EmailTemplateContent } from '../types';
import BlockRenderer from './BlockRenderer';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateContent: EmailTemplateContent;
  subject: string;
  onSendTest?: (email: string) => void;
}

export default function PreviewModal({
  isOpen,
  onClose,
  templateContent,
  subject,
  onSendTest,
}: PreviewModalProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [testEmail, setTestEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleSendTest = () => {
    if (testEmail && onSendTest) {
      onSendTest(testEmail);
      setTestEmail('');
      setShowEmailInput(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview Email"
      subtitle={subject || 'No subject'}
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {showEmailInput ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address"
                style={emailInputStyle}
              />
              <Button variant="primary" onClick={handleSendTest} disabled={!testEmail}>
                Send
              </Button>
              <Button variant="ghost" onClick={() => setShowEmailInput(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              {onSendTest && (
                <Button variant="secondary" onClick={() => setShowEmailInput(true)}>
                  Send Test Email
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </div>
      }
    >
      <div style={controlsStyle}>
        <div style={viewToggleStyle}>
          <button
            style={{
              ...toggleButtonStyle,
              ...(viewMode === 'desktop' ? activeToggleStyle : {}),
            }}
            onClick={() => setViewMode('desktop')}
          >
            Desktop
          </button>
          <button
            style={{
              ...toggleButtonStyle,
              ...(viewMode === 'mobile' ? activeToggleStyle : {}),
            }}
            onClick={() => setViewMode('mobile')}
          >
            Mobile
          </button>
        </div>
      </div>

      <div style={previewContainerStyle}>
        <div
          style={{
            ...previewFrameStyle,
            width: viewMode === 'desktop' ? `${templateContent.settings.contentWidth}px` : '375px',
            backgroundColor: templateContent.settings.backgroundColor,
          }}
        >
          {templateContent.blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              isSelected={false}
              onSelect={() => {}}
            />
          ))}

          {templateContent.blocks.length === 0 && (
            <div style={emptyPreviewStyle}>
              <span style={{ fontSize: '2rem' }}>📧</span>
              <p>No content to preview</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

const controlsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '1rem',
};

const viewToggleStyle: CSSProperties = {
  display: 'flex',
  backgroundColor: '#1C1C26',
  borderRadius: '8px',
  padding: '4px',
};

const toggleButtonStyle: CSSProperties = {
  padding: '0.5rem 1.5rem',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: 'transparent',
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  color: '#8888A0',
  transition: 'all 0.15s ease',
};

const activeToggleStyle: CSSProperties = {
  backgroundColor: '#13131A',
  color: '#F0F0F5',
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
};

const previewContainerStyle: CSSProperties = {
  backgroundColor: '#13131A',
  padding: '2rem',
  borderRadius: '8px',
  maxHeight: '60vh',
  overflowY: 'auto',
  display: 'flex',
  justifyContent: 'center',
};

const previewFrameStyle: CSSProperties = {
  maxWidth: '100%',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  borderRadius: '4px',
  overflow: 'hidden',
  transition: 'width 0.3s ease',
};

const emptyPreviewStyle: CSSProperties = {
  padding: '3rem',
  textAlign: 'center',
  color: '#8888A0',
};

const emailInputStyle: CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: '1px solid #2A2A38',
  fontSize: '0.875rem',
  width: '250px',
  background: '#1C1C26',
  color: '#F0F0F5',
};
