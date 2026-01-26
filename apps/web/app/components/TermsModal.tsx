'use client';

import React, { useState, useEffect, CSSProperties } from 'react';

interface TermsModalProps {
  isOpen: boolean;
  currentVersion: string | null;
  onAccept: () => void;
  onClose?: () => void;
}

export default function TermsModal({ isOpen, currentVersion, onAccept, onClose }: TermsModalProps) {
  const [termsContent, setTermsContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    if (isOpen && currentVersion) {
      fetchTerms();
    }
  }, [isOpen, currentVersion]);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.zanderos.com/legal/terms`);
      const data = await response.json();

      if (data.content) {
        setTermsContent(data.content);
      } else {
        setTermsContent('Terms and conditions are not available at this time.');
      }
    } catch (err) {
      setError('Failed to load terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!currentVersion) return;

    setAccepting(true);
    setError('');

    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch('https://api.zanderos.com/legal/terms/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ version: currentVersion })
      });

      if (response.ok) {
        onAccept();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to accept terms');
      }
    } catch (err) {
      setError('Failed to accept terms. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  if (!isOpen) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  };

  const modalStyle: CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
  };

  const headerStyle: CSSProperties = {
    padding: '1.5rem',
    borderBottom: '1px solid #DEE2E6'
  };

  const contentStyle: CSSProperties = {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
    fontSize: '0.9375rem',
    lineHeight: 1.7,
    color: '#343A40'
  };

  const footerStyle: CSSProperties = {
    padding: '1.5rem',
    borderTop: '1px solid #DEE2E6',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const buttonStyle: CSSProperties = {
    padding: '0.875rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: hasScrolledToBottom && !accepting ? 'pointer' : 'not-allowed',
    border: 'none',
    background: hasScrolledToBottom && !accepting ? 'linear-gradient(135deg, #BF0A30 0%, #A00A28 100%)' : '#ccc',
    color: 'white',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0C2340' }}>
            Terms of Service
          </h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#6C757D' }}>
            Please read and accept our terms to continue {currentVersion && `(Version ${currentVersion})`}
          </p>
        </div>

        <div style={contentStyle} onScroll={handleScroll}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading terms...</p>
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: termsContent.replace(/\n/g, '<br/>') }}
              style={{ whiteSpace: 'pre-wrap' }}
            />
          )}
        </div>

        <div style={footerStyle}>
          {error && (
            <div style={{
              background: 'rgba(191, 10, 48, 0.1)',
              border: '1px solid #BF0A30',
              color: '#BF0A30',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {!hasScrolledToBottom && (
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6C757D', textAlign: 'center' }}>
              Please scroll to read the full terms before accepting
            </p>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'white',
                  color: '#6C757D',
                  border: '2px solid #DEE2E6'
                }}
              >
                Decline
              </button>
            )}
            <button
              onClick={handleAccept}
              disabled={!hasScrolledToBottom || accepting}
              style={{
                ...buttonStyle,
                flex: onClose ? 1 : undefined,
                width: onClose ? undefined : '100%'
              }}
            >
              {accepting ? 'Accepting...' : 'I Accept the Terms'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
