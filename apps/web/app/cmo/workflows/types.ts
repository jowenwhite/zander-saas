// Workflow Status
export type WorkflowStatus = 'draft' | 'active' | 'paused';

// Trigger Types
export type WorkflowTriggerType =
  | 'manual'
  | 'schedule'
  | 'form_submission'
  | 'tag_added'
  | 'tag_removed'
  | 'segment_entry'
  | 'segment_exit'
  | 'deal_stage_change'
  | 'contact_created';

// Node Types
export type WorkflowNodeType =
  | 'send_email'
  | 'send_sms'
  | 'add_tag'
  | 'remove_tag'
  | 'update_field'
  | 'wait'
  | 'notify_user'
  | 'cro_handoff'
  | 'condition'
  | 'end';

// Workflow Node from API
export type WorkflowNode = {
  id: string;
  workflowId: string;
  nodeType: WorkflowNodeType;
  name: string;
  config: Record<string, unknown>;
  positionX: number;
  positionY: number;
  nextNodeId: string | null;
  trueBranchId: string | null;
  falseBranchId: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

// Workflow from API
export type Workflow = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, unknown>;
  entryCount: number;
  completionCount: number;
  nodes: WorkflowNode[];
  createdAt: string;
  updatedAt: string;
};

// Workflow Execution
export type WorkflowExecution = {
  id: string;
  workflowId: string;
  contactId: string;
  currentNodeId: string | null;
  status: 'active' | 'completed' | 'exited' | 'error';
  enteredAt: string;
  completedAt: string | null;
  exitedAt: string | null;
  exitReason: string | null;
  stepHistory: StepHistoryEntry[];
};

export type StepHistoryEntry = {
  nodeId: string;
  nodeName: string;
  status: 'completed' | 'skipped' | 'error';
  timestamp: string;
  metadata?: Record<string, unknown>;
};

// Form data for creating/editing workflows
export type WorkflowFormData = {
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, unknown>;
  status: WorkflowStatus;
};

// Form data for creating/editing nodes
export type NodeFormData = {
  nodeType: WorkflowNodeType;
  name: string;
  config: Record<string, unknown>;
};

// Config field definition for dynamic forms
export type ConfigField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

// Trigger type metadata
export type TriggerTypeInfo = {
  type: WorkflowTriggerType;
  label: string;
  icon: string;
  description: string;
  configFields: ConfigField[];
};

// Node type metadata
export type NodeTypeInfo = {
  type: WorkflowNodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
  category: 'action' | 'condition' | 'control';
  configFields: ConfigField[];
};

// Rendered node for builder (computed tree structure)
export type RenderedNode = {
  node: WorkflowNode;
  depth: number;
  branchType: 'main' | 'true' | 'false';
  parentConditionId: string | null;
};

// Insert position for adding new nodes
export type InsertPosition = {
  afterNodeId: string | null;
  branch?: 'true' | 'false';
};
