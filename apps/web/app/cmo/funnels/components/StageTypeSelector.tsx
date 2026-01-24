'use client';
import { FunnelStageType } from '../types';
import { getStageTypes } from '../utils';

interface StageTypeSelectorProps {
  selected: FunnelStageType | null;
  onChange: (type: FunnelStageType) => void;
}

export default function StageTypeSelector({ selected, onChange }: StageTypeSelectorProps) {
  const stageTypes = getStageTypes();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
      }}
    >
      {stageTypes.map((stageType) => {
        const isSelected = selected === stageType.type;
        return (
          <button
            key={stageType.type}
            type="button"
            onClick={() => onChange(stageType.type)}
            style={{
              padding: '1rem',
              border: `2px solid ${isSelected ? stageType.color : 'var(--zander-border-gray)'}`,
              borderRadius: '8px',
              background: isSelected ? `${stageType.color}10` : 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  fontSize: '1.5rem',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${stageType.color}20`,
                  borderRadius: '8px',
                }}
              >
                {stageType.icon}
              </span>
              <div>
                <div
                  style={{
                    fontWeight: '600',
                    color: isSelected ? stageType.color : 'var(--zander-navy)',
                    fontSize: '0.9rem',
                  }}
                >
                  {stageType.label}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--zander-gray)',
                    marginTop: '0.125rem',
                  }}
                >
                  {stageType.description}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
