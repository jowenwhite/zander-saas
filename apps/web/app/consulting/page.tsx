'use client';

import { useState } from 'react';

// Operating Simply 4 Pillars
const PILLARS = [
  {
    name: 'People',
    description: 'Build and align your team. Define roles, responsibilities, and culture.',
    icon: '👥',
  },
  {
    name: 'Products',
    description: 'Clarify what you sell and how you deliver value to customers.',
    icon: '📦',
  },
  {
    name: 'Projects',
    description: 'Organize your work into manageable, trackable initiatives.',
    icon: '📋',
  },
  {
    name: 'Production',
    description: 'Systematize your operations for consistent, quality output.',
    icon: '⚙️',
  },
];

// 10-Pillar Scorecard
const SCORECARD_PILLARS = [
  { name: 'Vision', description: 'Clear direction and future state' },
  { name: 'Mission', description: 'Purpose and core activities' },
  { name: 'Values', description: 'Guiding principles and beliefs' },
  { name: 'Strategy', description: 'Approach to achieving goals' },
  { name: 'People', description: 'Team building and culture' },
  { name: 'Process', description: 'Operations and workflows' },
  { name: 'Product', description: 'Offerings and quality' },
  { name: 'Finance', description: 'Financial health and management' },
  { name: 'Marketing', description: 'Brand and customer acquisition' },
  { name: 'Growth', description: 'Scaling and expansion capacity' },
];

// Consulting Packages
const PACKAGES = [
  {
    name: 'Business Analysis',
    price: '$500',
    description: 'Comprehensive business assessment, Operating Simply Scorecard baseline, written analysis with recommendations.',
    featured: false,
  },
  {
    name: 'Compass',
    price: '$2,500',
    hours: '10 hours',
    description: 'Strategic direction setting, priority identification, 90-day action plan.',
    featured: false,
  },
  {
    name: 'Foundation',
    price: '$4,500',
    hours: '20 hours',
    description: 'Full operational foundation build, SOPs, process documentation, team alignment.',
    featured: true,
  },
  {
    name: 'Blueprint',
    price: '$8,000',
    hours: '40 hours',
    description: 'Complete business transformation, all Foundation deliverables plus ongoing strategic partnership.',
    featured: false,
  },
  {
    name: 'Extension',
    price: '$250',
    hours: '3-month timeline extension',
    description: 'Continue working together after any package. Extend your engagement timeline.',
    featured: false,
  },
  {
    name: 'Ad Hoc',
    price: '$250/hour',
    description: 'Flexible support via invoice. Schedule sessions as needed.',
    featured: false,
  },
];

// Process Steps
const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Define',
    description: 'We start with a comprehensive intake to understand your business, challenges, and goals.',
  },
  {
    num: '02',
    title: 'Engage',
    description: 'Collaborative working sessions where we build systems, solve problems, and document processes.',
  },
  {
    num: '03',
    title: 'Transform',
    description: 'Implementation of new structures, habits, and tools that create lasting operational change.',
  },
  {
    num: '04',
    title: 'Graduate',
    description: 'You emerge with documented systems, clear direction, and the confidence to execute independently.',
  },
];

// Inquiry form state and handlers
function useInquiryForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    interestedPackage: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consulting/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', company: '', phone: '', interestedPackage: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Unable to submit. Please email jonathan@zanderos.com directly.');
    }
  };

  return { formData, setFormData, status, errorMessage, handleSubmit };
}

