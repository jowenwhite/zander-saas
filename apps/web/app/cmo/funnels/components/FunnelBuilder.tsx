'use client';
import { FunnelStage } from '../types';
import FunnelStageCard from './FunnelStageCard';

interface FunnelBuilderProps {
  stages: FunnelStage[];
  onMoveStage: (stageId: string, direction: 'up' | 'down') => void;
  onEditStage: (stage: FunnelStage) => void;
  onDeleteStage: (stageId: string) => void;
  onAddStage: () => void;
}

export default function FunnelBuilder({
  stages,
  onMoveStage,
  onEditStage,
  onDeleteStage,
  onAddStage,
}: FunnelBuilderProps) {
  const sortedStages = [...stages].sort((a, b) => a.stageOrder - b.stageOrder);

  return (
    <div
      style={{
        background: 'var(--zander-off-white)',
        borderRadius: '12px',
        padding: '1.5rem',
        minHeight: '400px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--zander-navy)',
          }}
        >
          Funnel Stages
        </h3>
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--zander-gray)',
          }}
        >
          {stages.length} stage{stages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Stages List */}
      {sortedStages.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            🎯
          </div>
          <h4
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--zander-navy)',
            }}
          >
            No Stages Yet
          </h4>
          <p
            style={{
              margin: '0 0 1.5rem 0',
              fontSize: '0.9rem',
              color: 'var(--zander-gray)',
              maxWidth: '300px',
            }}
          >
            Add your first stage to start building your marketing funnel.
          </p>
          <button
            onClick={onAddStage}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#F57C00',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E65100';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F57C00';
            }}
          >
            + Add First Stage
          </button>
        </div>
      ) : (
        <div>
          {sortedStages.map((stage, index) => (
            <FunnelStageCard
              key={stage.id}
              stage={stage}
              isFirst={index === 0}
              isLast={index === sortedStages.length - 1}
              onMoveUp={() => onMoveStage(stage.id, 'up')}
              onMoveDown={() => onMoveStage(stage.id, 'down')}
              onEdit={() => onEditStage(stage)}
              onDelete={() => onDeleteStage(stage.id)}
            />
          ))}

          {/* Add Stage Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '1rem',
            }}
          >
            <button
              onClick={onAddStage}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#F57C00',
                border: '2px dashed #F57C00',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F57C00';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderStyle = 'solid';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#F57C00';
                e.currentTarget.style.borderStyle = 'dashed';
              }}
            >
              + Add Stage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
