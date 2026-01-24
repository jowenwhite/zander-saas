'use client';
import { ReactNode, CSSProperties } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  icon,
  fullWidth = false,
  type = 'button'
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
  };

  const sizeStyles: Record<ButtonSize, CSSProperties> = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
  };

  const variantStyles: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: '#F57C00',
      color: 'white',
    },
    secondary: {
      background: 'white',
      color: 'var(--zander-navy)',
      border: '2px solid var(--zander-navy)',
    },
    danger: {
      background: 'var(--zander-red)',
      color: 'white',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--zander-gray)',
      border: '2px solid var(--zander-border-gray)',
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
