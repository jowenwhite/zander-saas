'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import NavBar from '../../../components/NavBar';
import Sidebar from '../../../components/Sidebar';
import AuthGuard from '../../../components/AuthGuard';

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

export default function FormSubmitPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = params.formId as string;
  const eventId = searchParams.get('eventId');

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
    if (formId && eventId) {
      fetchOrCreateSubmission();
    }
  }, [formId, eventId]);

  const fetchOrCreateSubmission = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forms/${formId}/event-submission`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ calendarEventId: eventId })
      });
      if (res.ok) {
        const data = await res.json();
        setSubmission(data);
        const initialData = { ...data.data };
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

  const handleFieldChange = (label: string, value: any) => {
    const newData = { ...formData, [label]: value };
    setFormData(newData);
    setHasUnsavedChanges(true);
    if (submission) {
      debouncedSave(newData, submission.id);
    }
  };

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
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderField = (field: FormField) => {
    const value = formData[field.label] || '';
    const baseInputStyle: React.CSSProperties = {
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
            style={{ ...baseInputStyle, minHeight: '120px', resize: 'vertical' }}
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
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleFieldChange(field.label, rating)}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: value === rating ? '3px solid var(--zander-red)' : '2px solid var(--zander-border-gray)',
                  background: value === rating ? 'var(--zander-red)' : 'white',
                  color: value === rating ? 'white' : 'var(--zander-navy)',
                  fontSize: '1.25rem',
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

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zander-light-gray)' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '280px' }}>
          <NavBar />
          <main className="print-area" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--zander-gray)' }}>
                Loading form...
              </div>
            ) : submission?.form ? (
              <>
                {/* Header */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, var(--zander-red) 0%, #a00a28 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '12px 12px 0 0',
                    marginBottom: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem' }}>📋 {submission.form.name}</h1>
                      {submission.form.description && (
                        <p style={{ margin: 0, opacity: 0.9 }}>{submission.form.description}</p>
                      )}
                      <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', opacity: 0.9 }}>
                        {submission.status === 'completed' ? (
                          <span>✅ Completed • Version {submission.version}</span>
                        ) : (
                          <span>📝 Draft</span>
                        )}
                        {lastSaved && (
                          <span> • Last saved {formatTimeAgo(lastSaved)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handlePrint}
                      className="no-print"
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>

                {/* Save Status Bar */}
                {saveStatus !== 'idle' && (
                  <div
                    className="no-print"
                    style={{
                      padding: '0.75rem 2rem',
                      background: saveStatus === 'saving' ? '#fff3cd' : '#d4edda',
                      color: saveStatus === 'saving' ? '#856404' : '#155724',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {saveStatus === 'saving' ? (
                      <>⏳ Saving your changes...</>
                    ) : (
                      <>✓ All changes saved</>
                    )}
                  </div>
                )}

                {/* Form Content */}
                <div
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '0 0 12px 12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {submission.contact && (
                    <div
                      style={{
                        marginBottom: '2rem',
                        padding: '1rem',
                        background: 'var(--zander-off-white)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>👤</span>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>
                          {submission.contact.firstName} {submission.contact.lastName}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--zander-gray)' }}>
                          {submission.contact.email}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {(submission.form.fields as FormField[]).map((field, index) => (
                      <div key={index}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.75rem',
                            fontWeight: '600',
                            color: 'var(--zander-navy)',
                            fontSize: '1.1rem'
                          }}
                        >
                          {field.label}
                          {field.required && <span style={{ color: 'var(--zander-red)', marginLeft: '4px' }}>*</span>}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="no-print"
                    style={{
                      marginTop: '2rem',
                      paddingTop: '2rem',
                      borderTop: '1px solid var(--zander-border-gray)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.9rem', color: 'var(--zander-gray)' }}>
                      {hasUnsavedChanges && <span style={{ color: '#856404' }}>● Unsaved changes</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={() => window.close()}
                        style={{
                          padding: '0.875rem 2rem',
                          border: '2px solid var(--zander-border-gray)',
                          background: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          color: 'var(--zander-navy)',
                          fontSize: '1rem'
                        }}
                      >
                        Close
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{
                          padding: '0.875rem 2rem',
                          border: 'none',
                          background: 'var(--zander-red)',
                          color: 'white',
                          borderRadius: '6px',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '1rem',
                          opacity: saving ? 0.7 : 1
                        }}
                      >
                        {saving ? 'Submitting...' : submission.status === 'completed' ? 'Update & Save' : 'Submit Form'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--zander-gray)' }}>
                Form not found or missing event ID
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-area {
            padding: 0 !important;
            max-width: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </AuthGuard>
  );
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
