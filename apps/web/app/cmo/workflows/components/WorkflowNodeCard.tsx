'use client';
import { WorkflowNode } from '../types';
import { getNodeTypeInfo, getNodeConfigSummary } from '../utils';

interface WorkflowNodeCardProps {
  node: WorkflowNode;
  depth: number;
  branchType: 'main' | 'true' | 'false';
  onEdit: () => void;
  onDelete: () => void;
}

export default function WorkflowNodeCard({
  node,
  depth,
  branchType,
  onEdit,
  onDelete,
}: WorkflowNodeCardProps) {
  const nodeInfo = getNodeTypeInfo(node.nodeType);
  const configSummary = getNodeConfigSummary(node.nodeType, node.config);
  const isCondition = node.nodeType === 'condition';

  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${isCondition ? nodeInfo.color : 'var(--zander-border-gray)'}`,
        borderRadius: isCondition ? '12px' : '10px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'all 0.2s ease',
        marginLeft: depth > 0 ? '1.5rem' : 0,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = nodeInfo.color;
        e.currentTarget.style.boxShadow = `0 4px 12px ${nodeInfo.color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isCondition ? nodeInfo.color : 'var(--zander-border-gray)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Branch indicator line */}
      {depth > 0 && (
        <div
          style={{
            position: 'absolute',
            left: '-1.5rem',
            top: '50%',
            width: '1.5rem',
            height: '2px',
            background: branchType === 'true' ? '#27AE60' : branchType === 'false' ? '#E74C3C' : 'var(--zander-border-gray)',
          }}
        />
      )}

      {/* Node Icon */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: isCondition ? '22px' : '10px',
          background: `${nodeInfo.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0,
        }}
      >
        {nodeInfo.icon}
      </div>

      {/* Node Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--zander-navy)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {node.name}
          </h4>
          <span
            style={{
              padding: '0.125rem 0.375rem',
              borderRadius: '4px',
              fontSize: '0.6rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              background: `${nodeInfo.color}15`,
              color: nodeInfo.color,
              flexShrink: 0,
            }}
          >
            {nodeInfo.label}
          </span>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--zander-gray)',
            marginTop: '0.25rem',
          }}
        >
          {configSummary}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          style={{
            padding: '0.375rem 0.625rem',
            background: 'var(--zander-off-white)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--zander-gray)',
            fontSize: '0.75rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F57C00';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--zander-off-white)';
            e.currentTarget.style.color = 'var(--zander-gray)';
          }}
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            padding: '0.375rem 0.625rem',
            background: 'var(--zander-off-white)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--zander-red)',
            fontSize: '0.75rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--zander-red)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--zander-off-white)';
            e.currentTarget.style.color = 'var(--zander-red)';
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
