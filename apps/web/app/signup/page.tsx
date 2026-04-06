'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Stripe price IDs for each tier
const TIER_PRICE_MAP: Record<string, string> = {
  STARTER: 'price_1THMKiCryiiyM4ceRYP44O8T',
  PRO: 'price_1THMKiCryiiyM4ceQjddUKNI',
  BUSINESS: 'price_1THMKjCryiiyM4ceaJIYMyfI',
};

const TIER_DISPLAY_NAMES: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  BUSINESS: 'Business',
};

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier');
  const selectedTier = tierParam?.toUpperCase() || null;

  // Only consider it a valid tier if it exists in our price map
  const hasValidTier = selectedTier !== null && TIER_PRICE_MAP[selectedTier] !== undefined;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      // Create user account
      const response = await fetch('https://api.zanderos.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          password,
          companyName: company,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Now login to get token
      const loginResponse = await fetch('https://api.zanderos.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.token) {
        // Store token and user
        localStorage.setItem('zander_token', loginData.token);
        localStorage.setItem('zander_user', JSON.stringify(loginData.user));

        // If a valid tier was selected, redirect to Stripe checkout
        if (hasValidTier && selectedTier) {
          setCheckoutLoading(true);
          try {
            const checkoutResponse = await fetch('https://api.zanderos.com/billing/checkout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
              },
              body: JSON.stringify({
                priceId: TIER_PRICE_MAP[selectedTier],
                cohort: 'founding',
                successUrl: `${window.location.origin}/upgrade-success?tier=${selectedTier}`,
                cancelUrl: `${window.location.origin}/settings?tab=billing&canceled=true`,
              })
            });

            const checkoutData = await checkoutResponse.json();

            if (checkoutData.url) {
              // Redirect to Stripe Checkout
              window.location.href = checkoutData.url;
              return;
            } else {
              // Checkout creation failed, go to dashboard anyway
              console.error('Checkout URL not returned:', checkoutData);
              router.push('/');
            }
          } catch (checkoutErr) {
            console.error('Checkout redirect failed:', checkoutErr);
            // Still go to dashboard if checkout fails
            router.push('/');
          }
        } else {
          // No tier selected, redirect to dashboard (FREE account)
          router.push('/');
        }
      } else {
        // Account created but login failed - send to login page
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
      setCheckoutLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navy Sidebar */}
      <div style={{
        width: '33.333%',
        background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 40px 20px 40px',
        color: 'white'
      }}>
        <div style={{
          textAlign: 'center',
          width: '100%',
          padding: '40px 20px 24px 20px'
        }}>
          <img
            src="/images/zander-logo.svg"
            alt="Zander"
            style={{
              width: '500px',
              height: 'auto',
              display: 'block',
              margin: '0 auto'
            }}
          />
          <p style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: '#F0F0F5',
            textAlign: 'center',
            marginTop: '20px',
            lineHeight: '1.4'
          }}>
            Your AI-Powered Executive Team
          </p>
        </div>

        {/* Hamilton Quote */}
        <div style={{ marginTop: 'auto' }}>
          <blockquote style={{
            fontStyle: 'italic',
            fontSize: '1.05rem',
            color: '#8888A0',
            marginBottom: '1.5rem',
            lineHeight: 1.7,
            borderLeft: '3px solid #00CCEE',
            paddingLeft: '1rem'
          }}>
            "Commerce is the great engine of social progress, transforming individual potential into collective achievement."
          </blockquote>
          <p style={{ fontWeight: '600', margin: 0, fontSize: '1rem', color: '#00CCEE' }}>— Alexander Hamilton</p>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '0.9rem', color: '#55556A', marginTop: '2rem' }}>
          © 2026 Zander Systems LLC
        </div>
      </div>

      {/* Signup Form */}
      <div style={{
        width: '66.667%',
        background: '#09090F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '630px', padding: '2rem' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '0.75rem',
            color: '#F0F0F5'
          }}>Create Your Account</h2>
          <p style={{ marginBottom: '1.5rem', color: '#8888A0', fontSize: '1.3rem' }}>
            Start transforming your business with Zander
          </p>

          {hasValidTier && selectedTier && (
            <div style={{
              background: 'rgba(0, 204, 238, 0.1)',
              border: '1px solid rgba(0, 204, 238, 0.3)',
              borderRadius: '8px',
              padding: '1.125rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <span style={{ color: '#00CCEE', fontSize: '1.8rem' }}>✓</span>
              <span style={{ color: '#F0F0F5', fontSize: '1.3rem' }}>
                You selected <strong style={{ color: '#00CCEE' }}>{TIER_DISPLAY_NAMES[selectedTier]}</strong> — you'll complete payment after signup
              </span>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(0, 204, 238, 0.1)',
              border: '1px solid #00CCEE',
              color: '#00CCEE',
              padding: '1.125rem 1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              fontSize: '1.3rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#F0F0F5',
                  marginBottom: '0.75rem'
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="First Name"
                  style={{
                    width: '100%',
                    padding: '1.125rem 1.5rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    fontSize: '1.5rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#F0F0F5',
                  marginBottom: '0.75rem'
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Last Name"
                  style={{
                    width: '100%',
                    padding: '1.125rem 1.5rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    fontSize: '1.5rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#F0F0F5',
                marginBottom: '0.75rem'
              }}>
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '1.125rem 1.5rem',
                  border: '2px solid #2A2A38',
                  borderRadius: '8px',
                  fontSize: '1.5rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#F0F0F5',
                marginBottom: '0.75rem'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                style={{
                  width: '100%',
                  padding: '1.125rem 1.5rem',
                  border: '2px solid #2A2A38',
                  borderRadius: '8px',
                  fontSize: '1.5rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#F0F0F5',
                marginBottom: '0.75rem'
              }}>
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                placeholder="Your company"
                style={{
                  width: '100%',
                  padding: '1.125rem 1.5rem',
                  border: '2px solid #2A2A38',
                  borderRadius: '8px',
                  fontSize: '1.5rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || checkoutLoading}
              style={{
                width: '100%',
                padding: '1.3rem 1.5rem',
                background: (loading || checkoutLoading) ? '#555' : '#00CCEE',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.5rem',
                fontWeight: '600',
                cursor: (loading || checkoutLoading) ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 6px rgba(0, 204, 238, 0.2)',
                marginBottom: '2rem'
              }}
              onMouseOver={(e) => {
                if (!loading && !checkoutLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 204, 238, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 204, 238, 0.2)';
              }}
            >
              {checkoutLoading ? 'Redirecting to Payment...' : loading ? 'Creating Account...' : hasValidTier ? 'Create Account & Continue to Payment' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.3rem', color: '#8888A0' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#00CCEE', textDecoration: 'none', fontWeight: '600' }}>
                Sign in
              </a>
            </p>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: '#ADB5BD' }}>
              By creating an account, you agree to our{' '}
              <a href="https://zanderos.com/terms" style={{ color: '#8888A0' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="https://zanderos.com/privacy" style={{ color: '#8888A0' }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap SignupContent in Suspense to handle useSearchParams
export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#09090F' }} />}>
      <SignupContent />
    </Suspense>
  );
}
