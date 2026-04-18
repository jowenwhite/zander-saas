'use client';

import { useState } from 'react';
import { useConsulting, Engagement, TimeEntry, Deliverable } from '../hooks/useConsulting';
import { ConsultingIntakeSurvey } from './ConsultingIntakeSurvey';

interface Tenant {
  id: string;
  companyName: string;
  subscriptionTier?: string;
  tierOverride?: string;
}

interface ConsultingTabProps {
  tenants: Tenant[];
}

const PACKAGE_TYPES = [
  { value: 'BUSINESS_ANALYSIS', label: 'Business Analysis', hours: 3, price: 500 },
  { value: 'COMPASS', label: 'Compass', hours: 10, price: 2500 },
  { value: 'FOUNDATION', label: 'Foundation', hours: 20, price: 4500 },
  { value: 'BLUEPRINT', label: 'Blueprint', hours: 40, price: 8000 },
  { value: 'EXTENSION', label: 'Package Extension', hours: 0, price: 250 },
];

const TIME_CATEGORIES = [
  'Strategy Session',
  'Document Creation',
  'Research & Analysis',
  'Implementation Support',
  'Training',
  'Review & Feedback',
  'Administrative',
];

const DELIVERABLE_TEMPLATES: Record<string, string[]> = {
  BUSINESS_ANALYSIS: ['Comprehensive Business Analysis Report'],
  COMPASS: [
    'Initial Assessment',
    'Strategic Recommendations',
    'Prioritized Action Plan',
    'Follow-up Session Notes',
  ],
  FOUNDATION: [
    'Discovery Summary',
    'Business Model Canvas',
    'Operations Playbook',
    'Implementation Roadmap',
    'Weekly Check-in Notes',
  ],
  BLUEPRINT: [
    'Full Business Assessment',
    'Strategic Plan Document',
    'Financial Model',
    'Operations Manual',
    'Marketing Framework',
    'Team Structure Guide',
    'Implementation Timeline',
    'Monthly Review Reports',
  ],
};

