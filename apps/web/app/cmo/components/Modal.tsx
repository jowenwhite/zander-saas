'use client';
import { ReactNode, CSSProperties, useEffect } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeWidths: Record<ModalSize, string> = {
    sm: '400px',
    md: '500px',
    lg: '700px',
    xl: '900px',
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  };

  const modalStyle: CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    maxWidth: sizeWidths[size],
    width: '90%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
  };

  const headerStyle: CSSProperties = {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid var(--zander-border-gray)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const bodyStyle: CSSProperties = {
    padding: '2rem',
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyle: CSSProperties = {
    padding: '1rem 2rem',
    borderTop: '1px solid var(--zander-border-gray)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    background: 'var(--zander-off-white)',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--zander-navy)'
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{
                margin: '0.25rem 0 0 0',
                fontSize: '0.875rem',
                color: 'var(--zander-gray)'
              }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--zander-gray)',
              cursor: 'pointer',
              padding: '0.25rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div style={bodyStyle}>
          {children}
        </div>
        {footer && (
          <div style={footerStyle}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
