'use client';
import { CSSProperties } from 'react';
import { EmailBlock, SocialLink } from '../../types';

interface SocialBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
}

const socialIcons: Record<string, string> = {
  facebook: '📘',
  twitter: '🐦',
  instagram: '📷',
  linkedin: '💼',
  youtube: '📺',
  tiktok: '🎵',
};

export default function SocialBlock({ block, isSelected, onSelect }: SocialBlockProps) {
  const { content, settings } = block;
  const padding = settings.padding || { top: 25, right: 40, bottom: 25, left: 40 };
  const links: SocialLink[] = content.links || [];
  const iconSize = settings.iconSize || 'medium';

  const getIconSize = () => {
    switch (iconSize) {
      case 'small':
        return '1.25rem';
      case 'large':
        return '2.5rem';
      default:
        return '1.75rem';
    }
  };

  return (
    <div
      style={{
        ...containerStyle,
        backgroundColor: settings.backgroundColor || '#f8f8f8',
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        textAlign: (settings.alignment as 'left' | 'center' | 'right') || 'center',
        outline: isSelected ? '2px solid var(--zander-blue)' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {links.length > 0 ? (
        <div style={linksContainerStyle}>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              style={{
                fontSize: getIconSize(),
                textDecoration: 'none',
              }}
              onClick={(e) => e.preventDefault()}
            >
              {socialIcons[link.platform] || '🔗'}
            </a>
          ))}
        </div>
      ) : (
        <div style={placeholderStyle}>
          <span style={{ fontSize: '1.5rem' }}>🔗</span>
          <span style={placeholderTextStyle}>Add social links</span>
        </div>
      )}
    </div>
  );
}

const containerStyle: CSSProperties = {
  cursor: 'pointer',
  transition: 'outline 0.15s ease',
};

const linksContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
};

const placeholderStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '1rem',
  backgroundColor: 'var(--zander-off-white)',
  borderRadius: '8px',
  border: '2px dashed var(--zander-border-gray)',
};

const placeholderTextStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--zander-gray)',
};
