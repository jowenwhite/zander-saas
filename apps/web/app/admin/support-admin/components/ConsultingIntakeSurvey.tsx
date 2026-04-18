'use client';

import { useState, useEffect } from 'react';
import { useConsulting } from '../hooks/useConsulting';

interface Intake {
  id: string;
  tenantId: string;
  businessName: string;
  industry?: string;
  yearsInBusiness?: number;
  annualRevenue?: string;
  employeeCount?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  preferredContact?: string;
  primaryGoals: string[];
  biggestChallenges: string[];
  desiredOutcomes?: string;
  packageInterest?: string;
  budgetRange?: string;
  timeline?: string;
  urgency?: string;
  currentTools: string[];
  previousConsulting: boolean;
  additionalNotes?: string;
  howHeardAboutUs?: string;
  status: string;
  reviewedAt?: string;
  notes?: string;
  convertedToEngagement?: string;
  createdAt: string;
  tenant: { companyName: string };
  submittedBy?: { firstName: string; lastName: string; email: string };
  reviewedBy?: { firstName: string; lastName: string };
}

const PACKAGE_TYPES = [
  { value: 'BUSINESS_ANALYSIS', label: 'Business Analysis', hours: 3 },
  { value: 'COMPASS', label: 'Compass', hours: 10 },
  { value: 'FOUNDATION', label: 'Foundation', hours: 20 },
  { value: 'BLUEPRINT', label: 'Blueprint', hours: 40 },
];

