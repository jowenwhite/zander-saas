'use client';

import React, { useState, useEffect, CSSProperties } from 'react';
import Link from 'next/link';

export default function TermsPage() {
  const [terms, setTerms] = useState<{
    version: string | null;
    content: string | null;
    effectiveDate: string | null;
  }>({ version: null, content: null, effectiveDate: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await fetch('https://api.zanderos.com/legal/terms');
      const data = await response.json();
      setTerms(data);
    } catch (err) {
      setError('Failed to load terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    background: '#F8F9FA'
  };

  const headerStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #0C2340 0%, #1a3a5c 100%)',
    color: 'white',
    padding: '2rem'
  };

  const headerContentStyle: CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto'
  };

  const contentStyle: CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    background: 'white',
    minHeight: '60vh'
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <Link href="/" style={{
            color: '#F0B323',
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            &larr; Back to Zander
          </Link>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
            Terms of Service
          </h1>
          {terms.version && (
            <p style={{ margin: '0.5rem 0 0', opacity: 0.8, fontSize: '0.9375rem' }}>
              Version {terms.version} &bull; Effective {formatDate(terms.effectiveDate)}
            </p>
          )}
        </div>
      </div>

      <div style={contentStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#6C757D' }}>Loading terms...</p>
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem'
          }}>
            <p style={{ color: '#BF0A30' }}>{error}</p>
            <button
              onClick={fetchTerms}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#0C2340',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : !terms.content ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#6C757D' }}>
              No terms and conditions have been published yet.
            </p>
          </div>
        ) : (
          <div style={{
            fontSize: '0.9375rem',
            lineHeight: 1.8,
            color: '#343A40',
            whiteSpace: 'pre-wrap'
          }}>
            <div dangerouslySetInnerHTML={{ __html: terms.content.replace(/\n/g, '<br/>') }} />
          </div>
        )}
      </div>

      <footer style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#6C757D'
      }}>
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} 64 West Holdings LLC. All rights reserved.
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>
          Questions? Contact us at{' '}
          <a href="mailto:legal@zanderos.com" style={{ color: '#BF0A30' }}>
            legal@zanderos.com
          </a>
        </p>
      </footer>
    </div>
  );
}
