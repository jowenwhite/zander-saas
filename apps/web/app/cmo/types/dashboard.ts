// KPI Metrics
export type CMODashboardMetrics = {
  newLeads: KPIMetric;
  emailOpenRate: KPIMetric;
  conversionRate: KPIMetric;
  pipelineValue: KPIMetric;
  summary: {
    activeWorkflows: number;
    activeCampaigns: number;
    totalContacts: number;
  };
};

export type KPIMetric = {
  count?: number;
  rate?: number;
  amount?: number;
  trend: number;
  trendUp: boolean;
  detail: string;
  trendPeriod?: string;
  industryAvg?: number;
  dealCount?: number;
};

// Weekly Schedule
export type WeeklySchedule = {
  weekStart: string;
  weekEnd: string;
  events: ScheduleEvent[];
  monthlyTheme?: MonthlyTheme;
};

export type ScheduleEvent = {
  id: string;
  date: string;
  title: string;
  type: 'email' | 'social' | 'blog' | 'campaign';
  status: 'scheduled' | 'published' | 'draft';
};

export type MonthlyTheme = {
  id: string;
  name: string;
  description?: string;
};

// Top Content
export type TopContentResponse = {
  topContent: TopContent[];
  period: string;
  isPlaceholder: boolean;
};

export type TopContent = {
  id: string;
  name: string;
  type: 'email' | 'social' | 'landing_page' | 'campaign';
  metric: string;
  metricValue: number;
  trend: number;
};

// Funnel Overview
export type FunnelOverview = {
  visitors: FunnelStage;
  leads: FunnelStage;
  mqls: FunnelStage;
  croHandoff: FunnelStage;
  period: string;
};

export type FunnelStage = {
  count: number;
  percentage: number;
};

// Don's Recommendations
export type RecommendationsResponse = {
  recommendations: DonRecommendation[];
};

export type DonRecommendation = {
  id: string;
  type: 'insight' | 'action' | 'warning';
  icon: string;
  title: string;
  description: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
};
