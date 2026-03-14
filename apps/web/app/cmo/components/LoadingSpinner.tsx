'use client';
import { CSSProperties } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  message = 'Loading...',
  fullPage = false
}: LoadingSpinnerProps) {
  const containerStyle: CSSProperties = fullPage
    ? {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1C1C26',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
      };

  const spinnerStyle: CSSProperties = {
    width: '48px',
    height: '48px',
    border: '4px solid var(--zander-border-gray)',
    borderTopColor: '#F57C00',
    borderRadius: '50%',
    animation: 'cmo-spin 1s linear infinite',
    marginBottom: '1rem',
  };

  return (
    <>
      <style>
        {`
          @keyframes cmo-spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={spinnerStyle} />
          <div style={{ color: '#8888A0', fontSize: '1rem' }}>
            {message}
          </div>
        </div>
      </div>
    </>
  );
}
