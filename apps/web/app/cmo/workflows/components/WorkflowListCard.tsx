'use client';
import { Workflow } from '../types';
import {
  formatNumber,
  formatPercentage,
  calculateCompletionRate,
  getStatusBadgeStyle,
  getStatusLabel,
  getTriggerIcon,
  getTriggerLabel,
} from '../utils';

interface WorkflowListCardProps {
  workflow: Workflow;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function WorkflowListCard({
  workflow,
  onClick,
  onEdit,
  onDelete,
}: WorkflowListCardProps) {
  const statusStyle = getStatusBadgeStyle(workflow.status);
  const completionRate = calculateCompletionRate(workflow.entryCount, workflow.completionCount);
  const triggerIcon = getTriggerIcon(workflow.triggerType);
  const triggerLabel = getTriggerLabel(workflow.triggerType);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: '2px solid var(--zander-border-gray)',
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#F57C00';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--zander-border-gray)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--zander-navy)',
              }}
            >
              {workflow.name}
            </h3>
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.7rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: statusStyle.bg,
                color: statusStyle.color,
              }}
            >
              {getStatusLabel(workflow.status)}
            </span>
          </div>

          {/* Trigger Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(245, 124, 0, 0.1)',
                color: '#F57C00',
                fontSize: '0.75rem',
                fontWeight: '500',
              }}
            >
              <span>{triggerIcon}</span>
              {triggerLabel}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--zander-gray)',
              }}
            >
              {workflow.nodes.length} node{workflow.nodes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {workflow.description && (
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: 'var(--zander-gray)',
                lineHeight: 1.4,
              }}
            >
              {workflow.description.length > 100
                ? workflow.description.substring(0, 100) + '...'
                : workflow.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onEdit}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'var(--zander-off-white)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--zander-gray)',
              fontSize: '0.875rem',
            }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '0.5rem 0.75rem',
              background: 'var(--zander-off-white)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--zander-red)',
              fontSize: '0.875rem',
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--zander-off-white)',
          borderRadius: '8px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            TOTAL RUNS
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
            {formatNumber(workflow.entryCount)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            COMPLETED
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
            {formatNumber(workflow.completionCount)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            SUCCESS RATE
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#27AE60' }}>
            {formatPercentage(completionRate)}
          </div>
        </div>
      </div>
    </div>
  );
}
