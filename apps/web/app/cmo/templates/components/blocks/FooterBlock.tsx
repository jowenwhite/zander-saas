'use client';
import { CSSProperties } from 'react';
import { EmailBlock } from '../../types';

interface FooterBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
}

export default function FooterBlock({ block, isSelected, onSelect }: FooterBlockProps) {
  const { content, settings } = block;
  const padding = settings.padding || { top: 25, right: 40, bottom: 25, left: 40 };
  const textColor = settings.textColor || '#666666';
  const fontSize = settings.fontSize || 12;

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
      <div style={{ color: textColor, fontSize: `${fontSize}px`, lineHeight: '1.6' }}>
        {content.companyName && (
          <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>
            {content.companyName}
          </p>
        )}
        {content.address && (
          <p style={{ margin: '0 0 8px 0' }}>
            {content.address}
          </p>
        )}
        {content.customText && (
          <p style={{ margin: '0 0 8px 0' }}>
            {content.customText}
          </p>
        )}
        <p style={{ margin: 0 }}>
          <a
            href={content.unsubscribeUrl || '#'}
            style={{ color: textColor, textDecoration: 'underline' }}
            onClick={(e) => e.preventDefault()}
          >
            {content.unsubscribeText || 'Unsubscribe'}
          </a>
        </p>
      </div>
    </div>
  );
}

const containerStyle: CSSProperties = {
  cursor: 'pointer',
  transition: 'outline 0.15s ease',
};