export function ConsultingIntakeSurvey() {
  const { fetchIntakes, updateIntake, convertIntakeToEngagement } = useConsulting();
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntake, setSelectedIntake] = useState<Intake | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertData, setConvertData] = useState({
    packageType: '',
    startDate: new Date().toISOString().split('T')[0],
    totalHours: 0,
  });
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadIntakes();
  }, [statusFilter]);

  const loadIntakes = async () => {
    setLoading(true);
    const data = await fetchIntakes(statusFilter !== 'all' ? statusFilter : undefined);
    setIntakes(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (intakeId: string, newStatus: string) => {
    setSaving(true);
    try {
      await updateIntake(intakeId, { status: newStatus });
      await loadIntakes();
      if (selectedIntake?.id === intakeId) {
        setSelectedIntake(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedIntake) return;
    setSaving(true);
    try {
      await convertIntakeToEngagement(selectedIntake.id, convertData);
      setShowConvertModal(false);
      setSelectedIntake(null);
      await loadIntakes();
    } catch (err) {
      alert('Failed to convert intake');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#6B7280';
      case 'UNDER_REVIEW': return '#F59E0B';
      case 'APPROVED': return '#22C55E';
      case 'CONVERTED': return '#3B82F6';
      case 'DECLINED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>
        Loading intakes...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #2A2A38',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>
            📋 Intake Surveys
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.9rem' }}>
            Review and convert consulting intake submissions
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: '#13131A',
            border: '1px solid #2A2A38',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            color: '#F0F0F5',
            fontSize: '0.9rem',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="CONVERTED">Converted</option>
          <option value="DECLINED">Declined</option>
        </select>
      </div>

      {/* Intakes List */}
      <div style={{ padding: '1.5rem' }}>
        {intakes.length === 0 ? (
          <div style={{
            background: '#13131A',
            borderRadius: '8px',
            padding: '3rem',
            textAlign: 'center',
            color: '#8888A0',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No intake surveys found</div>
            <div>Intake surveys will appear here when prospects submit them.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {intakes.map((intake) => (
              <div
                key={intake.id}
                onClick={() => setSelectedIntake(intake)}
                style={{
                  background: '#13131A',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  border: selectedIntake?.id === intake.id ? '2px solid #00CFEB' : '1px solid #2A2A38',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#F0F0F5', fontSize: '1rem' }}>
                      {intake.businessName}
                    </div>
                    <div style={{ color: '#8888A0', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {intake.contactName} • {intake.contactEmail}
                    </div>
                    <div style={{ color: '#8888A0', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Package Interest: {intake.packageInterest || 'Not specified'} • {formatDate(intake.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {intake.urgency === 'urgent' && (
                      <span style={{
                        background: '#EF444420',
                        color: '#EF4444',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        URGENT
                      </span>
                    )}
                    <span style={{
                      background: `${getStatusColor(intake.status)}20`,
                      color: getStatusColor(intake.status),
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}>
                      {intake.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Intake Detail Modal */}
      {selectedIntake && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #2A2A38',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: '#1C1C26',
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>
                  {selectedIntake.businessName}
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.9rem' }}>
                  Submitted {formatDate(selectedIntake.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedIntake(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8888A0',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Status Actions */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
              }}>
                {selectedIntake.status === 'PENDING' && (
                  <button
                    onClick={() => handleStatusChange(selectedIntake.id, 'UNDER_REVIEW')}
                    disabled={saving}
                    style={{
                      background: '#F59E0B20',
                      color: '#F59E0B',
                      border: '1px solid #F59E0B',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Start Review
                  </button>
                )}
                {(selectedIntake.status === 'PENDING' || selectedIntake.status === 'UNDER_REVIEW') && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedIntake.id, 'APPROVED')}
                      disabled={saving}
                      style={{
                        background: '#22C55E20',
                        color: '#22C55E',
                        border: '1px solid #22C55E',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedIntake.id, 'DECLINED')}
                      disabled={saving}
                      style={{
                        background: '#EF444420',
                        color: '#EF4444',
                        border: '1px solid #EF4444',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Decline
                    </button>
                  </>
                )}
                {selectedIntake.status === 'APPROVED' && !selectedIntake.convertedToEngagement && (
                  <button
                    onClick={() => {
                      setConvertData({
                        packageType: selectedIntake.packageInterest || '',
                        startDate: new Date().toISOString().split('T')[0],
                        totalHours: PACKAGE_TYPES.find(p => p.value === selectedIntake.packageInterest)?.hours || 0,
                      });
                      setShowConvertModal(true);
                    }}
                    style={{
                      background: '#00CFEB',
                      color: '#000',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Convert to Engagement
                  </button>
                )}
                {selectedIntake.convertedToEngagement && (
                  <span style={{
                    background: '#3B82F620',
                    color: '#3B82F6',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                  }}>
                    ✓ Converted to Engagement
                  </span>
                )}
              </div>

              {/* Business Information */}
              <Section title="Business Information">
                <InfoRow label="Business Name" value={selectedIntake.businessName} />
                <InfoRow label="Industry" value={selectedIntake.industry} />
                <InfoRow label="Years in Business" value={selectedIntake.yearsInBusiness?.toString()} />
                <InfoRow label="Annual Revenue" value={selectedIntake.annualRevenue} />
                <InfoRow label="Employee Count" value={selectedIntake.employeeCount} />
              </Section>

              {/* Contact Information */}
              <Section title="Contact Information">
                <InfoRow label="Contact Name" value={selectedIntake.contactName} />
                <InfoRow label="Email" value={selectedIntake.contactEmail} />
                <InfoRow label="Phone" value={selectedIntake.contactPhone} />
                <InfoRow label="Preferred Contact" value={selectedIntake.preferredContact} />
              </Section>

              {/* Goals & Objectives */}
              <Section title="Goals & Objectives">
                <InfoRow label="Primary Goals" value={selectedIntake.primaryGoals?.join(', ')} />
                <InfoRow label="Biggest Challenges" value={selectedIntake.biggestChallenges?.join(', ')} />
                <InfoRow label="Desired Outcomes" value={selectedIntake.desiredOutcomes} multiline />
              </Section>

              {/* Scope & Budget */}
              <Section title="Scope & Budget">
                <InfoRow label="Package Interest" value={selectedIntake.packageInterest} />
                <InfoRow label="Budget Range" value={selectedIntake.budgetRange} />
                <InfoRow label="Timeline" value={selectedIntake.timeline} />
                <InfoRow label="Urgency" value={selectedIntake.urgency} />
              </Section>

              {/* Additional Context */}
              <Section title="Additional Context">
                <InfoRow label="Current Tools" value={selectedIntake.currentTools?.join(', ')} />
                <InfoRow label="Previous Consulting" value={selectedIntake.previousConsulting ? 'Yes' : 'No'} />
                <InfoRow label="How They Heard About Us" value={selectedIntake.howHeardAboutUs} />
                <InfoRow label="Additional Notes" value={selectedIntake.additionalNotes} multiline />
              </Section>

              {/* Internal Notes */}
              {selectedIntake.notes && (
                <Section title="Internal Notes">
                  <div style={{
                    background: '#13131A',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    color: '#F0F0F5',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {selectedIntake.notes}
                  </div>
                </Section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Convert to Engagement Modal */}
      {showConvertModal && selectedIntake && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2001,
        }}>
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '450px',
            padding: '1.5rem',
          }}>
            <h3 style={{ margin: '0 0 1.5rem', color: '#F0F0F5' }}>
              Convert to Engagement
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#F0F0F5', marginBottom: '0.5rem', fontWeight: 500 }}>
                Package *
              </label>
              <select
                value={convertData.packageType}
                onChange={(e) => {
                  const pkg = PACKAGE_TYPES.find(p => p.value === e.target.value);
                  setConvertData({
                    ...convertData,
                    packageType: e.target.value,
                    totalHours: pkg?.hours || 0,
                  });
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#13131A',
                  border: '1px solid #2A2A38',
                  borderRadius: '6px',
                  color: '#F0F0F5',
                }}
              >
                <option value="">Select package...</option>
                {PACKAGE_TYPES.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label} ({p.hours} hours)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#F0F0F5', marginBottom: '0.5rem', fontWeight: 500 }}>
                Start Date *
              </label>
              <input
                type="date"
                value={convertData.startDate}
                onChange={(e) => setConvertData({ ...convertData, startDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#13131A',
                  border: '1px solid #2A2A38',
                  borderRadius: '6px',
                  color: '#F0F0F5',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#F0F0F5', marginBottom: '0.5rem', fontWeight: 500 }}>
                Total Hours
              </label>
              <input
                type="number"
                value={convertData.totalHours}
                onChange={(e) => setConvertData({ ...convertData, totalHours: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#13131A',
                  border: '1px solid #2A2A38',
                  borderRadius: '6px',
                  color: '#F0F0F5',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConvertModal(false)}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: 'transparent',
                  border: '1px solid #2A2A38',
                  borderRadius: '6px',
                  color: '#F0F0F5',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={saving || !convertData.packageType}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#00CFEB',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#000',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: saving || !convertData.packageType ? 0.7 : 1,
                }}
              >
                {saving ? 'Converting...' : 'Convert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h4 style={{ margin: '0 0 0.75rem', color: '#F0F0F5', fontSize: '1rem', fontWeight: 600 }}>
        {title}
      </h4>
      <div style={{
        background: '#13131A',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, multiline }: { label: string; value?: string; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ display: multiline ? 'block' : 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#8888A0', fontSize: '0.9rem' }}>{label}:</span>
      <span style={{
        color: '#F0F0F5',
        fontSize: '0.9rem',
        marginLeft: multiline ? 0 : '1rem',
        marginTop: multiline ? '0.25rem' : 0,
        display: multiline ? 'block' : 'inline',
        whiteSpace: multiline ? 'pre-wrap' : 'normal',
      }}>
        {value}
      </span>
    </div>
  );
}