export function ConsultingTab({ tenants }: ConsultingTabProps) {
  const {
    engagements,
    timeEntries,
    deliverables,
    loading,
    createEngagement,
    updateEngagement,
    createTimeEntry,
    createDeliverable,
    updateDeliverable,
    refetch,
  } = useConsulting();

  const [subTab, setSubTab] = useState<'engagements' | 'intakes'>('engagements');
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [expandedEngagement, setExpandedEngagement] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Filter consulting tier tenants
  const consultingTenants = tenants.filter(
    (t) => t.subscriptionTier === 'CONSULTING' || t.tierOverride === 'CONSULTING'
  );

  const handleCreateEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const pkg = PACKAGE_TYPES.find((p) => p.value === formData.packageType);
      await createEngagement({
        tenantId: formData.tenantId,
        packageType: formData.packageType,
        startDate: formData.startDate,
        totalHours: pkg?.hours || 0,
        stripePaymentId: formData.stripePaymentId,
        notes: formData.notes,
      });
      setShowEngagementModal(false);
      setFormData({});
    } catch (err) {
      alert('Failed to create engagement');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTimeEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngagement) return;
    setSaving(true);
    try {
      await createTimeEntry({
        tenantId: selectedEngagement.tenantId,
        engagementId: selectedEngagement.id,
        date: formData.date || new Date().toISOString().split('T')[0],
        hours: parseFloat(formData.hours),
        billableHours: parseFloat(formData.billableHours || formData.hours),
        description: formData.description,
        category: formData.category,
      });
      setShowTimeEntryModal(false);
      setFormData({});
    } catch (err) {
      alert('Failed to log time');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngagement) return;
    setSaving(true);
    try {
      await createDeliverable({
        tenantId: selectedEngagement.tenantId,
        engagementId: selectedEngagement.id,
        packageTier: selectedEngagement.packageType,
        name: formData.name,
        description: formData.description,
      });
      setShowDeliverableModal(false);
      setFormData({});
    } catch (err) {
      alert('Failed to create deliverable');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDeliverableStatus = async (id: string, status: string) => {
    try {
      await updateDeliverable(id, { status });
    } catch (err) {
      alert('Failed to update deliverable');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#22C55E';
      case 'COMPLETED':
        return '#3B82F6';
      case 'PAUSED':
        return '#F59E0B';
      case 'EXPIRED':
        return '#EF4444';
      case 'PENDING':
        return '#6B7280';
      case 'IN_PROGRESS':
        return '#00CFEB';
      case 'DELIVERED':
        return '#22C55E';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Loading consulting data...
      </div>
    );
  }

  const activeEngagements = engagements.filter((e) => e.status === 'ACTIVE');
  const completedEngagements = engagements.filter((e) => e.status !== 'ACTIVE');

  return (
    <div>
      {/* Header with Sub-tabs */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #2A2A38',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>
            💼 Consulting
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSubTab('engagements')}
              style={{
                padding: '0.5rem 1rem',
                background: subTab === 'engagements' ? '#00CFEB20' : 'transparent',
                border: subTab === 'engagements' ? '1px solid #00CFEB' : '1px solid #2A2A38',
                borderRadius: '6px',
                color: subTab === 'engagements' ? '#00CFEB' : '#8888A0',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              Engagements ({activeEngagements.length})
            </button>
            <button
              onClick={() => setSubTab('intakes')}
              style={{
                padding: '0.5rem 1rem',
                background: subTab === 'intakes' ? '#00CFEB20' : 'transparent',
                border: subTab === 'intakes' ? '1px solid #00CFEB' : '1px solid #2A2A38',
                borderRadius: '6px',
                color: subTab === 'intakes' ? '#00CFEB' : '#8888A0',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              📋 Intakes
            </button>
          </div>
        </div>
        {subTab === 'engagements' && (
          <button
            onClick={() => {
              setFormData({});
              setShowEngagementModal(true);
            }}
            style={{
              background: '#00CFEB',
              color: '#000',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            + New Engagement
          </button>
        )}
      </div>

      {/* Intakes Sub-tab */}
      {subTab === 'intakes' && <ConsultingIntakeSurvey />}

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            background: '#13131A',
            borderRadius: '8px',
            padding: '1.25rem',
          }}
        >
          <div style={{ color: '#8888A0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Active Engagements
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F0F0F5' }}>
            {activeEngagements.length}
          </div>
        </div>
        <div
          style={{
            background: '#13131A',
            borderRadius: '8px',
            padding: '1.25rem',
          }}
        >
          <div style={{ color: '#8888A0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Total Hours Logged
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F0F0F5' }}>
            {timeEntries.reduce((sum, e) => sum + e.hours, 0).toFixed(1)}
          </div>
        </div>
        <div
          style={{
            background: '#13131A',
            borderRadius: '8px',
            padding: '1.25rem',
          }}
        >
          <div style={{ color: '#8888A0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Billable Hours
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#00CFEB' }}>
            {timeEntries.reduce((sum, e) => sum + e.billableHours, 0).toFixed(1)}
          </div>
        </div>
        <div
          style={{
            background: '#13131A',
            borderRadius: '8px',
            padding: '1.25rem',
          }}
        >
          <div style={{ color: '#8888A0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Pending Deliverables
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>
            {deliverables.filter((d) => d.status !== 'DELIVERED').length}
          </div>
        </div>
      </div>

      {/* Engagements List */}
      <div style={{ padding: '0 1.5rem 1.5rem' }}>
        {engagements.length === 0 ? (
          <div
            style={{
              background: '#13131A',
              borderRadius: '8px',
              padding: '3rem',
              textAlign: 'center',
              color: '#8888A0',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No engagements yet</div>
            <div>Create your first consulting engagement to get started.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {engagements.map((engagement) => {
              const engTimeEntries = timeEntries.filter(
                (te) => te.engagementId === engagement.id
              );
              const engDeliverables = deliverables.filter(
                (d) => d.engagementId === engagement.id
              );
              const hoursRemaining = engagement.totalHours - engagement.hoursUsed;
              const hoursPercent =
                engagement.totalHours > 0
                  ? (engagement.hoursUsed / engagement.totalHours) * 100
                  : 0;
              const isExpanded = expandedEngagement === engagement.id;

              return (
                <div
                  key={engagement.id}
                  style={{
                    background: '#13131A',
                    borderRadius: '8px',
                    border: '1px solid #2A2A38',
                    overflow: 'hidden',
                  }}
                >
                  {/* Engagement Header */}
                  <div
                    onClick={() =>
                      setExpandedEngagement(isExpanded ? null : engagement.id)
                    }
                    style={{
                      padding: '1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span
                        style={{
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                          display: 'inline-block',
                        }}
                      >
                        ▶
                      </span>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#F0F0F5',
                            fontSize: '1.1rem',
                          }}
                        >
                          {engagement.tenant.companyName}
                        </div>
                        <div
                          style={{
                            color: '#8888A0',
                            fontSize: '0.85rem',
                            marginTop: '0.25rem',
                          }}
                        >
                          {engagement.packageType} • Started{' '}
                          {formatDate(engagement.startDate)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      {/* Hours Progress */}
                      {engagement.totalHours > 0 && (
                        <div style={{ width: '200px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.8rem',
                              marginBottom: '0.25rem',
                            }}
                          >
                            <span style={{ color: '#8888A0' }}>Hours</span>
                            <span style={{ color: '#F0F0F5' }}>
                              {engagement.hoursUsed.toFixed(1)} / {engagement.totalHours}
                            </span>
                          </div>
                          <div
                            style={{
                              height: '6px',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.min(100, hoursPercent)}%`,
                                background:
                                  hoursPercent > 90
                                    ? '#EF4444'
                                    : hoursPercent > 75
                                    ? '#F59E0B'
                                    : '#00CFEB',
                                borderRadius: '3px',
                                transition: 'width 0.3s',
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {/* Status Badge */}
                      <span
                        style={{
                          background: `${getStatusColor(engagement.status)}20`,
                          color: getStatusColor(engagement.status),
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {engagement.status}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: '1px solid #2A2A38',
                        padding: '1.25rem',
                      }}
                    >
                      {/* Action Buttons */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          marginBottom: '1.5rem',
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEngagement(engagement);
                            setFormData({
                              date: new Date().toISOString().split('T')[0],
                            });
                            setShowTimeEntryModal(true);
                          }}
                          style={{
                            background: 'transparent',
                            color: '#00CFEB',
                            border: '1px solid #00CFEB',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          + Log Time
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEngagement(engagement);
                            setFormData({});
                            setShowDeliverableModal(true);
                          }}
                          style={{
                            background: 'transparent',
                            color: '#8B5CF6',
                            border: '1px solid #8B5CF6',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          + Add Deliverable
                        </button>
                        {engagement.status === 'ACTIVE' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm('Mark this engagement as completed?')
                              ) {
                                updateEngagement(engagement.id, {
                                  status: 'COMPLETED',
                                });
                              }
                            }}
                            style={{
                              background: 'transparent',
                              color: '#22C55E',
                              border: '1px solid #22C55E',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              marginLeft: 'auto',
                            }}
                          >
                            ✓ Complete
                          </button>
                        )}
                      </div>

                      {/* Two Column Layout */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '1.5rem',
                        }}
                      >
                        {/* Time Entries */}
                        <div>
                          <h4
                            style={{
                              margin: '0 0 1rem',
                              color: '#F0F0F5',
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            ⏱️ Time Entries ({engTimeEntries.length})
                          </h4>
                          {engTimeEntries.length === 0 ? (
                            <div
                              style={{
                                color: '#8888A0',
                                fontSize: '0.9rem',
                                fontStyle: 'italic',
                              }}
                            >
                              No time logged yet
                            </div>
                          ) : (
                            <div
                              style={{
                                maxHeight: '250px',
                                overflow: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                              }}
                            >
                              {engTimeEntries.map((entry) => (
                                <div
                                  key={entry.id}
                                  style={{
                                    background: '#1C1C26',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      marginBottom: '0.25rem',
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: '#F0F0F5',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      {entry.category}
                                    </span>
                                    <span
                                      style={{
                                        color: '#00CFEB',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      {entry.billableHours}h
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      color: '#8888A0',
                                      fontSize: '0.8rem',
                                    }}
                                  >
                                    {formatDate(entry.date)} • {entry.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Deliverables */}
                        <div>
                          <h4
                            style={{
                              margin: '0 0 1rem',
                              color: '#F0F0F5',
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            📦 Deliverables ({engDeliverables.length})
                          </h4>
                          {engDeliverables.length === 0 ? (
                            <div
                              style={{
                                color: '#8888A0',
                                fontSize: '0.9rem',
                                fontStyle: 'italic',
                              }}
                            >
                              No deliverables added yet
                            </div>
                          ) : (
                            <div
                              style={{
                                maxHeight: '250px',
                                overflow: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                              }}
                            >
                              {engDeliverables.map((deliverable) => (
                                <div
                                  key={deliverable.id}
                                  style={{
                                    background: '#1C1C26',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div>
                                    <div
                                      style={{
                                        color: '#F0F0F5',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      {deliverable.name}
                                    </div>
                                    {deliverable.description && (
                                      <div
                                        style={{
                                          color: '#8888A0',
                                          fontSize: '0.8rem',
                                          marginTop: '0.25rem',
                                        }}
                                      >
                                        {deliverable.description}
                                      </div>
                                    )}
                                  </div>
                                  <select
                                    value={deliverable.status}
                                    onChange={(e) =>
                                      handleUpdateDeliverableStatus(
                                        deliverable.id,
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      background: `${getStatusColor(deliverable.status)}20`,
                                      color: getStatusColor(deliverable.status),
                                      border: `1px solid ${getStatusColor(deliverable.status)}`,
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="DELIVERED">Delivered</option>
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {engagement.notes && (
                        <div style={{ marginTop: '1.5rem' }}>
                          <h4
                            style={{
                              margin: '0 0 0.5rem',
                              color: '#F0F0F5',
                              fontSize: '0.9rem',
                            }}
                          >
                            📝 Notes
                          </h4>
                          <div
                            style={{
                              background: '#1C1C26',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              color: '#8888A0',
                              fontSize: '0.9rem',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {engagement.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Engagement Modal */}
      {showEngagementModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid #2A2A38',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#F0F0F5',
                  fontSize: '1.25rem',
                }}
              >
                Create Engagement
              </h3>
            </div>
            <form onSubmit={handleCreateEngagement} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Client *
                </label>
                <select
                  value={formData.tenantId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantId: e.target.value })
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Select client...</option>
                  {consultingTenants.length === 0 ? (
                    <option value="" disabled>
                      No consulting tier clients found
                    </option>
                  ) : (
                    consultingTenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.companyName}
                      </option>
                    ))
                  )}
                  {/* Also show all tenants as fallback */}
                  {consultingTenants.length === 0 && (
                    <>
                      <option value="" disabled>
                        ── All Tenants ──
                      </option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.companyName}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Package *
                </label>
                <select
                  value={formData.packageType || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, packageType: e.target.value })
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Select package...</option>
                  {PACKAGE_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} - ${p.price.toLocaleString()}{' '}
                      {p.hours > 0 ? `(${p.hours} hrs)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Stripe Payment ID
                </label>
                <input
                  type="text"
                  value={formData.stripePaymentId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, stripePaymentId: e.target.value })
                  }
                  placeholder="pi_xxxxx (optional)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Initial notes about the engagement..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowEngagementModal(false);
                    setFormData({});
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#00CFEB',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#000',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Creating...' : 'Create Engagement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Time Modal */}
      {showTimeEntryModal && selectedEngagement && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid #2A2A38',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#F0F0F5',
                  fontSize: '1.25rem',
                }}
              >
                Log Time - {selectedEngagement.tenant.companyName}
              </h3>
            </div>
            <form onSubmit={handleCreateTimeEntry} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                      color: '#F0F0F5',
                      fontWeight: 500,
                    }}
                  >
                    Hours *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.hours || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hours: e.target.value,
                        billableHours: formData.billableHours || e.target.value,
                      })
                    }
                    required
                    placeholder="1.5"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#13131A',
                      border: '1px solid #2A2A38',
                      borderRadius: '6px',
                      color: '#F0F0F5',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                      color: '#F0F0F5',
                      fontWeight: 500,
                    }}
                  >
                    Billable Hours
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.billableHours || formData.hours || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, billableHours: e.target.value })
                    }
                    placeholder="1.5"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#13131A',
                      border: '1px solid #2A2A38',
                      borderRadius: '6px',
                      color: '#F0F0F5',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Category *
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Select category...</option>
                  {TIME_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Description *
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={3}
                  placeholder="What did you work on?"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowTimeEntryModal(false);
                    setSelectedEngagement(null);
                    setFormData({});
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#00CFEB',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#000',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Log Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deliverable Modal */}
      {showDeliverableModal && selectedEngagement && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid #2A2A38',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#F0F0F5',
                  fontSize: '1.25rem',
                }}
              >
                Add Deliverable - {selectedEngagement.tenant.companyName}
              </h3>
            </div>
            <form onSubmit={handleCreateDeliverable} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Strategic Plan Document"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                  }}
                />
                {/* Quick Templates */}
                {DELIVERABLE_TEMPLATES[selectedEngagement.packageType] && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: '#8888A0',
                      }}
                    >
                      Quick add:{' '}
                    </span>
                    {DELIVERABLE_TEMPLATES[selectedEngagement.packageType].map(
                      (template) => (
                        <button
                          key={template}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, name: template })
                          }
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#00CFEB',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            marginRight: '0.5rem',
                          }}
                        >
                          {template}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: 500,
                  }}
                >
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Optional description..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#13131A',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowDeliverableModal(false);
                    setSelectedEngagement(null);
                    setFormData({});
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#8B5CF6',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFF',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Adding...' : 'Add Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
