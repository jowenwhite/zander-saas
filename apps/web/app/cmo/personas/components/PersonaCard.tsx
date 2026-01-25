'use client';
import { CSSProperties } from 'react';

interface Persona {
  id: string;
  name: string;
  avatar: string | null;
  tagline: string | null;
  isDefault: boolean;
  painPoints: string[];
  goals: string[];
  _count?: { contacts: number };
}

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onSelect: () => void;
}

export default function PersonaCard({
  persona,
  isSelected,
  onSelect,
}: PersonaCardProps) {
  return (
    <div
      style={{
        ...cardStyle,
        borderColor: isSelected ? 'var(--zander-blue)' : 'var(--zander-border-gray)',
        boxShadow: isSelected ? '0 0 0 2px var(--zander-blue)' : 'none',
      }}
      onClick={onSelect}
    >
      <div style={headerStyle}>
        <div style={avatarStyle}>
          {persona.avatar ? (
            <img
              src={persona.avatar}
              alt={persona.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            <span style={{ fontSize: '1.5rem' }}>
              {persona.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div style={nameContainerStyle}>
          <div style={nameRowStyle}>
            <h3 style={nameStyle}>{persona.name}</h3>
            {persona.isDefault && <span style={defaultBadgeStyle}>Default</span>}
          </div>
          {persona.tagline && <p style={taglineStyle}>{persona.tagline}</p>}
        </div>
      </div>

      {persona.painPoints.length > 0 && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Pain Points</span>
          <div style={tagsStyle}>
            {persona.painPoints.slice(0, 2).map((point, i) => (
              <span key={i} style={tagStyle}>{point}</span>
            ))}
            {persona.painPoints.length > 2 && (
              <span style={moreStyle}>+{persona.painPoints.length - 2}</span>
            )}
          </div>
        </div>
      )}

      {persona.goals.length > 0 && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Goals</span>
          <div style={tagsStyle}>
            {persona.goals.slice(0, 2).map((goal, i) => (
              <span key={i} style={{ ...tagStyle, backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                {goal}
              </span>
            ))}
            {persona.goals.length > 2 && (
              <span style={moreStyle}>+{persona.goals.length - 2}</span>
            )}
          </div>
        </div>
      )}

      <div style={footerStyle}>
        <span style={contactCountStyle}>
          {persona._count?.contacts || 0} contacts
        </span>
      </div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  border: '2px solid var(--zander-border-gray)',
  padding: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  marginBottom: '1rem',
};

const avatarStyle: CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: 'var(--zander-navy)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  flexShrink: 0,
};

const nameContainerStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const nameRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const nameStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
};

const defaultBadgeStyle: CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: '600',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px',
  backgroundColor: '#FEF3C7',
  color: '#92400E',
  textTransform: 'uppercase',
};

const taglineStyle: CSSProperties = {
  margin: '0.25rem 0 0 0',
  fontSize: '0.8rem',
  color: 'var(--zander-gray)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const sectionStyle: CSSProperties = {
  marginBottom: '0.75rem',
};

const labelStyle: CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '600',
  color: 'var(--zander-gray)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: '0.25rem',
};

const tagsStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.25rem',
};

const tagStyle: CSSProperties = {
  fontSize: '0.7rem',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px',
  backgroundColor: '#FEE2E2',
  color: '#B91C1C',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '140px',
};

const moreStyle: CSSProperties = {
  fontSize: '0.7rem',
  padding: '0.2rem 0.4rem',
  color: 'var(--zander-gray)',
};

const footerStyle: CSSProperties = {
  borderTop: '1px solid var(--zander-border-gray)',
  paddingTop: '0.75rem',
  marginTop: '0.5rem',
};

const contactCountStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--zander-gray)',
};
