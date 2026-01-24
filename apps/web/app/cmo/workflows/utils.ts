import {
  WorkflowTriggerType,
  WorkflowNodeType,
  WorkflowNode,
  WorkflowStatus,
  TriggerTypeInfo,
  NodeTypeInfo,
  RenderedNode,
} from './types';

// ============================================
// TRIGGER TYPE CONFIGURATION
// ============================================

export const triggerTypeConfig: Record<WorkflowTriggerType, TriggerTypeInfo> = {
  manual: {
    type: 'manual',
    label: 'Manual Trigger',
    icon: '👆',
    description: 'Start workflow manually for selected contacts',
    configFields: [],
  },
  schedule: {
    type: 'schedule',
    label: 'Scheduled',
    icon: '⏰',
    description: 'Run on a recurring schedule',
    configFields: [
      {
        key: 'frequency',
        label: 'Frequency',
        type: 'select',
        required: true,
        options: [
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
        ],
      },
      { key: 'time', label: 'Time', type: 'text', placeholder: '09:00' },
    ],
  },
  form_submission: {
    type: 'form_submission',
    label: 'Form Submitted',
    icon: '📋',
    description: 'Triggered when a form is submitted',
    configFields: [
      { key: 'formId', label: 'Form ID', type: 'text', required: true, placeholder: 'Form ID' },
    ],
  },
  tag_added: {
    type: 'tag_added',
    label: 'Tag Added',
    icon: '🏷️',
    description: 'Triggered when a tag is added to a contact',
    configFields: [
      { key: 'tagName', label: 'Tag Name', type: 'text', required: true, placeholder: 'e.g., hot-lead' },
    ],
  },
  tag_removed: {
    type: 'tag_removed',
    label: 'Tag Removed',
    icon: '🏷️',
    description: 'Triggered when a tag is removed from a contact',
    configFields: [
      { key: 'tagName', label: 'Tag Name', type: 'text', required: true, placeholder: 'Tag name' },
    ],
  },
  segment_entry: {
    type: 'segment_entry',
    label: 'Entered Segment',
    icon: '👥',
    description: 'Triggered when contact enters a segment',
    configFields: [
      { key: 'segmentId', label: 'Segment ID', type: 'text', required: true, placeholder: 'Segment ID' },
    ],
  },
  segment_exit: {
    type: 'segment_exit',
    label: 'Exited Segment',
    icon: '👥',
    description: 'Triggered when contact exits a segment',
    configFields: [
      { key: 'segmentId', label: 'Segment ID', type: 'text', required: true, placeholder: 'Segment ID' },
    ],
  },
  deal_stage_change: {
    type: 'deal_stage_change',
    label: 'Deal Stage Changed',
    icon: '💰',
    description: 'Triggered when a deal moves to a stage',
    configFields: [
      { key: 'targetStage', label: 'Target Stage', type: 'text', required: true, placeholder: 'Stage name' },
    ],
  },
  contact_created: {
    type: 'contact_created',
    label: 'Contact Created',
    icon: '👤',
    description: 'Triggered when a new contact is created',
    configFields: [],
  },
};

// ============================================
// NODE TYPE CONFIGURATION
// ============================================

