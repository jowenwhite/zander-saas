// Funnel Stage Types
export type FunnelStageType =
  | 'landing_page'
  | 'form'
  | 'email'
  | 'sms'
  | 'cro_stage_0';

// Funnel Status
export type FunnelStatus = 'draft' | 'active' | 'paused';

// Funnel Stage
export type FunnelStage = {
  id: string;
  funnelId: string;
  name: string;
  stageType: FunnelStageType;
  stageOrder: number;
  config: Record<string, unknown>;
  entryCount: number;
  exitCount: number;
  conversionRate: number | null;
  createdAt?: string;
  updatedAt?: string;
};

// Funnel
export type Funnel = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: FunnelStatus;
  conversionGoal: string | null;
  totalVisits: number;
  totalConversions: number;
  stages: FunnelStage[];
  createdAt: string;
  updatedAt: string;
};

// Form data for creating/editing funnel
export type FunnelFormData = {
  name: string;
  description: string;
  conversionGoal: string;
  status: FunnelStatus;
};

// Form data for creating/editing stage
export type StageFormData = {
  name: string;
  stageType: FunnelStageType;
  config: Record<string, unknown>;
};

// Stage type metadata
export type StageTypeInfo = {
  type: FunnelStageType;
  label: string;
  icon: string;
  color: string;
  description: string;
  configFields: ConfigField[];
};

// Config field definition
export type ConfigField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

// API response types
export type FunnelsListResponse = Funnel[];

export type FunnelResponse = Funnel;
