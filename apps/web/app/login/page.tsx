'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store the token
        localStorage.setItem('zander_token', data.token);
        localStorage.setItem('zander_user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push('/');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

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
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem', 
            color: '#0C2340' 
          }}>Welcome Back</h2>
          <p style={{ marginBottom: '2rem', color: '#6C757D' }}>
            Sign in to access your Zander dashboard
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
              <a href="#" style={{ 
                fontSize: '0.875rem', 
                color: '#BF0A30', 
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Forgot password?
              </a>
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
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 6px rgba(191, 10, 48, 0.2)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 8px rgba(191, 10, 48, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(191, 10, 48, 0.2)';
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6C757D' }}>
              Don't have an account?{' '}
              <a href="/signup" style={{ color: '#BF0A30', textDecoration: 'none', fontWeight: '600' }}>
                Sign up
              </a>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#F8F9FA',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#6C757D',
            border: '1px solid #DEE2E6'
          }}>
            <strong style={{ color: '#0C2340' }}>Demo Account:</strong><br />
            Email: test@example.com<br />
            Password: password123
          </div>
        </div>
      </div>
    </div>
  );
}
