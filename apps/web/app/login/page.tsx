'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TermsModal from '../components/TermsModal';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Terms acceptance state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsVersion, setTermsVersion] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://api.zanderos.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(requires2FA && twoFactorCode ? { twoFactorCode } : {})
        }),
      });

      const data = await response.json();

      // Check if 2FA is required
      if (data.requires2FA) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      if (response.ok && data.token) {
        // Store the token
        localStorage.setItem('zander_token', data.token);
        localStorage.setItem('zander_user', JSON.stringify(data.user));

        // Check if terms acceptance is required
        if (data.termsStatus?.needsAcceptance) {
          setTermsVersion(data.termsStatus.currentVersion);
          setShowTermsModal(true);
          setLoading(false);
          return;
        }

        // Redirect to dashboard
        router.push('/');
      } else {
        setError(data.message || 'Invalid email or password');
        // If 2FA code was wrong, let them try again
        if (requires2FA) {
          setTwoFactorCode('');
        }
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Go back to email/password entry
  const handleBack = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setError('');
  };

  // Handle terms acceptance
  const handleTermsAccepted = () => {
    setShowTermsModal(false);
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navy Sidebar */}
      <div style={{
        width: '33.333%',
        background: 'linear-gradient(135deg, #0C2340 0%, #1a3a5c 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        color: 'white'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>⚡</span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0, letterSpacing: '-1px' }}>ZANDER</h1>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: '300', opacity: 0.9, margin: 0 }}>
            Your AI-Powered Executive Team
          </p>
        </div>

        {/* Hamilton Quote */}
        <div style={{ marginTop: 'auto' }}>
          <blockquote style={{
            fontStyle: 'italic',
            fontSize: '1.125rem',
            opacity: 0.8,
            marginBottom: '1.5rem',
            lineHeight: 1.6,
            borderLeft: '3px solid #F0B323',
            paddingLeft: '1rem'
          }}>
            "The true direction of commerce is not just the exchange of goods, but the expansion of human potential through strategic innovation."
          </blockquote>
          <p style={{ fontWeight: '600', margin: 0, color: '#F0B323' }}>— Alexander Hamilton</p>
        </div>

        {/* 64 West Branding */}
        <div style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '2rem' }}>
          By 64 West Capital Partners
        </div>
      </div>

      {/* Login Form */}
      <div style={{
        width: '66.667%',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
          {!requires2FA ? (
            <>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#0C2340'
              }}>Welcome Back</h2>
              <p style={{ marginBottom: '2rem', color: '#6C757D' }}>
                Sign in to access your Zander dashboard
              </p>
            </>
          ) : (
            <>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#0C2340'
              }}>Two-Factor Authentication</h2>
              <p style={{ marginBottom: '2rem', color: '#6C757D' }}>
                Enter the 6-digit code from your authenticator app
              </p>
            </>
          )}

          {error && (
            <div style={{
              background: 'rgba(191, 10, 48, 0.1)',
              border: '1px solid #BF0A30',
              color: '#BF0A30',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!requires2FA ? (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#343A40',
                    marginBottom: '0.5rem'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #DEE2E6',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#BF0A30'}
                    onBlur={(e) => e.target.style.borderColor = '#DEE2E6'}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#343A40',
                    marginBottom: '0.5rem'
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #DEE2E6',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#BF0A30'}
                    onBlur={(e) => e.target.style.borderColor = '#DEE2E6'}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="remember"
                      style={{ width: '16px', height: '16px', accentColor: '#BF0A30' }}
                    />
                    <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#343A40' }}>
                      Remember me
                    </label>
                  </div>
                  <a href="/forgot-password" style={{
                    fontSize: '0.875rem',
                    color: '#BF0A30',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    Forgot password?
                  </a>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#343A40',
                    marginBottom: '0.5rem'
                  }}>
                    Authentication Code
                  </label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #DEE2E6',
                      borderRadius: '8px',
                      fontSize: '1.5rem',
                      textAlign: 'center',
                      letterSpacing: '8px',
                      fontWeight: '600',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#BF0A30'}
                    onBlur={(e) => e.target.style.borderColor = '#DEE2E6'}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6C757D',
                    border: '2px solid #DEE2E6',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  ← Back to login
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={loading || (requires2FA && twoFactorCode.length !== 6)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: (loading || (requires2FA && twoFactorCode.length !== 6)) ? '#ccc' : 'linear-gradient(135deg, #BF0A30 0%, #A00A28 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (loading || (requires2FA && twoFactorCode.length !== 6)) ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 6px rgba(191, 10, 48, 0.2)'
              }}
              onMouseOver={(e) => {
                if (!loading && !(requires2FA && twoFactorCode.length !== 6)) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 8px rgba(191, 10, 48, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(191, 10, 48, 0.2)';
              }}
            >
              {loading ? 'Verifying...' : (requires2FA ? 'Verify Code' : 'Sign In')}
            </button>
          </form>

          {!requires2FA && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6C757D' }}>
                Don't have an account?{' '}
                <a href="/signup" style={{ color: '#BF0A30', textDecoration: 'none', fontWeight: '600' }}>
                  Sign up
                </a>
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Terms Acceptance Modal */}
      <TermsModal
        isOpen={showTermsModal}
        currentVersion={termsVersion}
        onAccept={handleTermsAccepted}
      />
    </div>
  );
}
