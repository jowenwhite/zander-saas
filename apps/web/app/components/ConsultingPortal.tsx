'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Loader2,
  Package,
  Calendar,
  TrendingUp,
  ClipboardList,
  Timer,
  FileSignature
} from 'lucide-react';

interface Engagement {
  id: string;
  packageType: string;
  status: string;
  totalHours: number;
  hoursUsed: number;
  hoursRemaining: number;
  hoursProgress: number;
  startDate: string;
  endDate: string | null;
  daysUntilExpiration: number | null;
  isExpiringSoon: boolean;
  notes?: string;
}

interface Deliverable {
  id: string;
  name: string;
  description?: string;
  status: string;
  deliveredAt?: string;
  documentUrl?: string;
}

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  description: string;
  category: string;
}

interface Document {
  id: string;
  type: string;
  documentName: string;
  documentUrl?: string;
  isSigned: boolean;
  signedAt?: string;
  signerName?: string;
}

interface PortalData {
  engagement: Engagement | null;
  deliverables: Deliverable[];
  deliverableStats: {
    pending: number;
    inProgress: number;
    delivered: number;
  };
  timeEntries: TimeEntry[];
  documents: {
    pending: Document[];
    signed: Document[];
  };
  hasActiveEngagement: boolean;
}

const PACKAGE_LABELS: Record<string, { name: string; color: string }> = {
  'BUSINESS_ANALYSIS': { name: 'Business Analysis', color: '#00CFEB' },
  'COMPASS': { name: 'Compass', color: '#7C3AED' },
  'FOUNDATION': { name: 'Foundation', color: '#22C55E' },
  'BLUEPRINT': { name: 'Blueprint', color: '#F59E0B' },
  'EXTENSION': { name: 'Extension', color: '#EC4899' },
};

const STATUS_COLORS: Record<string, string> = {
  'ACTIVE': '#22C55E',
  'COMPLETED': '#3B82F6',
  'PAUSED': '#F59E0B',
  'EXPIRED': '#EF4444',
  'PENDING': '#8888A0',
  'IN_PROGRESS': '#00CFEB',
  'DELIVERED': '#22C55E',
};

interface ConsultingPortalProps {
  authToken: string;
  tenantId: string | null;
}

