'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

        // Redirect to dashboard (onboarding wizard will show there)
        router.push('/');
      } else {
        // Account created but login failed - send to login page
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
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
            "Commerce is the great engine of social progress, transforming individual potential into collective achievement."
          </blockquote>
          <p style={{ fontWeight: '600', margin: 0, color: '#F0B323' }}>— Alexander Hamilton</p>
        </div>

        {/* 64 West Branding */}
        <div style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '2rem' }}>
          By 64 West Capital Partners
        </div>
      </div>

      {/* Signup Form */}
      <div style={{
        width: '66.667%',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: '#0C2340'
          }}>Create Your Account</h2>
          <p style={{ marginBottom: '2rem', color: '#6C757D' }}>
            Start transforming your business with Zander
          </p>

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#343A40',
                  marginBottom: '0.5rem'
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
                    padding: '0.75rem 1rem',
                    border: '2px solid #DEE2E6',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#343A40',
                  marginBottom: '0.5rem'
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
                    padding: '0.75rem 1rem',
                    border: '2px solid #DEE2E6',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#343A40',
                marginBottom: '0.5rem'
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
                  padding: '0.75rem 1rem',
                  border: '2px solid #DEE2E6',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
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
                minLength={8}
                placeholder="Minimum 8 characters"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #DEE2E6',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
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
                  padding: '0.75rem 1rem',
                  border: '2px solid #DEE2E6',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #BF0A30 0%, #A00A28 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '1.5rem'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6C757D' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#BF0A30', textDecoration: 'none', fontWeight: '600' }}>
                Sign in
              </a>
            </p>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#ADB5BD' }}>
              By creating an account, you agree to our{' '}
              <a href="/legal/terms" style={{ color: '#6C757D' }}>Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
