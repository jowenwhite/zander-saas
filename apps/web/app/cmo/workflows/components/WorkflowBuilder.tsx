'use client';
import { WorkflowNode, WorkflowTriggerType, InsertPosition } from '../types';
import { getTriggerTypeInfo, buildNodeList, findFirstNode } from '../utils';
import WorkflowNodeCard from './WorkflowNodeCard';

interface WorkflowBuilderProps {
  nodes: WorkflowNode[];
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, unknown>;
  onEditTrigger: () => void;
  onAddNode: (position: InsertPosition) => void;
  onEditNode: (node: WorkflowNode) => void;
  onDeleteNode: (nodeId: string) => void;
}

export default function WorkflowBuilder({
  nodes,
  triggerType,
  triggerConfig,
  onEditTrigger,
  onAddNode,
  onEditNode,
  onDeleteNode,
}: WorkflowBuilderProps) {
  const triggerInfo = getTriggerTypeInfo(triggerType);
  const renderedNodes = buildNodeList(nodes);
  const firstNode = findFirstNode(nodes);

  // Group nodes by their parent condition for branch rendering
  const nodesByCondition = new Map<string | null, typeof renderedNodes>();
  renderedNodes.forEach((rn) => {
    const key = rn.parentConditionId;
    if (!nodesByCondition.has(key)) {
      nodesByCondition.set(key, []);
    }
    nodesByCondition.get(key)!.push(rn);
  });

  const renderBranch = (
    parentConditionId: string | null,
    branchType: 'main' | 'true' | 'false',
    depth: number
  ) => {
    const branchNodes = (nodesByCondition.get(parentConditionId) || []).filter(
      (rn) => rn.branchType === branchType
    );

    return branchNodes.map((rn, index) => {
      const isCondition = rn.node.nodeType === 'condition';

      return (
        <div key={rn.node.id}>
          {/* Node Card */}
          <WorkflowNodeCard
            node={rn.node}
            depth={depth}
            branchType={branchType}
            onEdit={() => onEditNode(rn.node)}
            onDelete={() => onDeleteNode(rn.node.id)}
          />

          {/* Connector */}
          {(rn.node.nextNodeId || isCondition) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.25rem 0',
                marginLeft: depth > 0 ? '1.5rem' : 0,
              }}
            >
              <div
                style={{
                  width: '2px',
                  height: '16px',
                  background: 'var(--zander-border-gray)',
                }}
              />
              {!isCondition && (
                <div
                  style={{
                    width: '0',
                    height: '0',
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '6px solid var(--zander-border-gray)',
                  }}
                />
              )}
            </div>
          )}

          {/* Condition Branches */}
          {isCondition && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginLeft: depth > 0 ? '1.5rem' : 0,
                marginTop: '0.5rem',
              }}
            >
              {/* True Branch */}
              <div
                style={{
                  borderLeft: '3px solid #27AE60',
                  paddingLeft: '1rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: '#27AE60',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  If True
                </div>
                {renderBranch(rn.node.id, 'true', depth + 1)}
                <AddNodeButton
                  onClick={() => onAddNode({ afterNodeId: rn.node.id, branch: 'true' })}
                  label="+ Add to True"
                  color="#27AE60"
                />
              </div>

              {/* False Branch */}
              <div
                style={{
                  borderLeft: '3px solid #E74C3C',
                  paddingLeft: '1rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: '#E74C3C',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  If False
                </div>
                {renderBranch(rn.node.id, 'false', depth + 1)}
                <AddNodeButton
                  onClick={() => onAddNode({ afterNodeId: rn.node.id, branch: 'false' })}
                  label="+ Add to False"
                  color="#E74C3C"
                />
              </div>
            </div>
          )}

          {/* Add node button after non-condition nodes */}
          {!isCondition && index === branchNodes.length - 1 && depth === 0 && (
            <AddNodeButton
              onClick={() => onAddNode({ afterNodeId: rn.node.id })}
              label="+ Add Node"
              color="#F57C00"
            />
          )}
        </div>
      );
    });
  };

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
          Workflow Steps
        </h3>
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--zander-gray)',
          }}
        >
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Trigger Node */}
      <div
        onClick={onEditTrigger}
        style={{
          background: 'white',
          border: '2px solid #F57C00',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 124, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(245, 124, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
          }}
        >
          {triggerInfo.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--zander-navy)',
              }}
            >
              Trigger
            </h4>
            <span
              style={{
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                fontSize: '0.6rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: 'rgba(245, 124, 0, 0.15)',
                color: '#F57C00',
              }}
            >
              {triggerInfo.label}
            </span>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--zander-gray)',
              marginTop: '0.25rem',
            }}
          >
            {triggerInfo.description}
          </div>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#F57C00',
            fontWeight: '500',
          }}
        >
          Edit
        </div>
      </div>

      {/* Connector from trigger */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0.25rem 0',
        }}
      >
        <div
          style={{
            width: '2px',
            height: '16px',
            background: 'var(--zander-border-gray)',
          }}
        />
        <div
          style={{
            width: '0',
            height: '0',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '6px solid var(--zander-border-gray)',
          }}
        />
      </div>

      {/* Nodes List */}
      {nodes.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'white',
            borderRadius: '10px',
            border: '2px dashed var(--zander-border-gray)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
            ⚡
          </div>
          <h4
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--zander-navy)',
            }}
          >
            No Actions Yet
          </h4>
          <p
            style={{
              margin: '0 0 1rem 0',
              fontSize: '0.85rem',
              color: 'var(--zander-gray)',
              maxWidth: '280px',
            }}
          >
            Add your first action to define what happens when this workflow is triggered.
          </p>
          <button
            onClick={() => onAddNode({ afterNodeId: null })}
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
            + Add First Action
          </button>
        </div>
      ) : (
        <div>
          {renderBranch(null, 'main', 0)}
        </div>
      )}
    </div>
  );
}

// Add Node Button Component
function AddNodeButton({
  onClick,
  label,
  color,
}: {
  onClick: () => void;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '0.75rem',
      }}
    >
      <button
        onClick={onClick}
        style={{
          padding: '0.5rem 1rem',
          background: 'white',
          color: color,
          border: `2px dashed ${color}`,
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.8rem',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = color;
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.borderStyle = 'solid';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.color = color;
          e.currentTarget.style.borderStyle = 'dashed';
        }}
      >
        {label}
      </button>
    </div>
  );
}
