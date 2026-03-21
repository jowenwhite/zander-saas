'use client';
import { FunnelStage } from '../types';
import { getStageTypeInfo, formatNumber, formatConversionRate } from '../utils';

interface FunnelStageCardProps {
  stage: FunnelStage;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FunnelStageCard({
  stage,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: FunnelStageCardProps) {
  const stageInfo = getStageTypeInfo(stage.stageType);

  return (
    <div style={{ position: 'relative' }}>
      {/* Stage Card */}
      <div
        style={{
          background: '#1C1C26',
          border: '2px solid #2A2A38',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = stageInfo.color;
          e.currentTarget.style.boxShadow = `0 4px 12px ${stageInfo.color}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2A2A38';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Stage Type Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: `${stageInfo.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            flexShrink: 0,
          }}
        >
          {stageInfo.icon}
        </div>

        {/* Stage Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: '600',
                color: '#F0F0F5',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {stage.name}
            </h4>
            <span
              style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: `${stageInfo.color}15`,
                color: stageInfo.color,
                flexShrink: 0,
              }}
            >
              {stageInfo.label}
            </span>
          </div>

          {/* Metrics Row */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '0.5rem',
            }}
          >
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: '#8888A0' }}>Entries: </span>
              <span style={{ fontWeight: '600', color: '#F0F0F5' }}>
                {formatNumber(stage.entryCount)}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: '#8888A0' }}>Exits: </span>
              <span style={{ fontWeight: '600', color: '#F0F0F5' }}>
                {formatNumber(stage.exitCount)}
              </span>
            </div>
            {stage.conversionRate !== null && (
              <div style={{ fontSize: '0.8rem' }}>
                <span style={{ color: '#8888A0' }}>Conv: </span>
                <span style={{ fontWeight: '600', color: '#27AE60' }}>
                  {formatConversionRate(stage.conversionRate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reorder Arrows */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            style={{
              width: '28px',
              height: '28px',
              border: '1px solid #2A2A38',
              borderRadius: '6px',
              background: isFirst ? '#13131A' : '#1C1C26',
              cursor: isFirst ? 'not-allowed' : 'pointer',
              color: isFirst ? '#2A2A38' : '#8888A0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isFirst) {
                e.currentTarget.style.borderColor = '#F57C00';
                e.currentTarget.style.color = '#F57C00';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A38';
              e.currentTarget.style.color = isFirst ? '#2A2A38' : '#8888A0';
            }}
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            style={{
              width: '28px',
              height: '28px',
              border: '1px solid #2A2A38',
              borderRadius: '6px',
              background: isLast ? '#13131A' : '#1C1C26',
              cursor: isLast ? 'not-allowed' : 'pointer',
              color: isLast ? '#2A2A38' : '#8888A0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isLast) {
                e.currentTarget.style.borderColor = '#F57C00';
                e.currentTarget.style.color = '#F57C00';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A38';
              e.currentTarget.style.color = isLast ? '#2A2A38' : '#8888A0';
            }}
            title="Move down"
          >
            ↓
          </button>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={onEdit}
            style={{
              padding: '0.5rem 0.75rem',
              background: '#1C1C26',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#8888A0',
              fontSize: '0.8rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F57C00';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1C1C26';
              e.currentTarget.style.color = '#8888A0';
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '0.5rem 0.75rem',
              background: '#1C1C26',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#00CCEE',
              fontSize: '0.8rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#00CCEE';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1C1C26';
              e.currentTarget.style.color = '#00CCEE';
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Arrow Connector to Next Stage */}
      {!isLast && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0.5rem 0',
          }}
        >
          <div
            style={{
              width: '2px',
              height: '20px',
              background: '#2A2A38',
            }}
          />
          <div
            style={{
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '8px solid #2A2A38',
            }}
          />
        </div>
      )}
    </div>
  );
}
