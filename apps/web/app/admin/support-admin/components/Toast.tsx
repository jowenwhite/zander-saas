'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

const typeConfig = {
  success: { bg: '#0d4a1a', border: '#28a745', icon: '*', color: '#28a745' },
  error: { bg: '#4a0d0d', border: '#dc3545', icon: 'x', color: '#dc3545' },
  warning: { bg: '#4a3d0d', border: '#ffc107', icon: '!', color: '#ffc107' },
  info: { bg: '#0d2a4a', border: '#00CCEE', icon: 'i', color: '#00CCEE' },
};

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const config = typeConfig[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '8px',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: 2000,
        animation: 'slideIn 0.3s ease',
      }}
    >
      <span
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: config.border + '33',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: config.color,
          fontWeight: '700',
        }}
      >
        {config.icon}
      </span>
      <span style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#8888A0',
          cursor: 'pointer',
          fontSize: '1.25rem',
          padding: '0 0.25rem',
          marginLeft: '0.5rem',
        }}
      >
        x
      </button>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
