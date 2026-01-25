'use client';
import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CMOLayout, Button, LoadingSpinner } from '../../components';
import TemplateBuilder from '../components/TemplateBuilder';
import BlockToolbox from '../components/BlockToolbox';
import BlockPropertiesPanel from '../components/BlockPropertiesPanel';
import PreviewModal from '../components/PreviewModal';
import { EmailTemplate, EmailTemplateContent, EmailBlock } from '../types';
import { parseTemplateBody } from '../utils';

export default function TemplateBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [content, setContent] = useState<EmailTemplateContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTemplate = useCallback(async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
        setContent(parseTemplateBody(data.body));
      } else if (response.status === 404) {
        showToast('Template not found', 'error');
        router.push('/cmo/templates');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      showToast('Failed to load template', 'error');
    } finally {
      setLoading(false);
    }
  }, [templateId, router]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleContentChange = (newContent: EmailTemplateContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleBlockUpdate = (block: EmailBlock) => {
    if (!content || selectedBlockIndex === null) return;

    const newBlocks = [...content.blocks];
    newBlocks[selectedBlockIndex] = block;
    handleContentChange({ ...content, blocks: newBlocks });
  };

  const handleBlockDelete = () => {
    if (!content || selectedBlockIndex === null) return;

    const newBlocks = content.blocks.filter((_, i) => i !== selectedBlockIndex);
    handleContentChange({ ...content, blocks: newBlocks });
    setSelectedBlockIndex(null);
  };

  const handleSave = async () => {
    if (!template || !content) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: JSON.stringify(content),
        }),
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        showToast('Template saved successfully!');
      } else {
        showToast('Failed to save template', 'error');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showToast('Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportHtml = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates/${templateId}/html`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Create download
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template?.name || 'template'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('HTML exported successfully!');
      } else {
        showToast('Failed to export HTML', 'error');
      }
    } catch (error) {
      console.error('Error exporting HTML:', error);
      showToast('Failed to export HTML', 'error');
    }
  };

  const handleSendTest = async (email: string) => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates/${templateId}/preview`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        showToast(`Test email sent to ${email}`);
      } else {
        showToast('Failed to send test email', 'error');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      showToast('Failed to send test email', 'error');
    }
  };

  const handleDragStart = () => {
    // Can be used for visual feedback
  };

  if (loading) {
    return (
      <CMOLayout>
        <div style={loadingContainerStyle}>
          <LoadingSpinner />
        </div>
      </CMOLayout>
    );
  }

  if (!template || !content) {
    return (
      <CMOLayout>
        <div style={loadingContainerStyle}>
          <p>Template not found</p>
        </div>
      </CMOLayout>
    );
  }

  const selectedBlock = selectedBlockIndex !== null ? content.blocks[selectedBlockIndex] : null;

  return (
    <CMOLayout>
      {/* Toast */}
      {toast && (
        <div
          style={{
            ...toastStyle,
            backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <button style={backButtonStyle} onClick={() => router.push('/cmo/templates')}>
            ← Back
          </button>
          <div>
            <h1 style={titleStyle}>{template.name}</h1>
            <span
              style={{
                ...statusBadgeStyle,
                backgroundColor: template.status === 'active' ? '#10B98115' : '#6B728015',
                color: template.status === 'active' ? '#10B981' : '#6B7280',
              }}
            >
              {template.status}
            </span>
            {hasUnsavedChanges && (
              <span style={unsavedBadgeStyle}>Unsaved changes</span>
            )}
          </div>
        </div>
        <div style={headerActionsStyle}>
          <Button variant="ghost" onClick={() => setShowPreview(true)}>
            Preview
          </Button>
          <Button variant="secondary" onClick={handleExportHtml}>
            Export HTML
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Builder Layout */}
      <div style={builderLayoutStyle}>
        {/* Left: Toolbox */}
        <BlockToolbox onDragStart={handleDragStart} />

        {/* Center: Canvas */}
        <TemplateBuilder
          content={content}
          onChange={handleContentChange}
          selectedBlockIndex={selectedBlockIndex}
          onSelectBlock={setSelectedBlockIndex}
        />

        {/* Right: Properties Panel */}
        <BlockPropertiesPanel
          block={selectedBlock}
          onUpdate={handleBlockUpdate}
          onDelete={handleBlockDelete}
        />
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        templateContent={content}
        subject={template.subject || ''}
        onSendTest={handleSendTest}
      />
    </CMOLayout>
  );
}

const loadingContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 1.5rem',
  backgroundColor: 'white',
  borderBottom: '1px solid var(--zander-border-gray)',
};

const headerLeftStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const backButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
  cursor: 'pointer',
  padding: '0.5rem',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const statusBadgeStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: '0.7rem',
  fontWeight: '600',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  textTransform: 'uppercase',
  marginLeft: '0.5rem',
};

const unsavedBadgeStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: '0.75rem',
  color: '#F59E0B',
  marginLeft: '0.5rem',
};

const headerActionsStyle: CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
};

const builderLayoutStyle: CSSProperties = {
  display: 'flex',
  height: 'calc(100vh - 180px)',
  overflow: 'hidden',
};

const toastStyle: CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  padding: '1rem 1.5rem',
  borderRadius: '8px',
  color: 'white',
  fontWeight: '500',
  zIndex: 1200,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};
