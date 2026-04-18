'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface SurveyContext {
  engagementId: string;
  companyName: string;
  packageType: string;
  consultantName: string;
}

export default function SurveyPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [surveyContext, setSurveyContext] = useState<SurveyContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [mostValuable, setMostValuable] = useState('');
  const [improvements, setImprovements] = useState('');
  const [testimonialConsent, setTestimonialConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSurveyContext();
  }, [token]);

  const fetchSurveyContext = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consulting/survey/${token}`);
      const data = await response.json();

      if (!data.success) {
        if (data.error === 'already_submitted') {
          setAlreadySubmitted(true);
        } else {
          setError(data.message || 'Invalid or expired survey link');
        }
      } else {
        setSurveyContext(data.survey);
      }
    } catch (err) {
      setError('Unable to load survey. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (npsScore === null) {
      setError('Please select a score');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consulting/survey/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npsScore,
          mostValuable,
          improvements,
          testimonialConsent,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit survey');
      }
    } catch (err) {
      setError('Unable to submit survey. Please try again.');
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
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading survey...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !surveyContext) {
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
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <img
            src="/images/zander-logo-color.svg"
            alt="Zander"
            style={{ width: '160px', height: 'auto' }}
          />
        </nav>

        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: '#EF4444',
          }}>
            Survey Link Invalid
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1rem',
            lineHeight: 1.7,
          }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Already submitted state
  if (alreadySubmitted) {
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
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <img
            src="/images/zander-logo-color.svg"
            alt="Zander"
            style={{ width: '160px', height: 'auto' }}
          />
        </nav>

        <div style={{
          maxWidth: '500px',
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
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: '#22C55E',
          }}>
            Already Submitted
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1rem',
            lineHeight: 1.7,
          }}>
            Thank you! You have already submitted feedback for this engagement.
          </p>
        </div>
      </div>
    );
  }

  // Submitted success state
  if (submitted) {
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
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <img
            src="/images/zander-logo-color.svg"
            alt="Zander"
            style={{ width: '160px', height: 'auto' }}
          />
        </nav>

        <div style={{
          maxWidth: '500px',
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
            Thank You!
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            marginBottom: '1.5rem',
          }}>
            Your feedback has been submitted successfully.
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.95rem',
          }}>
            Your input helps us improve and deliver better results for future clients.
          </p>
        </div>
      </div>
    );
  }

  // Main survey form
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
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <img
          src="/images/zander-logo-color.svg"
          alt="Zander"
          style={{ width: '160px', height: 'auto' }}
        />
      </nav>

      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '3rem 2rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
            Feedback Survey
          </span>

          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            How was your experience?
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1rem',
            lineHeight: 1.7,
          }}>
            {surveyContext?.companyName && (
              <span style={{ color: '#FFFFFF' }}>{surveyContext.companyName}</span>
            )}
            {surveyContext?.packageType && (
              <span> &bull; {surveyContext.packageType} Package</span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* NPS Score */}
          <div style={{
            background: '#0E1017',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}>
              How likely are you to recommend {surveyContext?.consultantName || 'this consultant'} to a colleague?
            </label>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
            }}>
              0 = Not at all likely &nbsp;&bull;&nbsp; 10 = Extremely likely
            </p>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setNpsScore(score)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    border: npsScore === score
                      ? '2px solid #00CFEB'
                      : '1px solid rgba(255,255,255,0.15)',
                    background: npsScore === score
                      ? 'rgba(0,207,235,0.15)'
                      : 'rgba(255,255,255,0.03)',
                    color: npsScore === score ? '#00CFEB' : 'rgba(255,255,255,0.7)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Most Valuable */}
          <div style={{
            background: '#0E1017',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}>
              What was most valuable about this engagement?
            </label>
            <textarea
              value={mostValuable}
              onChange={(e) => setMostValuable(e.target.value)}
              placeholder="Tell us what worked well..."
              rows={3}
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
              }}
            />
          </div>

          {/* Improvements */}
          <div style={{
            background: '#0E1017',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}>
              What could be improved?
            </label>
            <textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="Any suggestions for improvement..."
              rows={3}
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
              }}
            />
          </div>

          {/* Testimonial Consent */}
          <div style={{
            background: '#0E1017',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={testimonialConsent}
                onChange={(e) => setTestimonialConsent(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '2px',
                  accentColor: '#00CFEB',
                }}
              />
              <span style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
              }}>
                I'm open to being contacted about providing a testimonial.
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {' '}(Optional - we may reach out if you had a great experience)
                </span>
              </span>
            </label>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || npsScore === null}
            style={{
              width: '100%',
              padding: '1.25rem 2rem',
              background: submitting || npsScore === null
                ? 'rgba(0,207,235,0.3)'
                : '#00CFEB',
              border: 'none',
              borderRadius: '12px',
              color: submitting || npsScore === null ? 'rgba(0,0,0,0.5)' : '#000',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: submitting || npsScore === null ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>

          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.85rem',
          }}>
            Your responses are confidential and help us improve.
          </p>
        </form>
      </div>
    </div>
  );
}