export default function ConsultingPortal({ authToken, tenantId }: ConsultingPortalProps) {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortalData = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/consulting/my-engagement', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'x-tenant-id': tenantId || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch consulting data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consulting data');
    } finally {
      setLoading(false);
    }
  }, [authToken, tenantId]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };

  const getDocumentSignUrl = (doc: Document) => {
    // Route to appropriate signing page based on document type
    if (doc.type === 'NDA') {
      return `/documents/nda/${doc.id}`;
    } else if (doc.type === 'CSA') {
      return `/documents/csa/${doc.id}`;
    }
    return '#';
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        background: '#1C1C26',
        borderRadius: '12px',
        padding: '3rem',
        textAlign: 'center',
        border: '2px solid #2A2A38',
        marginBottom: '1.5rem',
      }}>
        <Loader2 size={32} style={{ color: '#00CFEB', animation: 'spin 1s linear infinite' }} />
        <p style={{ margin: '1rem 0 0', color: '#8888A0' }}>Loading your engagement...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        background: '#1C1C26',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '2px solid #DC3545',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#DC3545' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchPortalData}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#DC3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // No engagement state
  if (!data?.engagement) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(0,207,235,0.05) 100%)',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid rgba(124,58,237,0.3)',
        marginBottom: '1.5rem',
        textAlign: 'center',
      }}>
        <Briefcase size={48} style={{ color: '#7C3AED', marginBottom: '1rem' }} />
        <h3 style={{ margin: '0 0 0.5rem', color: '#F0F0F5', fontSize: '1.25rem' }}>
          Consulting Engagement Pending
        </h3>
        <p style={{ margin: 0, color: '#8888A0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
          Your consulting engagement will appear here once it begins. Contact your consultant if you have questions.
        </p>
      </div>
    );
  }

  const { engagement, deliverables, deliverableStats, timeEntries, documents } = data;
  const pkg = PACKAGE_LABELS[engagement.packageType] || { name: engagement.packageType, color: '#00CFEB' };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(0,207,235,0.1) 100%)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem',
        border: '1px solid rgba(124,58,237,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${pkg.color} 0%, #00CFEB 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Briefcase size={22} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.1rem', fontWeight: '700' }}>
              {pkg.name} Package
            </h3>
            <p style={{ margin: '0.2rem 0 0', color: '#8888A0', fontSize: '0.85rem' }}>
              Your active consulting engagement
            </p>
          </div>
        </div>
        <div style={{
          padding: '0.4rem 0.8rem',
          borderRadius: '6px',
          background: `${STATUS_COLORS[engagement.status]}20`,
          border: `1px solid ${STATUS_COLORS[engagement.status]}40`,
          color: STATUS_COLORS[engagement.status],
          fontSize: '0.8rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {engagement.status}
        </div>
      </div>

      {/* Main Grid - 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Engagement Status Card */}
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '2px solid #2A2A38',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Package size={18} style={{ color: '#00CFEB' }} />
              <h4 style={{ margin: 0, color: '#F0F0F5', fontSize: '0.95rem', fontWeight: '600' }}>
                Hours Summary
              </h4>
            </div>

            {/* Hours Progress Bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#8888A0', fontSize: '0.85rem' }}>
                  {formatHours(engagement.hoursUsed)} of {formatHours(engagement.totalHours)} hours used
                </span>
                <span style={{
                  color: engagement.hoursProgress >= 90 ? '#EF4444' : engagement.hoursProgress >= 75 ? '#F59E0B' : '#22C55E',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                }}>
                  {engagement.hoursProgress}%
                </span>
              </div>
              <div style={{
                height: '10px',
                background: '#2A2A38',
                borderRadius: '5px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(engagement.hoursProgress, 100)}%`,
                  background: engagement.hoursProgress >= 90
                    ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
                    : engagement.hoursProgress >= 75
                    ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                    : 'linear-gradient(90deg, #00CFEB 0%, #7C3AED 100%)',
                  borderRadius: '5px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{
                background: '#09090F',
                borderRadius: '8px',
                padding: '0.75rem',
              }}>
                <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Remaining</div>
                <div style={{ color: '#F0F0F5', fontSize: '1.1rem', fontWeight: '700' }}>
                  {formatHours(engagement.hoursRemaining)} hrs
                </div>
              </div>
              <div style={{
                background: '#09090F',
                borderRadius: '8px',
                padding: '0.75rem',
              }}>
                <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  {engagement.isExpiringSoon ? 'Expires In' : 'Expires'}
                </div>
                <div style={{
                  color: engagement.isExpiringSoon ? '#F59E0B' : '#F0F0F5',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                }}>
                  {engagement.daysUntilExpiration !== null
                    ? engagement.daysUntilExpiration > 0
                      ? `${engagement.daysUntilExpiration} days`
                      : 'Expired'
                    : 'Open-ended'
                  }
                </div>
              </div>
            </div>

            {/* Expiration Warning */}
            {engagement.isExpiringSoon && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.6rem 0.75rem',
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <AlertCircle size={16} style={{ color: '#F59E0B' }} />
                <span style={{ color: '#F59E0B', fontSize: '0.8rem' }}>
                  Hours expire soon. Contact your consultant to discuss extension options.
                </span>
              </div>
            )}

            {/* Dates */}
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#8888A0' }}>
              <span>Started: {formatDate(engagement.startDate)}</span>
              {engagement.endDate && <span>Ends: {formatDate(engagement.endDate)}</span>}
            </div>
          </div>

          {/* Documents Section */}
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '2px solid #2A2A38',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <FileSignature size={18} style={{ color: '#00CFEB' }} />
              <h4 style={{ margin: 0, color: '#F0F0F5', fontSize: '0.95rem', fontWeight: '600' }}>
                Documents
              </h4>
            </div>

            {documents.pending.length === 0 && documents.signed.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#8888A0', fontSize: '0.85rem' }}>
                No documents yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Pending Documents */}
                {documents.pending.map((doc) => (
                  <a
                    key={doc.id}
                    href={getDocumentSignUrl(doc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={18} style={{ color: '#F59E0B' }} />
                      <div>
                        <div style={{ color: '#F0F0F5', fontSize: '0.9rem', fontWeight: '500' }}>
                          {doc.documentName}
                        </div>
                        <div style={{ color: '#F59E0B', fontSize: '0.75rem' }}>
                          Pending signature
                        </div>
                      </div>
                    </div>
                    <div style={{
                      padding: '0.4rem 0.75rem',
                      background: '#F59E0B',
                      color: '#000',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}>
                      Review & Sign <ExternalLink size={14} />
                    </div>
                  </a>
                ))}

                {/* Signed Documents */}
                {documents.signed.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: '#09090F',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
                      <div>
                        <div style={{ color: '#F0F0F5', fontSize: '0.9rem', fontWeight: '500' }}>
                          {doc.documentName}
                        </div>
                        <div style={{ color: '#22C55E', fontSize: '0.75rem' }}>
                          Signed {doc.signedAt ? formatDate(doc.signedAt) : ''}
                        </div>
                      </div>
                    </div>
                    {doc.documentUrl && (
                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: '#2A2A38',
                          color: '#F0F0F5',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          textDecoration: 'none',
                        }}
                      >
                        <Download size={14} /> Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Deliverables Section */}
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '2px solid #2A2A38',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={18} style={{ color: '#00CFEB' }} />
                <h4 style={{ margin: 0, color: '#F0F0F5', fontSize: '0.95rem', fontWeight: '600' }}>
                  Deliverables
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#22C55E' }}>{deliverableStats.delivered} delivered</span>
                <span style={{ color: '#8888A0' }}>|</span>
                <span style={{ color: '#00CFEB' }}>{deliverableStats.inProgress} in progress</span>
              </div>
            </div>

            {deliverables.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#8888A0', fontSize: '0.85rem' }}>
                Deliverables will appear here as your engagement progresses
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {deliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.75rem',
                      background: '#09090F',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {deliverable.status === 'DELIVERED' ? (
                        <CheckCircle2 size={16} style={{ color: '#22C55E' }} />
                      ) : deliverable.status === 'IN_PROGRESS' ? (
                        <Clock size={16} style={{ color: '#00CFEB' }} />
                      ) : (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #55556A' }} />
                      )}
                      <span style={{ color: '#F0F0F5', fontSize: '0.85rem' }}>{deliverable.name}</span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: STATUS_COLORS[deliverable.status] || '#8888A0',
                      textTransform: 'uppercase',
                    }}>
                      {deliverable.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Time Log Section */}
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '2px solid #2A2A38',
            flex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Timer size={18} style={{ color: '#00CFEB' }} />
              <h4 style={{ margin: 0, color: '#F0F0F5', fontSize: '0.95rem', fontWeight: '600' }}>
                Recent Time Log
              </h4>
            </div>

            {timeEntries.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#8888A0', fontSize: '0.85rem' }}>
                Time entries will appear here as work is logged
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                {timeEntries.slice(0, 8).map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.75rem',
                      background: '#09090F',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: '#F0F0F5',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {entry.description}
                      </div>
                      <div style={{ color: '#8888A0', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        {formatDate(entry.date)} • {entry.category}
                      </div>
                    </div>
                    <div style={{
                      marginLeft: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      background: '#2A2A38',
                      borderRadius: '4px',
                      color: '#00CFEB',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}>
                      {formatHours(entry.hours)} hrs
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
