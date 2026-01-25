import { FunnelStageType, FunnelStage, FunnelStatus, StageTypeInfo, ConfigField } from './types';

// Stage type configuration
export const stageTypeConfig: Record<FunnelStageType, StageTypeInfo> = {
  landing_page: {
    type: 'landing_page',
    label: 'Landing Page',
    icon: '🎯',
    color: '#F57C00',
    description: 'Entry point - where visitors first land',
    configFields: [
      { key: 'pageUrl', label: 'Page URL', type: 'text', placeholder: 'https://...' },
      { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Main headline' },
      { key: 'ctaText', label: 'CTA Button Text', type: 'text', placeholder: 'Get Started' },
    ],
  },
  form: {
    type: 'form',
    label: 'Form Capture',
    icon: '📋',
    color: '#3498DB',
    description: 'Capture lead information',
    configFields: [
      { key: 'formName', label: 'Form Name', type: 'text', placeholder: 'Contact Form' },
      { key: 'fields', label: 'Fields to Capture', type: 'textarea', placeholder: 'name, email, phone' },
      { key: 'submitText', label: 'Submit Button Text', type: 'text', placeholder: 'Submit' },
    ],
  },
  email: {
    type: 'email',
    label: 'Email',
    icon: '📧',
    color: '#9B59B6',
    description: 'Send nurturing email',
    configFields: [
      { key: 'subject', label: 'Email Subject', type: 'text', placeholder: 'Subject line' },
      { key: 'previewText', label: 'Preview Text', type: 'text', placeholder: 'Email preview' },
      { key: 'delayDays', label: 'Delay (days)', type: 'number', placeholder: '0' },
    ],
  },
  sms: {
    type: 'sms',
    label: 'SMS',
    icon: '📱',
    color: '#27AE60',
    description: 'Send SMS message',
    configFields: [
      { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Max 160 characters' },
      { key: 'delayHours', label: 'Delay (hours)', type: 'number', placeholder: '0' },
    ],
  },
  cro_stage_0: {
    type: 'cro_stage_0',
    label: 'CRO Handoff',
    icon: '🤝',
    color: '#E74C3C',
    description: 'Hand off to sales pipeline',
    configFields: [
      { key: 'dealValue', label: 'Default Deal Value', type: 'number', placeholder: '0' },
      { key: 'notes', label: 'Handoff Notes', type: 'textarea', placeholder: 'Notes for sales team' },
    ],
  },
};

// Default stage info for unknown types
const defaultStageInfo: StageTypeInfo = {
  type: 'landing_page', // fallback type
  label: 'Stage',
  icon: '📌',
  color: '#6c757d',
  description: 'Funnel stage',
  configFields: [],
};

// Map common stage types to display info
const genericStageTypeMap: Record<string, Partial<StageTypeInfo>> = {
  awareness: { label: 'Awareness', icon: '👀', color: '#3498DB' },
  interest: { label: 'Interest', icon: '💡', color: '#9B59B6' },
  decision: { label: 'Decision', icon: '🤔', color: '#F39C12' },
  action: { label: 'Action', icon: '✅', color: '#27AE60' },
  consideration: { label: 'Consideration', icon: '⚖️', color: '#E67E22' },
  conversion: { label: 'Conversion', icon: '🎯', color: '#2ECC71' },
  retention: { label: 'Retention', icon: '🔄', color: '#1ABC9C' },
  advocacy: { label: 'Advocacy', icon: '📢', color: '#E74C3C' },
};

// Get stage type info with fallback for unknown types
export function getStageTypeInfo(type: FunnelStageType | string): StageTypeInfo {
  // First check the main config
  if (stageTypeConfig[type as FunnelStageType]) {
    return stageTypeConfig[type as FunnelStageType];
  }

  // Check generic stage type map
  const genericInfo = genericStageTypeMap[type];
  if (genericInfo) {
    return {
      ...defaultStageInfo,
      type: type as FunnelStageType,
      ...genericInfo,
    };
  }

  // Return default with formatted label from type
  return {
    ...defaultStageInfo,
    type: type as FunnelStageType,
    label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
  };
}

// Get all stage types as array
export function getStageTypes(): StageTypeInfo[] {
  return Object.values(stageTypeConfig);
}

// Get stage color
export function getStageColor(type: FunnelStageType): string {
  return stageTypeConfig[type]?.color || '#6c757d';
}

// Get stage icon
export function getStageIcon(type: FunnelStageType): string {
  return stageTypeConfig[type]?.icon || '📌';
}

// Get stage label
export function getStageLabel(type: FunnelStageType): string {
  return stageTypeConfig[type]?.label || type;
}

// Format conversion rate
export function formatConversionRate(rate: number | null): string {
  if (rate === null || rate === undefined) return '—';
  return `${rate.toFixed(1)}%`;
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Calculate funnel conversion rate
export function calculateFunnelConversion(totalVisits: number, totalConversions: number): number {
  if (totalVisits === 0) return 0;
  return (totalConversions / totalVisits) * 100;
}

// Reorder stages - move stage up or down
export function reorderStages(
  stages: FunnelStage[],
  stageId: string,
  direction: 'up' | 'down'
): FunnelStage[] {
  const sortedStages = [...stages].sort((a, b) => a.stageOrder - b.stageOrder);
  const index = sortedStages.findIndex((s) => s.id === stageId);

  if (index === -1) return stages;

  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= sortedStages.length) return stages;

  // Swap stages
  const newStages = [...sortedStages];
  [newStages[index], newStages[newIndex]] = [newStages[newIndex], newStages[index]];

  // Update stageOrder for all stages
  return newStages.map((stage, i) => ({
    ...stage,
    stageOrder: i,
  }));
}

// Get status badge styling
export function getStatusBadgeStyle(status: FunnelStatus): { bg: string; color: string } {
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

// Get status label
export function getStatusLabel(status: FunnelStatus): string {
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

// Generate a temporary ID for new stages
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Check if stage ID is temporary
export function isTempId(id: string): boolean {
  return id.startsWith('temp_');
}
