'use client';
import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://api.zanderos.com';

interface FormField {
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
}

interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  status: 'draft' | 'completed';
  version: number;
  updatedAt: string;
  form: {
    id: string;
    name: string;
    description?: string;
    fields: FormField[];
  };
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface FormCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formName: string;
  calendarEventId: string;
  contactId?: string;
  onSubmissionUpdate?: (submission: FormSubmission) => void;
}

export default function FormCompletionModal({
  isOpen,
  onClose,
  formId,
  formName,
  calendarEventId,
  contactId,
  onSubmissionUpdate
}: FormCompletionModalProps) {
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('zander_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch or create submission
  useEffect(() => {
    if (isOpen && formId && calendarEventId) {
      fetchOrCreateSubmission();
    }
  }, [isOpen, formId, calendarEventId]);

  const fetchOrCreateSubmission = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forms/${formId}/event-submission`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ calendarEventId, contactId })
      });
      if (res.ok) {
        const data = await res.json();
        setSubmission(data);
        // Pre-populate with existing data or contact data
        const initialData = { ...data.data };
        // Progressive fields: pre-populate from contact if available
        if (data.contact && Object.keys(initialData).length === 0) {
          if (data.contact.firstName) initialData['Full Name'] = `${data.contact.firstName} ${data.contact.lastName || ''}`.trim();
          if (data.contact.email) initialData['Email Address'] = data.contact.email;
          if (data.contact.phone) initialData['Phone Number'] = data.contact.phone;
        }
        setFormData(initialData);
        setLastSaved(new Date(data.updatedAt));
      }
    } catch (err) {
      console.error('Error fetching submission:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save with debounce
  const debouncedSave = useCallback(
    debounce(async (data: Record<string, any>, submissionId: string) => {
      if (!submissionId) return;
      setSaveStatus('saving');
      try {
        const res = await fetch(`${API_URL}/forms/submissions/${submissionId}/draft`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ data })
        });
        if (res.ok) {
          const updated = await res.json();
          setSubmission(updated);
          setLastSaved(new Date());
          setSaveStatus('saved');
          setHasUnsavedChanges(false);
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('idle');
      }
    }, 2000),
    []
  );

  // Handle field change
  const handleFieldChange = (label: string, value: any) => {
    const newData = { ...formData, [label]: value };
    setFormData(newData);
    setHasUnsavedChanges(true);
    if (submission) {
      debouncedSave(newData, submission.id);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!submission) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/forms/submissions/${submission.id}/submit`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ data: formData })
      });
      if (res.ok) {
        const updated = await res.json();
        setSubmission(updated);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        onSubmissionUpdate?.(updated);
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Expand to full page
  const handleExpand = () => {
    window.open(`/forms/${formId}/submit?eventId=${calendarEventId}`, '_blank');
  };

  // Render field based on type
  const renderField = (field: FormField) => {
    const value = formData[field.label] || '';
    const baseInputStyle = {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid var(--zander-border-gray)',
      borderRadius: '6px',
      fontSize: '1rem',
      transition: 'border-color 0.2s ease'
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            style={{ ...baseInputStyle, minHeight: '100px', resize: 'vertical' }}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            style={baseInputStyle}
          >
            <option value="">Select {field.label}...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'rating':
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleFieldChange(field.label, rating)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: value === rating ? '2px solid var(--zander-red)' : '2px solid var(--zander-border-gray)',
                  background: value === rating ? 'var(--zander-red)' : 'white',
                  color: value === rating ? 'white' : 'var(--zander-navy)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {rating}
              </button>
            ))}
          </div>
        );
      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => handleFieldChange(field.label, e.target.files?.[0]?.name || '')}
            style={baseInputStyle}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            style={baseInputStyle}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            style={baseInputStyle}
            placeholder="email@example.com"
          />
        );
      case 'tel':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            style={baseInputStyle}
            placeholder="(555) 555-5555"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            style={baseInputStyle}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="print-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--zander-red) 0%, #a00a28 100%)',
            color: 'white',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem' }}>📋 {formName}</h2>
            {submission && (
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {submission.status === 'completed' ? (
                  <span>✅ Completed • v{submission.version}</span>
                ) : (
                  <span>📝 Draft</span>
                )}
                {lastSaved && (
                  <span> • Last saved {formatTimeAgo(lastSaved)}</span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleExpand}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
              title="Expand to full page"
            >
              ↗️
            </button>
            <button
              onClick={handlePrint}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
              title="Print form"
            >
              🖨️
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Save Status Bar */}
        {saveStatus !== 'idle' && (
          <div
            style={{
              padding: '0.5rem 1.5rem',
              background: saveStatus === 'saving' ? '#fff3cd' : '#d4edda',
              color: saveStatus === 'saving' ? '#856404' : '#155724',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {saveStatus === 'saving' ? (
              <>⏳ Saving...</>
            ) : (
              <>✓ All changes saved</>
            )}
          </div>
        )}

        {/* Form Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>
              Loading form...
            </div>
          ) : submission?.form?.fields ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(submission.form.fields as FormField[]).map((field, index) => (
                <div key={index}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                      color: 'var(--zander-navy)'
                    }}
                  >
                    {field.label}
                    {field.required && <span style={{ color: 'var(--zander-red)', marginLeft: '4px' }}>*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>
              No form fields defined
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--zander-border-gray)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--zander-off-white)'
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--zander-gray)' }}>
            {hasUnsavedChanges && <span style={{ color: '#856404' }}>● Unsaved changes</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid var(--zander-border-gray)',
                background: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                color: 'var(--zander-navy)'
              }}
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'var(--zander-red)',
                color: 'white',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Submitting...' : submission?.status === 'completed' ? 'Update & Save' : 'Submit Form'}
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

// Utility: Debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Utility: Format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
