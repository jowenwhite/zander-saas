'use client';
import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { CMOLayout, Button, EmptyState, LoadingSpinner } from '../components';
import TemplateListCard from './components/TemplateListCard';
import TemplateModal from './components/TemplateModal';
import PrebuiltTemplateModal from './components/PrebuiltTemplateModal';
import { EmailTemplate, PrebuiltTemplate } from './types';

export default function CMOTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [prebuiltTemplates, setPrebuiltTemplates] = useState<PrebuiltTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPrebuiltModal, setShowPrebuiltModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTemplates = useCallback(async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  const fetchPrebuiltTemplates = useCallback(async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates/prebuilt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPrebuiltTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching prebuilt templates:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchTemplates(), fetchPrebuiltTemplates()]).finally(() => {
      setLoading(false);
    });
  }, [fetchTemplates, fetchPrebuiltTemplates]);

  const handleCreateTemplate = async (data: { name: string; subject: string; category: string }) => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const template = await response.json();
        showToast('Template created successfully!');
        setShowCreateModal(false);
        router.push(`/cmo/templates/${template.id}`);
      } else {
        showToast('Failed to create template', 'error');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showToast('Failed to create template', 'error');
    }
  };

  const handleUpdateTemplate = async (data: { name: string; subject: string; category: string }) => {
    if (!editingTemplate) return;

    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showToast('Template updated successfully!');
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        showToast('Failed to update template', 'error');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      showToast('Failed to update template', 'error');
    }
  };

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;

    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates/${template.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast('Template deleted successfully!');
        fetchTemplates();
      } else {
        showToast('Failed to delete template', 'error');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast('Failed to delete template', 'error');
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast('Template duplicated successfully!');
        fetchTemplates();
      } else {
        showToast('Failed to duplicate template', 'error');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      showToast('Failed to duplicate template', 'error');
    }
  };

  const handleUsePrebuilt = async (prebuilt: PrebuiltTemplate, customName?: string) => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/templates/from-prebuilt/${prebuilt.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: customName }),
      });

      if (response.ok) {
        const template = await response.json();
        showToast('Template created from starter!');
        setShowPrebuiltModal(false);
        router.push(`/cmo/templates/${template.id}`);
      } else {
        showToast('Failed to create template', 'error');
      }
    } catch (error) {
      console.error('Error creating from prebuilt:', error);
      showToast('Failed to create template', 'error');
    }
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
        <div>
          <h1 style={titleStyle}>Email Templates</h1>
          <p style={subtitleStyle}>Create and manage your email templates</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setShowPrebuiltModal(true)}>
            Start from Template
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + New Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div style={emptyContainerStyle}>
          <EmptyState
            icon="📧"
            title="No templates yet"
            description="Create your first email template or start from a pre-built design"
            action={
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="secondary" onClick={() => setShowPrebuiltModal(true)}>
                  Browse Templates
                </Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  + New Template
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <div style={gridStyle}>
          {templates.map((template) => (
            <TemplateListCard
              key={template.id}
              template={template}
              onClick={() => router.push(`/cmo/templates/${template.id}`)}
              onEdit={() => setEditingTemplate(template)}
              onDuplicate={() => handleDuplicateTemplate(template)}
              onDelete={() => handleDeleteTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <TemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTemplate}
        title="Create Template"
      />

      {/* Edit Modal */}
      <TemplateModal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onSave={handleUpdateTemplate}
        title="Edit Template"
        initialData={
          editingTemplate
            ? {
                name: editingTemplate.name,
                subject: editingTemplate.subject || '',
                category: editingTemplate.category || 'general',
              }
            : undefined
        }
      />

      {/* Prebuilt Templates Modal */}
      <PrebuiltTemplateModal
        isOpen={showPrebuiltModal}
        onClose={() => setShowPrebuiltModal(false)}
        templates={prebuiltTemplates}
        onSelect={handleUsePrebuilt}
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
  marginBottom: '2rem',
};

const titleStyle: CSSProperties = {
  fontSize: '2rem',
  fontWeight: '700',
  color: 'var(--zander-navy)',
  margin: 0,
  marginBottom: '0.25rem',
};

const subtitleStyle: CSSProperties = {
  color: 'var(--zander-gray)',
  margin: 0,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.5rem',
};

const emptyContainerStyle: CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid var(--zander-border-gray)',
  padding: '3rem',
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
