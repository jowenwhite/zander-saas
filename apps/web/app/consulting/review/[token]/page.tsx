'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Metadata } from 'next';

interface DeliverableData {
  id: string;
  name: string;
  description: string | null;
  documentUrl: string | null;
  approvalStatus: string;
  submittedAt: string | null;
  approvedAt: string | null;
  revisionNotes: string | null;
  revisionRequestedAt: string | null;
  engagement: {
    packageType: string;
    companyName: string;
  };
}

// Note: For client components, metadata must be in a separate layout.tsx
// This page uses noindex via the layout

export default function DeliverableReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [deliverable, setDeliverable] = useState<DeliverableData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyApproved, setAlreadyApproved] = useState(false);

  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionComplete, setActionComplete] = useState<'approved' | 'revision' | null>(null);

  useEffect(() => {
    fetchDeliverable();
  }, [token]);

  const fetchDeliverable = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consulting/review/${token}`);
      const data = await response.json();

      if (!data.success) {
        if (data.error === 'already_approved') {
          setAlreadyApproved(true);
          setDeliverable(data.deliverable);
        } else {
          setError(data.message || 'Invalid or expired review link');
        }
      } else {
        setDeliverable(data.deliverable);
      }
    } catch (err) {
      setError('Unable to load deliverable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consulting/review/${token}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.success) {
        setActionComplete('approved');
      } else {
        setError(data.message || 'Failed to approve deliverable');
      }
    } catch (err) {
      setError('Unable to submit approval. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consulting/review/${token}/revise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: revisionNotes }),
      });
      const data = await response.json();

      if (data.success) {
        setActionComplete('revision');
      } else {
        setError(data.message || 'Failed to submit revision request');
      }
    } catch (err) {
      setError('Unable to submit revision request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: '#080A0F',
        color: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(0,207,235,0.2)',
            borderTopColor: '#00CFEB',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading deliverable...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !deliverable) {
    return (
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: '#080A0F',
        color: '#FFFFFF',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <nav style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          <img
            src="/images/zander-logo-color.svg"
            alt="Zander"
            style={{ width: '160px', height: 'auto' }}
          />
        </nav>

        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1.5rem',
          }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: '#EF4444',
          }}>
            Review Link Invalid
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}>
            {error}
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.95rem',
          }}>
            If you believe this is an error, please contact{' '}
            <a href="mailto:jonathan@zanderos.com" style={{ color: '#00CFEB', textDecoration: 'none' }}>
              jonathan@zanderos.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Already approved state
  if (alreadyApproved && deliverable) {
    return (
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: '#080A0F',
        color: '#FFFFFF',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <nav style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          <img
            src="/images/zander-logo-color.svg"
            alt="Zander"
            style={{ width: '160px', height: 'auto' }}
          />
        </nav>

        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid #22C55E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem',
          }}>
            ✓
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: '#22C55E',
          }}>
            Already Approved
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            marginBottom: '1rem',
          }}>
            <strong style={{ color: '#FFFFFF' }}>{deliverable.name}</strong> was approved on{' '}
            {deliverable.approvedAt ? new Date(deliverable.approvedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : 'a previous date'}.
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.95rem',
          }}>
            No further action is needed.
          </p>
        </div>
      </div>
    );
  }

  // Action complete state
  if (actionComplete) {
    return (
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: '#080A0F',
        color: '#FFFFFF',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <nav style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          <img
            src="/images/zander-logo-color.svg"
            alt="Zander"
            style={{ width: '160px', height: 'auto' }}
          />
        </nav>

        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: actionComplete === 'approved'
              ? 'rgba(34, 197, 94, 0.15)'
              : 'rgba(0, 207, 235, 0.15)',
            border: `2px solid ${actionComplete === 'approved' ? '#22C55E' : '#00CFEB'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem',
          }}>
            {actionComplete === 'approved' ? '✓' : '📝'}
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: actionComplete === 'approved' ? '#22C55E' : '#00CFEB',
          }}>
            {actionComplete === 'approved' ? 'Deliverable Approved!' : 'Revision Request Submitted'}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            marginBottom: '1rem',
          }}>
            {actionComplete === 'approved'
              ? 'Thank you for approving the deliverable. Your consultant has been notified.'
              : 'Thank you for your feedback. Your consultant will review your notes and address them promptly.'}
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.95rem',
          }}>
            Questions? Contact{' '}
            <a href="mailto:jonathan@zanderos.com" style={{ color: '#00CFEB', textDecoration: 'none' }}>
              jonathan@zanderos.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Main review view
  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: '#080A0F',
      color: '#FFFFFF',
      minHeight: '100vh',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Navigation */}
      <nav style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        <img
          src="/images/zander-logo-color.svg"
          alt="Zander"
          style={{ width: '160px', height: 'auto' }}
        />
      </nav>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(0,207,235,0.1)',
            border: '1px solid rgba(0,207,235,0.3)',
            color: '#00CFEB',
            padding: '6px 12px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            Deliverable Review
          </span>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}>
            {deliverable?.name}
          </h1>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.6)',
          }}>
            <span>{deliverable?.engagement?.companyName}</span>
            <span>•</span>
            <span>{deliverable?.engagement?.packageType} Package</span>
            {deliverable?.submittedAt && (
              <>
                <span>•</span>
                <span>Submitted {new Date(deliverable.submittedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Revision notes if any */}
        {deliverable?.revisionNotes && deliverable?.approvalStatus === 'revision_requested' && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: '#F59E0B',
              marginBottom: '0.5rem',
            }}>
              Previous Revision Notes
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}>
              {deliverable.revisionNotes}
            </p>
          </div>
        )}

        {/* Deliverable Details */}
        <div style={{
          background: '#0E1017',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          {deliverable?.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Description
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.05rem',
                lineHeight: 1.7,
              }}>
                {deliverable.description}
              </p>
            </div>
          )}

          {deliverable?.documentUrl && (
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Document
              </h3>
              <a
                href={deliverable.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(0,207,235,0.1)',
                  border: '1px solid rgba(0,207,235,0.3)',
                  color: '#00CFEB',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  transition: 'background 0.2s',
                }}
              >
                <span>📄</span>
                View Document
                <span style={{ marginLeft: '0.25rem' }}>→</span>
              </a>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#EF4444',
            fontSize: '0.95rem',
          }}>
            {error}
          </div>
        )}

        {/* Revision Form */}
        {showRevisionForm && (
          <div style={{
            background: '#0E1017',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              Request Revisions
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.95rem',
              marginBottom: '1rem',
            }}>
              Please describe what changes or improvements you&apos;d like to see:
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Enter your revision notes here..."
              rows={5}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '120px',
                marginBottom: '1rem',
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowRevisionForm(false);
                  setRevisionNotes('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={submitting || !revisionNotes.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: submitting || !revisionNotes.trim() ? 'rgba(245, 158, 11, 0.5)' : '#F59E0B',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting || !revisionNotes.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Revision Request'}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!showRevisionForm && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <button
              onClick={handleApprove}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '1.25rem 2rem',
                background: submitting ? 'rgba(34, 197, 94, 0.5)' : '#22C55E',
                border: 'none',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {submitting ? 'Processing...' : (
                <>
                  <span>✓</span>
                  Approve Deliverable
                </>
              )}
            </button>

            <button
              onClick={() => setShowRevisionForm(true)}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: 'transparent',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>📝</span>
              Request Revisions
            </button>
          </div>
        )}

        {/* Footer note */}
        <p style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.9rem',
        }}>
          Questions? Contact{' '}
          <a href="mailto:jonathan@zanderos.com" style={{ color: '#00CFEB', textDecoration: 'none' }}>
            jonathan@zanderos.com
          </a>
        </p>
      </div>
    </div>
  );
}