export default function ConsultingPage() {
  const { formData, setFormData, status, errorMessage, handleSubmit } = useInquiryForm();

  return (
    <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: '#080A0F',
        color: '#FFFFFF',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {/* Navigation - Minimal, no external links */}
        <nav style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          <a href="/" style={{ display: 'block', textDecoration: 'none' }}>
            <img
              src="/images/zander-logo-color.svg"
              alt="Zander"
              style={{ width: '180px', height: 'auto' }}
            />
          </a>
          <a
            href="mailto:jonathan@zanderos.com"
            style={{
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            jonathan@zanderos.com
          </a>
        </nav>

        {/* Hero Section */}
        <section style={{
          padding: '5rem 2rem 4rem',
          textAlign: 'center',
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
        }}>
          {/* Gradient background effect */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,207,235,0.1) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(0,207,235,0.1)',
              border: '1px solid rgba(0,207,235,0.3)',
              color: '#00CFEB',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>
              Private Consulting Services
            </span>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}>
              Operating Simply Consulting
            </h1>

            <p style={{
              fontSize: '1.5rem',
              color: '#00CFEB',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}>
              by Zander Systems
            </p>

            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
              maxWidth: '800px',
              margin: '0 auto 2rem',
            }}>
              Expert guidance to organize, optimize, and grow your business. The Operating Simply methodology
              brings clarity to your operations through hands-on advisory work that creates lasting systems and structures.
            </p>

            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.7,
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              This isn&apos;t consulting that leaves you with a deck and disappears.
              We work alongside you to implement real systems, solve real problems, and build an operation that runs without you in every decision.
            </p>
          </div>
        </section>

        {/* Section Divider */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,207,235,0.4) 50%, transparent 100%)',
          maxWidth: '600px',
          margin: '0 auto',
        }} />

        {/* Operating Simply Framework - 4 Pillars */}
        <section style={{
          padding: '5rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#00CFEB',
              marginBottom: '12px',
              display: 'block',
            }}>
              The Framework
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}>
              Operating Simply
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              Every business can be understood through four pillars. Process isn&apos;t a pillar — it&apos;s the philosophy,
              methodology, and software that connects them all.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {PILLARS.map((pillar) => (
              <div
                key={pillar.name}
                style={{
                  background: '#0E1017',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                }}>
                  {pillar.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: '#00CFEB',
                }}>
                  {pillar.name}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.6,
                }}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section Divider */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,207,235,0.4) 50%, transparent 100%)',
          maxWidth: '600px',
          margin: '0 auto',
        }} />

        {/* 10-Pillar Scorecard */}
        <section style={{
          padding: '5rem 2rem',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,207,235,0.03) 50%, transparent 100%)',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#00CFEB',
                marginBottom: '12px',
                display: 'block',
              }}>
                Assessment Tool
              </span>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}>
                The 10-Pillar Scorecard
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: 1.7,
              }}>
                Every engagement begins with scoring your business across ten dimensions.
                Each pillar is rated 1-10, creating your baseline and guiding the entire engagement.
              </p>
            </div>

            {/* Scorecard Visual - Grid with radar-like layout */}
            <div style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2.5rem',
              maxWidth: '900px',
              margin: '0 auto',
            }}>
              {/* Score indicators grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '1rem',
              }}>
                {SCORECARD_PILLARS.map((pillar, index) => (
                  <div
                    key={pillar.name}
                    style={{
                      textAlign: 'center',
                      padding: '1rem 0.5rem',
                      borderRadius: '8px',
                      background: 'rgba(0,207,235,0.05)',
                      border: '1px solid rgba(0,207,235,0.2)',
                    }}
                  >
                    {/* Score circle */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(0,207,235,0.3) 0%, rgba(0,207,235,0.1) 100%)',
                      border: '2px solid #00CFEB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#00CFEB',
                    }}>
                      {index < 5 ? '?' : '?'}
                    </div>
                    <h4 style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: '0.25rem',
                    }}>
                      {pillar.name}
                    </h4>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.4,
                    }}>
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E' }} />
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Strong (8-10)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00CFEB' }} />
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Good (6-7)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Needs Work (4-5)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Critical (1-3)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,207,235,0.4) 50%, transparent 100%)',
          maxWidth: '600px',
          margin: '0 auto',
        }} />

        {/* Consulting Packages */}
        <section style={{
          padding: '5rem 2rem',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#00CFEB',
              marginBottom: '12px',
              display: 'block',
            }}>
              Engagement Options
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}>
              Consulting Packages
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Choose the engagement level that fits your needs. Every package includes direct access to your consultant.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  background: '#0E1017',
                  border: pkg.featured ? '2px solid #00CFEB' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {pkg.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#00CFEB',
                    color: '#000',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    padding: '4px 12px',
                    borderRadius: '50px',
                  }}>
                    Most Popular
                  </div>
                )}

                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  color: '#FFFFFF',
                }}>
                  {pkg.name}
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}>
                  <span style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: '#00CFEB',
                  }}>
                    {pkg.price}
                  </span>
                </div>

                {pkg.hours && (
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '1rem',
                  }}>
                    {pkg.hours}
                  </p>
                )}

                <p style={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.6,
                  flex: 1,
                  marginTop: pkg.hours ? '0' : '1rem',
                }}>
                  {pkg.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section Divider */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,207,235,0.4) 50%, transparent 100%)',
          maxWidth: '600px',
          margin: '0 auto',
        }} />

        {/* Our Process */}
        <section style={{
          padding: '5rem 2rem',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,207,235,0.03) 50%, transparent 100%)',
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#00CFEB',
                marginBottom: '12px',
                display: 'block',
              }}>
                How We Work
              </span>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}>
                Our Process
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '600px',
                margin: '0 auto',
              }}>
                Every engagement follows a structured path from discovery to independence.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}>
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.num}
                  style={{
                    background: '#0E1017',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '2rem',
                  }}
                >
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    color: 'rgba(0,207,235,0.3)',
                    marginBottom: '1rem',
                    lineHeight: 1,
                  }}>
                    {step.num}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    color: '#FFFFFF',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.6,
                  }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,207,235,0.4) 50%, transparent 100%)',
          maxWidth: '600px',
          margin: '0 auto',
        }} />

        {/* Inquiry Form Section */}
        <section id="inquiry" style={{
          padding: '5rem 2rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#00CFEB',
              marginBottom: '12px',
              display: 'block',
            }}>
              Get Started
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}>
              Send an Inquiry
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Tell me about your business and what you&apos;re looking to accomplish. I&apos;ll respond within 24 hours.
            </p>
          </div>

          {status === 'success' ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '16px',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#22C55E' }}>
                Inquiry Received
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                Thank you for reaching out. I&apos;ll review your message and respond within 24 hours.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                In the meantime, feel free to{' '}
                <a
                  href="https://calendly.com/jonathan-zanderos/discovery-call"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#00CFEB', textDecoration: 'none' }}
                >
                  book a discovery call
                </a>{' '}
                directly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2.5rem',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                {/* Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(0,207,235,0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(0,207,235,0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* Company */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(0,207,235,0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(0,207,235,0.5)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {/* Interested Package */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                }}>
                  Interested Package
                </label>
                <select
                  value={formData.interestedPackage}
                  onChange={(e) => setFormData({ ...formData, interestedPackage: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: formData.interestedPackage ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" style={{ background: '#0E1017' }}>Select a package (optional)</option>
                  <option value="Business Analysis" style={{ background: '#0E1017', color: '#FFFFFF' }}>Business Analysis — $500</option>
                  <option value="Compass" style={{ background: '#0E1017', color: '#FFFFFF' }}>Compass — $2,500 (10 hours)</option>
                  <option value="Foundation" style={{ background: '#0E1017', color: '#FFFFFF' }}>Foundation — $4,500 (20 hours)</option>
                  <option value="Blueprint" style={{ background: '#0E1017', color: '#FFFFFF' }}>Blueprint — $8,000 (40 hours)</option>
                  <option value="Not sure yet" style={{ background: '#0E1017', color: '#FFFFFF' }}>Not sure yet — Let&apos;s discuss</option>
                </select>
              </div>

              {/* Message */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                }}>
                  Tell me about your business and what you&apos;re looking to accomplish *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="What challenges are you facing? What would success look like for you?"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '120px',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(0,207,235,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  color: '#EF4444',
                  fontSize: '0.95rem',
                }}>
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '1rem 2rem',
                  background: status === 'submitting' ? 'rgba(0,207,235,0.5)' : '#00CFEB',
                  color: '#000',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {status === 'submitting' ? 'Sending...' : 'Send Inquiry'}
              </button>

              <p style={{
                textAlign: 'center',
                marginTop: '1rem',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.4)',
              }}>
                Or{' '}
                <a
                  href="https://calendly.com/jonathan-zanderos/discovery-call"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#00CFEB', textDecoration: 'none' }}
                >
                  book a discovery call
                </a>{' '}
                directly on my calendar.
              </p>
            </form>
          )}
        </section>

        {/* Section Divider */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,207,235,0.4) 50%, transparent 100%)',
          maxWidth: '600px',
          margin: '0 auto',
        }} />

        {/* CTA Section */}
        <section style={{
          padding: '6rem 2rem',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,207,235,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
            }}>
              Ready to build something<br />
              <span style={{ color: '#00CFEB' }}>that actually works?</span>
            </h2>

            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
            }}>
              Book a discovery call to discuss your business, explore whether consulting is the right fit,
              and learn how Operating Simply can bring clarity to your operations.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <a
                href="https://calendly.com/jonathan-zanderos/discovery-call"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: '#00CFEB',
                  color: '#000',
                  padding: '16px 40px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  textDecoration: 'none',
                }}
              >
                Book a Discovery Call
              </a>

              <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.5)',
              }}>
                or email directly: <a
                  href="mailto:jonathan@zanderos.com"
                  style={{ color: '#00CFEB', textDecoration: 'none' }}
                >
                  jonathan@zanderos.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '3rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            textAlign: 'center',
          }}>
            <img
              src="/images/zander-logo-color.svg"
              alt="Zander"
              style={{ width: '160px', height: 'auto' }}
            />

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2rem',
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.5)',
            }}>
              <span>jonathan@zanderos.com</span>
              <span>zanderos.com</span>
              <a
                href="https://calendly.com/jonathan-zanderos"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#00CFEB', textDecoration: 'none' }}
              >
                calendly.com/jonathan-zanderos
              </a>
            </div>

            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.35)',
              marginTop: '1rem',
            }}>
              &copy; 2026 Zander Systems LLC. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
  );
}
