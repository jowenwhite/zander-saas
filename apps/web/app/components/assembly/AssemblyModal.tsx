'use client';

import { useState, useEffect } from 'react';
import { Building2, Play, Plus, FileText, Clock, CheckCircle, AlertCircle, Loader2, X, RefreshCw } from 'lucide-react';

// Types
interface AssemblySection {
  id: string;
  executive: string;
  title: string;
  prompt: string;
  content: string | null;
  status: 'PENDING' | 'GENERATING' | 'COMPLETE' | 'FAILED';
  order: number;
  generatedAt: string | null;
}

interface Assembly {
  id: string;
  name: string;
  type: string;
  cadence: string;
  status: 'DRAFT' | 'RUNNING' | 'COMPLETE' | 'ARCHIVED';
  scheduledFor: string | null;
  completedAt: string | null;
  sections: AssemblySection[];
  createdAt: string;
}

// Executive colors
const EXECUTIVE_COLORS: Record<string, string> = {
  jordan: '#00CCEE',
  don: '#F57C00',
  pam: '#C2185B',
  ben: '#2E7D32',
  miranda: '#5E35B1',
  ted: '#0288D1',
  jarvis: '#455A64',
};

const EXECUTIVE_NAMES: Record<string, string> = {
  jordan: 'Jordan (CRO)',
  don: 'Don (CMO)',
  pam: 'Pam (EA)',
  ben: 'Ben (CFO)',
  miranda: 'Miranda (COO)',
  ted: 'Ted (CPO)',
  jarvis: 'Jarvis (CIO)',
};

const ASSEMBLY_TYPE_LABELS: Record<string, string> = {
  WEEKLY_ALL_HANDS: 'Weekly All-Hands',
  MONTHLY_BOARD_REPORT: 'Monthly Board Report',
  QUARTERLY_REVIEW: 'Quarterly Review',
  PROJECT_KICKOFF: 'Project Kickoff',
  ANNUAL_STRATEGIC_PLAN: 'Annual Strategic Plan',
};

interface AssemblyModalProps {
  isOpen: boolean;
  onClose: () => void;
  authToken: string;
  tenantId: string;
}