export const nodeTypeConfig: Record<WorkflowNodeType, NodeTypeInfo> = {
  send_email: {
    type: 'send_email',
    label: 'Send Email',
    icon: '📧',
    color: '#9B59B6',
    description: 'Send an email to the contact',
    category: 'action',
    configFields: [
      { key: 'subject', label: 'Email Subject', type: 'text', required: true, placeholder: 'Subject line' },
      { key: 'templateId', label: 'Template ID', type: 'text', placeholder: 'Optional template ID' },
    ],
  },
  send_sms: {
    type: 'send_sms',
    label: 'Send SMS',
    icon: '📱',
    color: '#27AE60',
    description: 'Send an SMS to the contact',
    category: 'action',
    configFields: [
      { key: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Max 160 characters' },
    ],
  },
  add_tag: {
    type: 'add_tag',
    label: 'Add Tag',
    icon: '🏷️',
    color: '#3498DB',
    description: 'Add a tag to the contact',
    category: 'action',
    configFields: [
      { key: 'tagName', label: 'Tag Name', type: 'text', required: true, placeholder: 'e.g., engaged' },
    ],
  },
  remove_tag: {
    type: 'remove_tag',
    label: 'Remove Tag',
    icon: '🏷️',
    color: '#E74C3C',
    description: 'Remove a tag from the contact',
    category: 'action',
    configFields: [
      { key: 'tagName', label: 'Tag Name', type: 'text', required: true, placeholder: 'Tag to remove' },
    ],
  },
  update_field: {
    type: 'update_field',
    label: 'Update Field',
    icon: '✏️',
    color: '#F39C12',
    description: 'Update a contact field',
    category: 'action',
    configFields: [
      {
        key: 'fieldName',
        label: 'Field Name',
        type: 'select',
        required: true,
        options: [
          { value: 'leadScore', label: 'Lead Score' },
          { value: 'lifecycleStage', label: 'Lifecycle Stage' },
          { value: 'source', label: 'Source' },
          { value: 'notes', label: 'Notes' },
        ],
      },
      { key: 'value', label: 'New Value', type: 'text', required: true, placeholder: 'Value' },
      {
        key: 'operation',
        label: 'Operation',
        type: 'select',
        options: [
          { value: 'set', label: 'Set to value' },
          { value: 'increment', label: 'Increment by' },
          { value: 'append', label: 'Append to' },
        ],
      },
    ],
  },
  wait: {
    type: 'wait',
    label: 'Wait',
    icon: '⏳',
    color: '#95A5A6',
    description: 'Pause workflow for a duration',
    category: 'action',
    configFields: [
      { key: 'duration', label: 'Duration', type: 'number', required: true, placeholder: '1' },
      {
        key: 'unit',
        label: 'Unit',
        type: 'select',
        required: true,
        options: [
          { value: 'minutes', label: 'Minutes' },
          { value: 'hours', label: 'Hours' },
          { value: 'days', label: 'Days' },
        ],
      },
    ],
  },
  notify_user: {
    type: 'notify_user',
    label: 'Notify Team',
    icon: '🔔',
    color: '#E67E22',
    description: 'Send notification to a team member',
    category: 'action',
    configFields: [
      { key: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Notification message' },
      {
        key: 'channel',
        label: 'Channel',
        type: 'select',
        options: [
          { value: 'in_app', label: 'In-App' },
          { value: 'email', label: 'Email' },
        ],
      },
    ],
  },
  cro_handoff: {
    type: 'cro_handoff',
    label: 'CRO Handoff',
    icon: '🤝',
    color: '#BF0A30',
    description: 'Create deal and hand off to sales',
    category: 'action',
    configFields: [
      { key: 'dealName', label: 'Deal Name', type: 'text', placeholder: 'Deal name template' },
      { key: 'dealValue', label: 'Deal Value', type: 'number', placeholder: '0' },
      { key: 'stage', label: 'Pipeline Stage', type: 'text', required: true, placeholder: 'Stage 0' },
      { key: 'notes', label: 'Handoff Notes', type: 'textarea', placeholder: 'Notes for sales team' },
    ],
  },
  condition: {
    type: 'condition',
    label: 'If/Then Condition',
    icon: '🔀',
    color: '#1ABC9C',
    description: 'Branch based on a condition',
    category: 'condition',
    configFields: [
      {
        key: 'conditionType',
        label: 'Condition Type',
        type: 'select',
        required: true,
        options: [
          { value: 'has_tag', label: 'Contact has tag' },
          { value: 'lead_score_above', label: 'Lead score above' },
          { value: 'in_segment', label: 'Is in segment' },
          { value: 'field_equals', label: 'Field equals value' },
          { value: 'email_opened', label: 'Opened previous email' },
          { value: 'email_clicked', label: 'Clicked previous email' },
        ],
      },
      { key: 'conditionValue', label: 'Value', type: 'text', required: true, placeholder: 'Condition value' },
    ],
  },
  end: {
    type: 'end',
    label: 'End',
    icon: '🏁',
    color: '#34495E',
    description: 'End this branch',
    category: 'control',
    configFields: [],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get trigger type info
export function getTriggerTypeInfo(type: WorkflowTriggerType): TriggerTypeInfo {
  return triggerTypeConfig[type];
}

// Get all trigger types as array
export function getTriggerTypes(): TriggerTypeInfo[] {
  return Object.values(triggerTypeConfig);
}

// Get node type info
export function getNodeTypeInfo(type: WorkflowNodeType): NodeTypeInfo {
  return nodeTypeConfig[type];
}

// Get all node types as array
export function getNodeTypes(): NodeTypeInfo[] {
  return Object.values(nodeTypeConfig);
}

// Get nodes grouped by category
export function getNodesByCategory(): Record<string, NodeTypeInfo[]> {
  const categories: Record<string, NodeTypeInfo[]> = {
    action: [],
    condition: [],
    control: [],
  };

  Object.values(nodeTypeConfig).forEach((info) => {
    if (categories[info.category]) {
      categories[info.category].push(info);
    }
  });

  return categories;
}

// Get node color
export function getNodeColor(type: WorkflowNodeType): string {
  return nodeTypeConfig[type]?.color || '#6c757d';
}

// Get node icon
export function getNodeIcon(type: WorkflowNodeType): string {
  return nodeTypeConfig[type]?.icon || '📌';
}

// Get node label
export function getNodeLabel(type: WorkflowNodeType): string {
  return nodeTypeConfig[type]?.label || type;
}

// Get trigger icon
export function getTriggerIcon(type: WorkflowTriggerType): string {
  return triggerTypeConfig[type]?.icon || '⚡';
}

// Get trigger label
export function getTriggerLabel(type: WorkflowTriggerType): string {
  return triggerTypeConfig[type]?.label || type;
}

// ============================================
// STATUS HELPERS
// ============================================

export function getStatusBadgeStyle(status: WorkflowStatus): { bg: string; color: string } {
  switch (status) {
    case 'active':
      return { bg: 'rgba(39, 174, 96, 0.1)', color: '#27AE60' };
    case 'paused':
      return { bg: 'rgba(245, 124, 0, 0.1)', color: '#F57C00' };
    case 'draft':
    default:
      return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6c757d' };
  }
}

export function getStatusLabel(status: WorkflowStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'paused':
      return 'Paused';
    case 'draft':
    default:
      return 'Draft';
  }
}

// ============================================
// FORMATTING HELPERS
// ============================================

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calculateCompletionRate(entryCount: number, completionCount: number): number {
  if (entryCount === 0) return 0;
  return (completionCount / entryCount) * 100;
}

// ============================================
// NODE CONFIG SUMMARY
// ============================================

export function getNodeConfigSummary(type: WorkflowNodeType, config: Record<string, unknown>): string {
  switch (type) {
    case 'wait':
      return `Wait ${config.duration || '?'} ${config.unit || 'days'}`;
    case 'send_email':
      return config.subject ? `"${config.subject}"` : 'Send email';
    case 'send_sms':
      return config.message ? `"${(config.message as string).substring(0, 30)}..."` : 'Send SMS';
    case 'add_tag':
      return config.tagName ? `Add: ${config.tagName}` : 'Add tag';
    case 'remove_tag':
      return config.tagName ? `Remove: ${config.tagName}` : 'Remove tag';
    case 'update_field':
      return config.fieldName ? `Update ${config.fieldName}` : 'Update field';
    case 'notify_user':
      return 'Notify team';
    case 'cro_handoff':
      return config.stage ? `Stage: ${config.stage}` : 'CRO Handoff';
    case 'condition':
      return config.conditionType ? `If: ${config.conditionType}` : 'Condition';
    case 'end':
      return 'End workflow';
    default:
      return type;
  }
}

// ============================================
// TREE BUILDING
// ============================================

// Find the first node in the workflow (not pointed to by any other node)
export function findFirstNode(nodes: WorkflowNode[]): WorkflowNode | null {
  if (nodes.length === 0) return null;

  const targetIds = new Set(
    nodes.flatMap((n) => [n.nextNodeId, n.trueBranchId, n.falseBranchId].filter(Boolean))
  );

  // Find node that no other node points to
  const firstNode = nodes.find((n) => !targetIds.has(n.id));

  // Fallback to node with lowest sortOrder
  return firstNode || nodes.reduce((prev, curr) => (curr.sortOrder < prev.sortOrder ? curr : prev));
}

// Build a flat list of rendered nodes in display order
export function buildNodeList(nodes: WorkflowNode[]): RenderedNode[] {
  if (nodes.length === 0) return [];

  const result: RenderedNode[] = [];
  const visited = new Set<string>();

  const firstNode = findFirstNode(nodes);
  if (!firstNode) return [];

  function traverse(
    nodeId: string | null,
    depth: number,
    branchType: 'main' | 'true' | 'false',
    parentConditionId: string | null
  ) {
    if (!nodeId || visited.has(nodeId)) return;

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    visited.add(nodeId);

    result.push({
      node,
      depth,
      branchType,
      parentConditionId,
    });

    if (node.nodeType === 'condition') {
      // Traverse true branch
      if (node.trueBranchId) {
        traverse(node.trueBranchId, depth + 1, 'true', node.id);
      }
      // Traverse false branch
      if (node.falseBranchId) {
        traverse(node.falseBranchId, depth + 1, 'false', node.id);
      }
    } else {
      // Continue to next node
      if (node.nextNodeId) {
        traverse(node.nextNodeId, depth, branchType, parentConditionId);
      }
    }
  }

  traverse(firstNode.id, 0, 'main', null);

  return result;
}

// ============================================
// ID HELPERS
// ============================================

export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isTempId(id: string): boolean {
  return id.startsWith('temp_');
}

// ============================================
// NODE MANIPULATION
// ============================================

// Insert a new node after a specific node (or at start if afterNodeId is null)
export function insertNodeAfter(
  nodes: WorkflowNode[],
  newNode: WorkflowNode,
  afterNodeId: string | null,
  branch?: 'true' | 'false'
): WorkflowNode[] {
  const updatedNodes = [...nodes];

  if (afterNodeId === null) {
    // Insert as first node
    const firstNode = findFirstNode(nodes);
    if (firstNode) {
      newNode.nextNodeId = firstNode.id;
    }
    updatedNodes.push(newNode);
  } else {
    const afterNode = updatedNodes.find((n) => n.id === afterNodeId);
    if (afterNode) {
      if (afterNode.nodeType === 'condition' && branch) {
        // Insert into a condition branch
        if (branch === 'true') {
          newNode.nextNodeId = afterNode.trueBranchId;
          afterNode.trueBranchId = newNode.id;
        } else {
          newNode.nextNodeId = afterNode.falseBranchId;
          afterNode.falseBranchId = newNode.id;
        }
      } else {
        // Insert after a regular node
        newNode.nextNodeId = afterNode.nextNodeId;
        afterNode.nextNodeId = newNode.id;
      }
      updatedNodes.push(newNode);
    }
  }

  // Update sort orders
  return updateSortOrders(updatedNodes);
}

// Remove a node and reconnect the chain
export function removeNode(nodes: WorkflowNode[], nodeId: string): WorkflowNode[] {
  const nodeToRemove = nodes.find((n) => n.id === nodeId);
  if (!nodeToRemove) return nodes;

  const updatedNodes = nodes.filter((n) => n.id !== nodeId);

  // Find any nodes pointing to the removed node and update their pointers
  updatedNodes.forEach((node) => {
    if (node.nextNodeId === nodeId) {
      node.nextNodeId = nodeToRemove.nextNodeId;
    }
    if (node.trueBranchId === nodeId) {
      node.trueBranchId = nodeToRemove.nextNodeId;
    }
    if (node.falseBranchId === nodeId) {
      node.falseBranchId = nodeToRemove.nextNodeId;
    }
  });

  return updateSortOrders(updatedNodes);
}

// Update sort orders based on traversal order
function updateSortOrders(nodes: WorkflowNode[]): WorkflowNode[] {
  const renderedList = buildNodeList(nodes);
  const orderMap = new Map<string, number>();

  renderedList.forEach((rn, index) => {
    orderMap.set(rn.node.id, index);
  });

  return nodes.map((node) => ({
    ...node,
    sortOrder: orderMap.get(node.id) ?? node.sortOrder,
  }));
}
