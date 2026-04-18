'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stripePriceId: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'operations-playbook',
    name: 'Operations Playbook',
    price: 79,
    description: 'The complete system for organizing your business operations. Includes SOPs, checklists, and templates for daily, weekly, and monthly rhythms.',
    stripePriceId: 'price_1TN9EjCryiiyM4ce1JuVPzP7',
  },
  {
    id: 'startup-foundations-kit',
    name: 'Startup Foundations Kit',
    price: 99,
    description: 'Everything you need to launch with structure. Business plan templates, legal checklists, financial projections, and go-to-market frameworks.',
    stripePriceId: 'price_1TN9KECryiiyM4ce4GUDL3G0',
  },
  {
    id: 'sales-marketing-kit',
    name: 'Sales and Marketing Kit',
    price: 99,
    description: 'Build your pipeline and brand. Includes email sequences, social media calendars, lead scoring systems, and sales scripts.',
    stripePriceId: 'price_1TN9LdCryiiyM4cedyseEGCe',
  },
  {
    id: 'hiring-team-building-kit',
    name: 'Hiring and Team Building Kit',
    price: 99,
    description: 'Recruit, onboard, and retain great people. Job description templates, interview guides, onboarding checklists, and performance frameworks.',
    stripePriceId: 'price_1TN9NfCryiiyM4ceJhjP9acm',
  },
  {
    id: 'financial-clarity-kit',
    name: 'Financial Clarity Kit',
    price: 79,
    description: 'Take control of your numbers. Cash flow templates, budgeting frameworks, pricing calculators, and financial dashboards.',
    stripePriceId: 'price_1TN9OeCryiiyM4ceegNAxeI5',
  },
  {
    id: 'industry-starter-packs',
    name: 'Industry Starter Packs',
    price: 149,
    description: 'Pre-built systems for specific industries. Choose from construction, professional services, retail, or e-commerce bundles.',
    stripePriceId: 'price_1TN9PrCryiiyM4cetv9u1wIM',
  },
];

export default function StorePage() {
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);

  const handlePurchase = async (product: Product) => {
    if (!product.stripePriceId) {
      alert('This product is coming soon. Check back later!');
      return;
    }

    setLoadingProduct(product.id);
    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: product.stripePriceId }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Unable to start checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingProduct(null);
    }
  };

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
          href="/login"
          style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Sign In
        </a>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
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
          Operating Simply Resources
        </span>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em',
        }}>
          Downloadable tools for<br />
          <span style={{ color: '#00CFEB' }}>running your business better</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.7,
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          Templates, playbooks, and systems built from decades of real-world business experience.
          Each resource is designed to help you get organized, stay consistent, and move forward.
        </p>
      </section>

      {/* Products Grid */}
      <section style={{
        padding: '2rem 2rem 5rem',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}>
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              style={{
                background: '#0E1017',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,207,235,0.4)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,207,235,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
                color: '#FFFFFF',
              }}>
                {product.name}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.65,
                marginBottom: '1.5rem',
                flex: 1,
              }}>
                {product.description}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
              }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#00CFEB',
                }}>
                  ${product.price}
                </span>
                <button
                  onClick={() => handlePurchase(product)}
                  disabled={loadingProduct === product.id}
                  style={{
                    background: product.stripePriceId ? '#00CFEB' : 'rgba(255,255,255,0.1)',
                    color: product.stripePriceId ? '#000' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: product.stripePriceId ? 'pointer' : 'default',
                    transition: 'opacity 0.2s ease',
                    opacity: loadingProduct === product.id ? 0.7 : 1,
                  }}
                >
                  {loadingProduct === product.id ? 'Loading...' : product.stripePriceId ? 'Purchase' : 'Coming Soon'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consulting Preview Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(180deg, rgba(0,207,235,0.02) 0%, rgba(0,207,235,0.06) 50%, rgba(0,207,235,0.02) 100%)',
        borderTop: '1px solid rgba(0,207,235,0.1)',
        borderBottom: '1px solid rgba(0,207,235,0.1)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(0,207,235,0.15)',
              border: '1px solid rgba(0,207,235,0.4)',
              color: '#00CFEB',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>
              Expert Guidance
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}>
              Need a Partner, Not Just a Playbook?
            </h2>
            <p style={{
              fontSize: '1.15rem',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              Our digital products give you the systems. Operating Simply Consulting gives you
              a partner who works alongside you to assess, organize, and transform your business operations.
            </p>
          </div>

          {/* Consulting Packages Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}>
            {/* Business Analysis */}
            <div style={{
              background: 'rgba(14, 16, 23, 0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1.75rem',
              transition: 'border-color 0.2s ease',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(0,207,235,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '1.5rem',
              }}>
                📊
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: '#FFFFFF',
              }}>
                Business Analysis
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
              }}>
                Comprehensive assessment and Operating Simply Scorecard baseline with written recommendations.
              </p>
            </div>

            {/* Compass */}
            <div style={{
              background: 'rgba(14, 16, 23, 0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1.75rem',
              transition: 'border-color 0.2s ease',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(0,207,235,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '1.5rem',
              }}>
                🧭
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: '#FFFFFF',
              }}>
                Compass
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
              }}>
                Strategic direction setting, priority identification, and a clear 90-day action plan.
              </p>
            </div>

            {/* Foundation */}
            <div style={{
              background: 'rgba(14, 16, 23, 0.8)',
              border: '1px solid rgba(0,207,235,0.3)',
              borderRadius: '12px',
              padding: '1.75rem',
              position: 'relative',
              transition: 'border-color 0.2s ease',
            }}>
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '16px',
                background: '#00CFEB',
                color: '#000',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '50px',
              }}>
                Popular
              </span>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(0,207,235,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '1.5rem',
              }}>
                🏗️
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: '#FFFFFF',
              }}>
                Foundation
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
              }}>
                Full operational foundation build with SOPs, process documentation, and team alignment.
              </p>
            </div>

            {/* Blueprint */}
            <div style={{
              background: 'rgba(14, 16, 23, 0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1.75rem',
              transition: 'border-color 0.2s ease',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(0,207,235,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '1.5rem',
              }}>
                🗺️
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: '#FFFFFF',
              }}>
                Blueprint
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
              }}>
                Complete business transformation with all Foundation deliverables plus ongoing strategic partnership.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center' }}>
            <a
              href="/consulting"
              style={{
                display: 'inline-block',
                background: '#00CFEB',
                color: '#000',
                padding: '16px 32px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '1.125rem',
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
            >
              Explore Consulting
            </a>
            <p style={{
              marginTop: '1rem',
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.45)',
            }}>
              Learn about the methodology, packages, and how we work together.
            </p>
          </div>
        </div>
      </section>

      {/* Book Placeholder Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <div style={{
          background: '#0E1017',
          border: '2px dashed rgba(0,207,235,0.3)',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(0,207,235,0.1)',
            color: '#00CFEB',
            padding: '6px 14px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            Coming Soon
          </span>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#FFFFFF',
          }}>
            &quot;Well Shit&quot; - The Book
          </h3>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            A no-nonsense guide to running a business when things get real.
            Sign up to be notified when it launches.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.35)',
          margin: 0,
        }}>
          &copy; 2026 Zander Systems LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
