'use client';
import { WorkflowNodeType } from '../types';
import { getNodesByCategory } from '../utils';

interface NodeTypeSelectorProps {
  selected: WorkflowNodeType | null;
  onChange: (type: WorkflowNodeType) => void;
}

export default function NodeTypeSelector({ selected, onChange }: NodeTypeSelectorProps) {
  const nodesByCategory = getNodesByCategory();

  const categoryLabels: Record<string, string> = {
    action: 'Actions',
    condition: 'Conditions',
    control: 'Control',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {Object.entries(nodesByCategory).map(([category, nodes]) => (
        <div key={category}>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: '600',
              color: 'var(--zander-gray)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            {categoryLabels[category] || category}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
            }}
          >
            {nodes.map((nodeType) => {
              const isSelected = selected === nodeType.type;
              return (
                <button
                  key={nodeType.type}
                  type="button"
                  onClick={() => onChange(nodeType.type)}
                  style={{
                    padding: '0.75rem',
                    border: `2px solid ${isSelected ? nodeType.color : 'var(--zander-border-gray)'}`,
                    borderRadius: '8px',
                    background: isSelected ? `${nodeType.color}10` : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '1.25rem',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${nodeType.color}20`,
                        borderRadius: '6px',
                      }}
                    >
                      {nodeType.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontWeight: '600',
                          color: isSelected ? nodeType.color : 'var(--zander-navy)',
                          fontSize: '0.8rem',
                        }}
                      >
                        {nodeType.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: 'var(--zander-gray)',
                          marginTop: '0.125rem',
                        }}
                      >
                        {nodeType.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