export default function AssemblyModal({ isOpen, onClose, authToken, tenantId }: AssemblyModalProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'view'>('list');
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssembly, setSelectedAssembly] = useState<Assembly | null>(null);
  const [runningAssemblyId, setRunningAssemblyId] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'WEEKLY_ALL_HANDS' as string,
    cadence: 'ONCE' as string,
  });

  // Fetch assemblies on open
  useEffect(() => {
    if (isOpen) {
      fetchAssemblies();
    }
  }, [isOpen]);

  const fetchAssemblies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assemblies', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenantId,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch assemblies');
      const data = await response.json();
      setAssemblies(data.assemblies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assemblies');
    } finally {
      setLoading(false);
    }
  };

  const createAssembly = async () => {
    if (!createForm.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assemblies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify(createForm),
      });
      if (!response.ok) throw new Error('Failed to create assembly');
      const data = await response.json();
      setAssemblies(prev => [data.assembly, ...prev]);
      setSelectedAssembly(data.assembly);
      setActiveTab('view');
      setCreateForm({ name: '', type: 'WEEKLY_ALL_HANDS', cadence: 'ONCE' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assembly');
    } finally {
      setLoading(false);
    }
  };

  const runAssembly = async (assemblyId: string) => {
    setRunningAssemblyId(assemblyId);
    setError(null);
    try {
      const response = await fetch(`/api/assemblies/${assemblyId}/run`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenantId,
        },
      });
      if (!response.ok) throw new Error('Failed to run assembly');
      const data = await response.json();

      // Update the assembly in state
      setAssemblies(prev => prev.map(a => a.id === assemblyId ? data.assembly : a));
      if (selectedAssembly?.id === assemblyId) {
        setSelectedAssembly(data.assembly);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run assembly');
    } finally {
      setRunningAssemblyId(null);
    }
  };

  const runSingleSection = async (assemblyId: string, sectionId: string) => {
    try {
      const response = await fetch(`/api/assemblies/${assemblyId}/sections/${sectionId}/run`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenantId,
        },
      });
      if (!response.ok) throw new Error('Failed to run section');

      // Refresh the assembly
      const refreshResponse = await fetch(`/api/assemblies/${assemblyId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenantId,
        },
      });
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAssemblies(prev => prev.map(a => a.id === assemblyId ? data.assembly : a));
        setSelectedAssembly(data.assembly);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run section');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETE': return <CheckCircle size={16} style={{ color: '#28A745' }} />;
      case 'RUNNING':
      case 'GENERATING': return <Loader2 size={16} style={{ color: '#00CCEE', animation: 'spin 1s linear infinite' }} />;
      case 'FAILED': return <AlertCircle size={16} style={{ color: '#DC3545' }} />;
      default: return <Clock size={16} style={{ color: '#8888A0' }} />;
    }
  };

  if (!isOpen) return null;

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
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1C1C26',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '85vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)',
            padding: '1.5rem 2rem',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#00CCEE' }}>
              <Building2 size={32} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Assemblies</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                AI-generated executive reports and briefings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '1rem 2rem',
            borderBottom: '2px solid #2A2A38',
          }}
        >
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'list' ? '#00CCEE' : 'transparent',
              color: activeTab === 'list' ? 'white' : '#8888A0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            All Assemblies
          </button>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'create' ? '#00CCEE' : 'transparent',
              color: activeTab === 'create' ? 'white' : '#8888A0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Plus size={16} /> Create New
          </button>
          {selectedAssembly && (
            <button
              onClick={() => setActiveTab('view')}
              style={{
                padding: '0.75rem 1.25rem',
                background: activeTab === 'view' ? '#00CCEE' : 'transparent',
                color: activeTab === 'view' ? 'white' : '#8888A0',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FileText size={16} /> View Assembly
            </button>
          )}
        </div>

        {/* Content Area */}
        <div style={{ padding: '2rem', maxHeight: 'calc(85vh - 180px)', overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                background: 'rgba(220, 53, 69, 0.1)',
                border: '1px solid #DC3545',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#DC3545',
              }}
            >
              {error}
            </div>
          )}

          {/* List View */}
          {activeTab === 'list' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ margin: 0, color: '#F0F0F5' }}>Your Assemblies</h3>
                <button
                  onClick={fetchAssemblies}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#1C1C26',
                    color: '#F0F0F5',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              {loading && assemblies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8888A0' }}>
                  <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  <p>Loading assemblies...</p>
                </div>
              ) : assemblies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8888A0' }}>
                  <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No assemblies yet. Create your first one!</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#00CCEE',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '1rem',
                    }}
                  >
                    <Plus size={16} /> Create Assembly
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {assemblies.map((assembly) => (
                    <div
                      key={assembly.id}
                      style={{
                        padding: '1.25rem',
                        background: '#09090F',
                        borderRadius: '10px',
                        borderLeft: `4px solid ${assembly.status === 'COMPLETE' ? '#28A745' : '#00CCEE'}`,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setSelectedAssembly(assembly);
                        setActiveTab('view');
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: '600',
                              color: '#F0F0F5',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            {getStatusIcon(assembly.status)}
                            {assembly.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                            {ASSEMBLY_TYPE_LABELS[assembly.type] || assembly.type} •{' '}
                            {assembly.sections.length} sections •{' '}
                            {new Date(assembly.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {assembly.status !== 'COMPLETE' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                runAssembly(assembly.id);
                              }}
                              disabled={runningAssemblyId === assembly.id}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#00CCEE',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              {runningAssemblyId === assembly.id ? (
                                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <Play size={14} />
                              )}
                              {runningAssemblyId === assembly.id ? 'Running...' : 'Run'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create View */}
          {activeTab === 'create' && (
            <div>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#F0F0F5' }}>Create New Assembly</h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: '600',
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Q1 2025 Executive Briefing"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#09090F',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    color: '#F0F0F5',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: '600',
                  }}
                >
                  Type
                </label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#09090F',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    color: '#F0F0F5',
                    fontSize: '1rem',
                  }}
                >
                  <option value="WEEKLY_ALL_HANDS">Weekly All-Hands</option>
                  <option value="MONTHLY_BOARD_REPORT">Monthly Board Report</option>
                  <option value="QUARTERLY_REVIEW">Quarterly Review</option>
                  <option value="PROJECT_KICKOFF">Project Kickoff</option>
                  <option value="ANNUAL_STRATEGIC_PLAN">Annual Strategic Plan</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: '600',
                  }}
                >
                  Cadence
                </label>
                <select
                  value={createForm.cadence}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, cadence: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#09090F',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    color: '#F0F0F5',
                    fontSize: '1rem',
                  }}
                >
                  <option value="ONCE">One-time</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUALLY">Annually</option>
                </select>
              </div>

              <button
                onClick={createAssembly}
                disabled={loading || !createForm.name.trim()}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#00CCEE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: loading || !createForm.name.trim() ? 0.5 : 1,
                }}
              >
                {loading ? 'Creating...' : 'Create Assembly'}
              </button>
            </div>
          )}

          {/* View Assembly */}
          {activeTab === 'view' && selectedAssembly && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#F0F0F5' }}>{selectedAssembly.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#8888A0' }}>
                    {ASSEMBLY_TYPE_LABELS[selectedAssembly.type] || selectedAssembly.type} •{' '}
                    {selectedAssembly.cadence.toLowerCase()} •{' '}
                    {selectedAssembly.status}
                  </div>
                </div>
                {selectedAssembly.status !== 'COMPLETE' && (
                  <button
                    onClick={() => runAssembly(selectedAssembly.id)}
                    disabled={runningAssemblyId === selectedAssembly.id}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#00CCEE',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {runningAssemblyId === selectedAssembly.id ? (
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Play size={16} />
                    )}
                    Run All Sections
                  </button>
                )}
              </div>

              {/* Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedAssembly.sections.map((section) => (
                  <div
                    key={section.id}
                    style={{
                      padding: '1.25rem',
                      background: '#09090F',
                      borderRadius: '10px',
                      borderLeft: `4px solid ${EXECUTIVE_COLORS[section.executive] || '#8888A0'}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: '600',
                            color: '#F0F0F5',
                            marginBottom: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          {getStatusIcon(section.status)}
                          {section.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: EXECUTIVE_COLORS[section.executive] || '#8888A0',
                            fontWeight: '600',
                          }}
                        >
                          {EXECUTIVE_NAMES[section.executive] || section.executive}
                        </div>
                      </div>
                      {section.status !== 'COMPLETE' && section.status !== 'GENERATING' && (
                        <button
                          onClick={() => runSingleSection(selectedAssembly.id, section.id)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            background: '#1C1C26',
                            color: '#F0F0F5',
                            border: '1px solid #2A2A38',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <RefreshCw size={12} /> Regenerate
                        </button>
                      )}
                    </div>

                    {/* Prompt (collapsed by default) */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <details>
                        <summary
                          style={{
                            fontSize: '0.75rem',
                            color: '#8888A0',
                            cursor: 'pointer',
                            marginBottom: '0.5rem',
                          }}
                        >
                          View prompt
                        </summary>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#8888A0',
                            padding: '0.75rem',
                            background: '#1C1C26',
                            borderRadius: '6px',
                            marginTop: '0.5rem',
                          }}
                        >
                          {section.prompt}
                        </div>
                      </details>
                    </div>

                    {/* Content */}
                    {section.content ? (
                      <div
                        style={{
                          fontSize: '0.9rem',
                          color: '#F0F0F5',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {section.content}
                      </div>
                    ) : section.status === 'GENERATING' ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#8888A0',
                          fontStyle: 'italic',
                        }}
                      >
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        Generating content...
                      </div>
                    ) : section.status === 'FAILED' ? (
                      <div style={{ color: '#DC3545', fontStyle: 'italic' }}>
                        Failed to generate. Click regenerate to try again.
                      </div>
                    ) : (
                      <div style={{ color: '#8888A0', fontStyle: 'italic' }}>
                        Not yet generated. Run the assembly to generate content.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
