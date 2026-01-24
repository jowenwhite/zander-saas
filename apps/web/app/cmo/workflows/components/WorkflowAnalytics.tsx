'use client';
import { WorkflowStatus } from '../types';
import { formatNumber, formatPercentage, calculateCompletionRate } from '../utils';

interface WorkflowAnalyticsProps {
  entryCount: number;
  completionCount: number;
  status: WorkflowStatus;
}

export default function WorkflowAnalytics({
  entryCount,
  completionCount,
  status,
}: WorkflowAnalyticsProps) {
  const completionRate = calculateCompletionRate(entryCount, completionCount);
  const activeCount = entryCount - completionCount; // Simplified active count

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        border: '2px solid var(--zander-border-gray)',
        padding: '1.5rem',
      }}
    >
      <h3
        style={{
          margin: '0 0 1.5rem 0',
          fontSize: '1rem',
          fontWeight: '600',
          color: 'var(--zander-navy)',
        }}
      >
        Workflow Analytics
      </h3>

      {/* Status Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'var(--zander-off-white)',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: status === 'active' ? '#27AE60' : status === 'paused' ? '#F57C00' : '#6c757d',
            animation: status === 'active' ? 'pulse 2s infinite' : 'none',
          }}
        />
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: status === 'active' ? '#27AE60' : 'var(--zander-gray)',
          }}
        >
          {status === 'active' ? 'Running' : status === 'paused' ? 'Paused' : 'Draft'}
        </span>
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Total Runs */}
        <div
          style={{
            padding: '1rem',
            background: 'var(--zander-off-white)',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--zander-gray)',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            Total Runs
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'var(--zander-navy)',
            }}
          >
            {formatNumber(entryCount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>
            Contacts entered this workflow
          </div>
        </div>

        {/* Completion Rate */}
        <div
          style={{
            padding: '1rem',
            background: 'var(--zander-off-white)',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--zander-gray)',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            Completion Rate
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: completionRate >= 50 ? '#27AE60' : completionRate >= 25 ? '#F57C00' : 'var(--zander-navy)',
            }}
          >
            {formatPercentage(completionRate)}
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: '6px',
              background: 'var(--zander-border-gray)',
              borderRadius: '3px',
              marginTop: '0.5rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(completionRate, 100)}%`,
                background: completionRate >= 50 ? '#27AE60' : completionRate >= 25 ? '#F57C00' : '#3498DB',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        {/* Completed */}
        <div
          style={{
            padding: '1rem',
            background: 'var(--zander-off-white)',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--zander-gray)',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            Completed
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#27AE60',
            }}
          >
            {formatNumber(completionCount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>
            Finished all steps
          </div>
        </div>

        {/* In Progress */}
        <div
          style={{
            padding: '1rem',
            background: 'var(--zander-off-white)',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--zander-gray)',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            In Progress
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#3498DB',
            }}
          >
            {formatNumber(Math.max(0, activeCount))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>
            Currently in workflow
          </div>
        </div>
      </div>

      {/* Tips */}
      {entryCount === 0 && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(245, 124, 0, 0.1)',
            borderRadius: '8px',
            borderLeft: '4px solid #F57C00',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--zander-navy)', fontWeight: '500' }}>
            No runs yet
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>
            {status === 'draft'
              ? 'Activate this workflow to start processing contacts.'
              : status === 'paused'
              ? 'Resume this workflow to continue processing.'
              : 'Contacts will appear here when they trigger this workflow.'}
          </div>
        </div>
      )}
    </div>
  );
}
