'use client';

import { useState, useEffect, useCallback } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { AssemblyModal } from '../components/assembly';
import { logout, getStoredAuth } from '../utils/auth';
import { Briefcase, BarChart3, Settings, Palette, Users, Monitor, ClipboardList, Building2, Swords, Wind, FileText, Trophy, BookOpen, Calendar, Target, Rocket, Star, Map, Sparkles, Check, Scale, Loader2, AlertCircle, Plus, X, TrendingUp } from 'lucide-react';
import { useTier } from '../contexts/TierContext';
import Scorecard, { PillarScores, ScorecardSnapshot } from '../components/Scorecard';
import ScorecardComparison from '../components/ScorecardComparison';
import ConsultingPortal from '../components/ConsultingPortal';

// ============ TYPES ============

interface Headwind {
  id: string;
  title: string;
  description?: string;
  priority: 'P1' | 'P2' | 'P3';
  category: 'BUG' | 'REBUILD' | 'NEW_BUILD' | 'ENHANCEMENT' | 'TASK';
  status: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DEPLOYED' | 'CLOSED';
  owner?: string;
  daysOpen?: number;
  createdAt: string;
  resolvedAt?: string;
}

interface HorizonItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
  createdAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  eventType?: string;
  category?: string;
  status?: string;
  attendees?: number;
}

interface MeetingTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  executive?: string;
  duration?: string;
}

interface HQGoal {
  id: string;
  title: string;
  description?: string;
  scope: 'PERSONAL' | 'QUARTERLY' | 'ANNUAL';
  status: 'ACTIVE' | 'COMPLETED' | 'DEFERRED' | 'CANCELLED';
  priority?: 'P1' | 'P2' | 'P3';
  progress: number;
  targetValue?: number;
  currentValue?: number;
  ownerId?: string;
  ownerName?: string;
  dueDate?: string;
  quarter?: string;
  year?: number;
  createdAt: string;
  updatedAt: string;
}

interface Keystone {
  id: string;
  executive: string;
  label: string;
  value: string;
  numericValue?: number;
  target?: string;
  numericTarget?: number;
  trend?: 'UP' | 'DOWN' | 'FLAT';
  trendValue?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
}

interface LedgerEntry {
  id: string;
  category: 'COMPANY' | 'TEAM' | 'PERSONAL';
  name: string;
  keystone?: string;
  value: string;
  numericValue?: number;
  target?: string;
  numericTarget?: number;
  progress?: number;
  trend?: 'UP' | 'DOWN' | 'FLAT';
  owner?: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'EXCEEDED';
  period?: string;
  sortOrder: number;
}

interface FoundingValue {
  title: string;
  description: string;
}

interface FoundingDocument {
  id: string;
  vision?: string;
  mission?: string;
  values?: FoundingValue[];
  story?: string;
}

interface LegacyGoal {
  text: string;
  completed?: boolean;
}

interface LegacyMilestone {
  id: string;
  year: number;
  title: string;
  description?: string;
  goals?: LegacyGoal[];
  progress: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED';
  sortOrder: number;
}

interface DashboardSummary {
  activeHeadwinds: number;
  completedThisMonth: number;
  totalVictories: number;
  nextMeeting?: {
    id: string;
    title: string;
    startTime: string;
  };
  campaignProgress: number;
  upcomingMilestoneYear?: number;
}

export default function HeadquartersPage() {
  const [activeModule, setActiveModule] = useState('cro');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showAssemblyModal, setShowAssemblyModal] = useState(false);
  const [authData, setAuthData] = useState<{ token: string | null; tenantId: string | null }>({ token: null, tenantId: null });

  // Get tier context for CONSULTING tier features
  const { tier, loading: tierLoading } = useTier();
  const isConsultingTier = tier?.effectiveTier === 'CONSULTING';

  // Consulting Scorecard state
  const [scorecardData, setScorecardData] = useState<{
    pillarScores: PillarScores | null;
    snapshots: ScorecardSnapshot[];
    engagementId: string | null;
  }>({ pillarScores: null, snapshots: [], engagementId: null });
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const [scorecardError, setScorecardError] = useState<string | null>(null);

  // ============ API STATE ============

  // Dashboard aggregated state
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  // Headwinds state
  const [headwinds, setHeadwinds] = useState<Headwind[]>([]);
  const [headwindsLoading, setHeadwindsLoading] = useState(false);
  const [headwindsError, setHeadwindsError] = useState<string | null>(null);

  // Victories (resolved headwinds) state
  const [victories, setVictories] = useState<Headwind[]>([]);
  const [victoriesLoading, setVictoriesLoading] = useState(false);
  const [victoriesError, setVictoriesError] = useState<string | null>(null);

  // Horizon items state
  const [horizonItems, setHorizonItems] = useState<HorizonItem[]>([]);
  const [horizonLoading, setHorizonLoading] = useState(false);
  const [horizonError, setHorizonError] = useState<string | null>(null);

  // Calendar events state
  const [upcomingMeetings, setUpcomingMeetings] = useState<CalendarEvent[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);

  // Past meetings state
  const [pastMeetings, setPastMeetings] = useState<CalendarEvent[]>([]);
  const [pastMeetingsLoading, setPastMeetingsLoading] = useState(false);

  // Meeting templates state
  const [meetingTemplates, setMeetingTemplates] = useState<MeetingTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // HQ Goals state
  const [personalGoals, setPersonalGoals] = useState<HQGoal[]>([]);
  const [quarterlyGoals, setQuarterlyGoals] = useState<HQGoal[]>([]);
  const [annualGoals, setAnnualGoals] = useState<HQGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  // Keystones state
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [keystonesLoading, setKeystonesLoading] = useState(false);
  const [keystonesError, setKeystonesError] = useState<string | null>(null);
  const [editingKeystone, setEditingKeystone] = useState<string | null>(null);
  const [keystoneEditValue, setKeystoneEditValue] = useState('');

  // Ledger state
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [ledgerTab, setLedgerTab] = useState<'COMPANY' | 'TEAM' | 'PERSONAL'>('COMPANY');
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [newLedgerEntry, setNewLedgerEntry] = useState({ name: '', value: '', target: '', owner: '', progress: 0 });

  // Founding Document state
  const [foundingDoc, setFoundingDoc] = useState<FoundingDocument | null>(null);
  const [foundingLoading, setFoundingLoading] = useState(false);
  const [foundingError, setFoundingError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFieldValue, setEditFieldValue] = useState('');
  const [editingValues, setEditingValues] = useState<FoundingValue[]>([]);

  // Legacy Milestones state
  const [legacyMilestones, setLegacyMilestones] = useState<LegacyMilestone[]>([]);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [legacyError, setLegacyError] = useState<string | null>(null);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ year: new Date().getFullYear() + 1, title: '', description: '', goals: '' });

  // Form states
  const [showHeadwindForm, setShowHeadwindForm] = useState(false);
  const [showHorizonForm, setShowHorizonForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalScope, setNewGoalScope] = useState<'PERSONAL' | 'QUARTERLY' | 'ANNUAL'>('PERSONAL');
  const [newHeadwind, setNewHeadwind] = useState<{ title: string; description: string; priority: 'P1' | 'P2' | 'P3'; category: 'BUG' | 'REBUILD' | 'NEW_BUILD' | 'ENHANCEMENT' | 'TASK' }>({ title: '', description: '', priority: 'P2', category: 'TASK' });
  const [newHorizonItem, setNewHorizonItem] = useState({ title: '', description: '', category: '' });
  const [newGoal, setNewGoal] = useState({ title: '', description: '', priority: 'P2' as 'P1' | 'P2' | 'P3', targetValue: '', currentValue: '', dueDate: '', ownerName: '' });
  const [submitting, setSubmitting] = useState(false);

  // Load auth data on mount
  useEffect(() => {
    const auth = getStoredAuth();
    setAuthData({ token: auth.token, tenantId: auth.tenantId });
  }, []);

  // ============ API FETCH FUNCTIONS ============

  // Single dashboard fetch that populates all state
  const fetchDashboard = useCallback(async () => {
    if (!authData.token) return;
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const response = await fetch('/api/hq/dashboard', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      const data = await response.json();

      // Populate all state from unified payload
      setDashboardSummary(data.summary);
      setIsEmpty(data.isEmpty);
      setKeystones(data.keystones || []);
      setHeadwinds(data.headwinds || []);
      setVictories(data.victories || []);
      setHorizonItems(data.horizonItems || []);
      setUpcomingMeetings(data.upcomingMeetings || []);
      setPastMeetings(data.pastMeetings || []);
      setMeetingTemplates(data.meetingTemplates || []);
      setPersonalGoals(data.goals?.personal || []);
      setQuarterlyGoals(data.goals?.quarterly || []);
      setAnnualGoals(data.goals?.annual || []);
      setLedgerEntries(data.ledgerEntries || []);
      setFoundingDoc(data.foundingDocument);
      setLegacyMilestones(data.legacyMilestones || []);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  // Individual fetch functions for refreshing after CRUD operations
  const fetchHeadwinds = useCallback(async () => {
    if (!authData.token) return;
    setHeadwindsLoading(true);
    setHeadwindsError(null);
    try {
      const response = await fetch('/api/headwinds?status=OPEN&status=IN_PROGRESS&status=TESTING', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch headwinds');
      const data = await response.json();
      setHeadwinds(Array.isArray(data) ? data : data.headwinds || []);
    } catch (error) {
      setHeadwindsError(error instanceof Error ? error.message : 'Failed to load headwinds');
    } finally {
      setHeadwindsLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchVictories = useCallback(async () => {
    if (!authData.token) return;
    setVictoriesLoading(true);
    setVictoriesError(null);
    try {
      const response = await fetch('/api/headwinds?status=CLOSED&status=DEPLOYED', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch victories');
      const data = await response.json();
      setVictories(Array.isArray(data) ? data : data.headwinds || []);
    } catch (error) {
      setVictoriesError(error instanceof Error ? error.message : 'Failed to load victories');
    } finally {
      setVictoriesLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchHorizonItems = useCallback(async () => {
    if (!authData.token) return;
    setHorizonLoading(true);
    setHorizonError(null);
    try {
      const response = await fetch('/api/horizon', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch horizon items');
      const data = await response.json();
      setHorizonItems(Array.isArray(data) ? data : data.ideas || []);
    } catch (error) {
      setHorizonError(error instanceof Error ? error.message : 'Failed to load horizon items');
    } finally {
      setHorizonLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchUpcomingMeetings = useCallback(async () => {
    if (!authData.token) return;
    setMeetingsLoading(true);
    setMeetingsError(null);
    try {
      const response = await fetch('/api/calendar-events/upcoming?limit=10', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch meetings');
      const data = await response.json();
      setUpcomingMeetings(Array.isArray(data) ? data : data.events || []);
    } catch (error) {
      setMeetingsError(error instanceof Error ? error.message : 'Failed to load meetings');
    } finally {
      setMeetingsLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchPastMeetings = useCallback(async () => {
    if (!authData.token) return;
    setPastMeetingsLoading(true);
    try {
      // Fetch events from the past 30 days
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const response = await fetch(`/api/calendar-events?startDate=${startDate}&endDate=${endDate}&status=COMPLETED`, {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch past meetings');
      const data = await response.json();
      setPastMeetings(Array.isArray(data) ? data : data.events || []);
    } catch (error) {
      console.error('Failed to load past meetings:', error);
    } finally {
      setPastMeetingsLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchMeetingTemplates = useCallback(async () => {
    if (!authData.token) return;
    setTemplatesLoading(true);
    setTemplatesError(null);
    try {
      const response = await fetch('/api/treasury/assemblies?category=assembly', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setMeetingTemplates(Array.isArray(data) ? data : data.assemblies || []);
    } catch (error) {
      setTemplatesError(error instanceof Error ? error.message : 'Failed to load templates');
    } finally {
      setTemplatesLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchGoals = useCallback(async () => {
    if (!authData.token) return;
    setGoalsLoading(true);
    setGoalsError(null);
    try {
      // Fetch all three scopes in parallel
      const [personalRes, quarterlyRes, annualRes] = await Promise.all([
        fetch('/api/hq-goals?scope=PERSONAL&status=ACTIVE', {
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'x-tenant-id': authData.tenantId || '',
          },
        }),
        fetch('/api/hq-goals?scope=QUARTERLY&status=ACTIVE', {
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'x-tenant-id': authData.tenantId || '',
          },
        }),
        fetch('/api/hq-goals?scope=ANNUAL&status=ACTIVE', {
          headers: {
            'Authorization': `Bearer ${authData.token}`,
            'x-tenant-id': authData.tenantId || '',
          },
        }),
      ]);

      if (!personalRes.ok || !quarterlyRes.ok || !annualRes.ok) {
        throw new Error('Failed to fetch goals');
      }

      const [personalData, quarterlyData, annualData] = await Promise.all([
        personalRes.json(),
        quarterlyRes.json(),
        annualRes.json(),
      ]);

      setPersonalGoals(Array.isArray(personalData) ? personalData : []);
      setQuarterlyGoals(Array.isArray(quarterlyData) ? quarterlyData : []);
      setAnnualGoals(Array.isArray(annualData) ? annualData : []);
    } catch (error) {
      setGoalsError(error instanceof Error ? error.message : 'Failed to load goals');
    } finally {
      setGoalsLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchKeystones = useCallback(async () => {
    if (!authData.token) return;
    setKeystonesLoading(true);
    setKeystonesError(null);
    try {
      const response = await fetch('/api/keystones', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch keystones');
      const data = await response.json();
      setKeystones(Array.isArray(data) ? data : []);
    } catch (error) {
      setKeystonesError(error instanceof Error ? error.message : 'Failed to load keystones');
    } finally {
      setKeystonesLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchLedgerEntries = useCallback(async () => {
    if (!authData.token) return;
    setLedgerLoading(true);
    setLedgerError(null);
    try {
      const response = await fetch('/api/ledger', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch ledger entries');
      const data = await response.json();
      setLedgerEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      setLedgerError(error instanceof Error ? error.message : 'Failed to load ledger');
    } finally {
      setLedgerLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchFoundingDocument = useCallback(async () => {
    if (!authData.token) return;
    setFoundingLoading(true);
    setFoundingError(null);
    try {
      const response = await fetch('/api/founding', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch founding document');
      const data = await response.json();
      setFoundingDoc(data);
    } catch (error) {
      setFoundingError(error instanceof Error ? error.message : 'Failed to load founding document');
    } finally {
      setFoundingLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  const fetchLegacyMilestones = useCallback(async () => {
    if (!authData.token) return;
    setLegacyLoading(true);
    setLegacyError(null);
    try {
      const response = await fetch('/api/legacy', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch legacy milestones');
      const data = await response.json();
      setLegacyMilestones(Array.isArray(data) ? data : []);
    } catch (error) {
      setLegacyError(error instanceof Error ? error.message : 'Failed to load legacy milestones');
    } finally {
      setLegacyLoading(false);
    }
  }, [authData.token, authData.tenantId]);

  // Fetch scorecard data for CONSULTING tier users
  const fetchScorecard = useCallback(async () => {
    if (!authData.token || !isConsultingTier) return;
    setScorecardLoading(true);
    setScorecardError(null);
    try {
      const response = await fetch('/api/consulting/scorecard', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          // No engagement found - that's OK, just show empty state
          setScorecardData({ pillarScores: null, snapshots: [], engagementId: null });
          return;
        }
        throw new Error('Failed to fetch scorecard');
      }
      const data = await response.json();
      setScorecardData({
        pillarScores: data.pillarScores || null,
        snapshots: data.snapshotScores || [],
        engagementId: data.id || null,
      });
    } catch (error) {
      setScorecardError(error instanceof Error ? error.message : 'Failed to load scorecard');
    } finally {
      setScorecardLoading(false);
    }
  }, [authData.token, authData.tenantId, isConsultingTier]);

  // Fetch all dashboard data when auth is available (single API call)
  useEffect(() => {
    if (authData.token) {
      fetchDashboard();
    }
  }, [authData.token, fetchDashboard]);

  // Fetch scorecard when user is CONSULTING tier
  useEffect(() => {
    if (authData.token && isConsultingTier && !tierLoading) {
      fetchScorecard();
    }
  }, [authData.token, isConsultingTier, tierLoading, fetchScorecard]);

  // ============ CRUD FUNCTIONS ============

  const createHeadwind = async () => {
    if (!authData.token || !newHeadwind.title.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/headwinds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newHeadwind.title,
          description: newHeadwind.description,
          priority: newHeadwind.priority,
          category: newHeadwind.category,
          status: 'OPEN',
        }),
      });
      if (!response.ok) throw new Error('Failed to create headwind');
      setNewHeadwind({ title: '', description: '', priority: 'P2', category: 'TASK' });
      setShowHeadwindForm(false);
      fetchHeadwinds();
    } catch (error) {
      console.error('Error creating headwind:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resolveHeadwind = async (id: string) => {
    if (!authData.token) return;
    try {
      const response = await fetch(`/api/headwinds/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CLOSED' }),
      });
      if (!response.ok) throw new Error('Failed to resolve headwind');
      fetchHeadwinds();
      fetchVictories();
    } catch (error) {
      console.error('Error resolving headwind:', error);
    }
  };

  const createHorizonItem = async () => {
    if (!authData.token || !newHorizonItem.title.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/horizon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newHorizonItem.title,
          description: newHorizonItem.description,
          category: newHorizonItem.category,
          status: 'PARKED',
        }),
      });
      if (!response.ok) throw new Error('Failed to create horizon item');
      setNewHorizonItem({ title: '', description: '', category: '' });
      setShowHorizonForm(false);
      fetchHorizonItems();
    } catch (error) {
      console.error('Error creating horizon item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const promoteToHeadwind = async (horizonItem: HorizonItem) => {
    if (!authData.token) return;
    try {
      // Create headwind from horizon item
      const response = await fetch('/api/headwinds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: horizonItem.title,
          description: horizonItem.description,
          priority: 'P2',
          category: 'TASK',
          status: 'OPEN',
        }),
      });
      if (!response.ok) throw new Error('Failed to promote to headwind');

      // Delete from horizon
      await fetch(`/api/horizon/${horizonItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });

      fetchHeadwinds();
      fetchHorizonItems();
    } catch (error) {
      console.error('Error promoting to headwind:', error);
    }
  };

  const createGoal = async () => {
    if (!authData.token || !newGoal.title.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/hq-goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newGoal.title,
          description: newGoal.description,
          scope: newGoalScope,
          priority: newGoal.priority,
          progress: 0,
          targetValue: newGoal.targetValue ? parseFloat(newGoal.targetValue) : undefined,
          currentValue: newGoal.currentValue ? parseFloat(newGoal.currentValue) : undefined,
          dueDate: newGoal.dueDate || undefined,
          ownerName: newGoal.ownerName || undefined,
        }),
      });
      if (!response.ok) throw new Error('Failed to create goal');
      setNewGoal({ title: '', description: '', priority: 'P2', targetValue: '', currentValue: '', dueDate: '', ownerName: '' });
      setShowGoalForm(false);
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    if (!authData.token) return;
    try {
      const status = progress >= 100 ? 'COMPLETED' : 'ACTIVE';
      const response = await fetch(`/api/hq-goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress, status }),
      });
      if (!response.ok) throw new Error('Failed to update goal');
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const updateKeystone = async (keystoneId: string, value: string) => {
    if (!authData.token) return;
    try {
      const response = await fetch(`/api/keystones/${keystoneId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) throw new Error('Failed to update keystone');
      setEditingKeystone(null);
      fetchKeystones();
    } catch (error) {
      console.error('Error updating keystone:', error);
    }
  };

  const createLedgerEntry = async () => {
    if (!authData.token || !newLedgerEntry.name.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: ledgerTab,
          name: newLedgerEntry.name,
          value: newLedgerEntry.value,
          target: newLedgerEntry.target || undefined,
          owner: newLedgerEntry.owner || undefined,
          progress: newLedgerEntry.progress || 0,
          status: 'ON_TRACK',
        }),
      });
      if (!response.ok) throw new Error('Failed to create ledger entry');
      setNewLedgerEntry({ name: '', value: '', target: '', owner: '', progress: 0 });
      setShowLedgerForm(false);
      fetchLedgerEntries();
    } catch (error) {
      console.error('Error creating ledger entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateLedgerEntry = async (entryId: string, updates: Partial<LedgerEntry>) => {
    if (!authData.token) return;
    try {
      const response = await fetch(`/api/ledger/${entryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update ledger entry');
      fetchLedgerEntries();
    } catch (error) {
      console.error('Error updating ledger entry:', error);
    }
  };

  const deleteLedgerEntry = async (entryId: string) => {
    if (!authData.token) return;
    try {
      const response = await fetch(`/api/ledger/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to delete ledger entry');
      fetchLedgerEntries();
    } catch (error) {
      console.error('Error deleting ledger entry:', error);
    }
  };

  // ============ FOUNDING DOCUMENT FUNCTIONS ============

  const updateFoundingField = async (field: string, value: string | FoundingValue[]) => {
    if (!authData.token) return;
    try {
      const body = field === 'values' ? { values: value } : { value };
      const response = await fetch(`/api/founding/${field}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`Failed to update ${field}`);
      fetchFoundingDocument();
      setEditingField(null);
      setEditFieldValue('');
    } catch (error) {
      console.error('Error updating founding field:', error);
    }
  };

  const saveFoundingValues = async () => {
    await updateFoundingField('values', editingValues);
  };

  const addFoundingValue = () => {
    setEditingValues([...editingValues, { title: '', description: '' }]);
  };

  const removeFoundingValue = (index: number) => {
    setEditingValues(editingValues.filter((_, i) => i !== index));
  };

  const updateFoundingValueField = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...editingValues];
    updated[index] = { ...updated[index], [field]: value };
    setEditingValues(updated);
  };

  // ============ LEGACY MILESTONE FUNCTIONS ============

  const createMilestone = async () => {
    if (!authData.token || !newMilestone.title.trim()) return;
    setSubmitting(true);
    try {
      const goals = newMilestone.goals.split('\n').filter(g => g.trim()).map(text => ({ text: text.trim(), completed: false }));
      const response = await fetch('/api/legacy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: newMilestone.year,
          title: newMilestone.title,
          description: newMilestone.description,
          goals,
          status: 'PLANNED',
          progress: 0,
        }),
      });
      if (!response.ok) throw new Error('Failed to create milestone');
      fetchLegacyMilestones();
      setShowMilestoneForm(false);
      setNewMilestone({ year: new Date().getFullYear() + 1, title: '', description: '', goals: '' });
    } catch (error) {
      console.error('Error creating milestone:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateMilestone = async (milestoneId: string, updates: Partial<LegacyMilestone>) => {
    if (!authData.token) return;
    try {
      const response = await fetch(`/api/legacy/${milestoneId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update milestone');
      fetchLegacyMilestones();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const toggleGoalCompletion = async (milestoneId: string, goalIndex: number) => {
    const milestone = legacyMilestones.find(m => m.id === milestoneId);
    if (!milestone || !milestone.goals) return;

    const updatedGoals = milestone.goals.map((g, i) =>
      i === goalIndex ? { ...g, completed: !g.completed } : g
    );

    const completedCount = updatedGoals.filter(g => g.completed).length;
    const progress = Math.round((completedCount / updatedGoals.length) * 100);

    await updateMilestone(milestoneId, { goals: updatedGoals, progress });
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!authData.token) return;
    try {
      const response = await fetch(`/api/legacy/${milestoneId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'x-tenant-id': authData.tenantId || '',
        },
      });
      if (!response.ok) throw new Error('Failed to delete milestone');
      fetchLegacyMilestones();
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  // ============ ICON MAPPING ============
  const iconMap: Record<string, React.ReactNode> = {
    briefcase: <Briefcase size={20} />,
    barChart: <BarChart3 size={20} />,
    settings: <Settings size={20} />,
    palette: <Palette size={20} />,
    users: <Users size={20} />,
    monitor: <Monitor size={20} />,
    clipboard: <ClipboardList size={20} />,
    building: <Building2 size={20} />,
    swords: <Swords size={20} />,
    wind: <Wind size={20} />,
    fileText: <FileText size={20} />,
    trophy: <Trophy size={20} />,
    bookOpen: <BookOpen size={20} />,
    calendar: <Calendar size={20} />,
    target: <Target size={20} />,
    rocket: <Rocket size={20} />,
    star: <Star size={20} />,
    map: <Map size={20} />,
    sparkles: <Sparkles size={20} />,
    check: <Check size={20} />,
    scale: <Scale size={20} />,
  };

  const getIcon = (key: string, size: number = 20) => {
    const icons: Record<string, React.ReactNode> = {
      briefcase: <Briefcase size={size} />,
      barChart: <BarChart3 size={size} />,
      settings: <Settings size={size} />,
      palette: <Palette size={size} />,
      users: <Users size={size} />,
      monitor: <Monitor size={size} />,
      clipboard: <ClipboardList size={size} />,
      building: <Building2 size={size} />,
      swords: <Swords size={size} />,
      wind: <Wind size={size} />,
      fileText: <FileText size={size} />,
      trophy: <Trophy size={size} />,
      bookOpen: <BookOpen size={size} />,
      calendar: <Calendar size={size} />,
      target: <Target size={size} />,
      rocket: <Rocket size={size} />,
      star: <Star size={size} />,
      map: <Map size={size} />,
      sparkles: <Sparkles size={size} />,
      check: <Check size={size} />,
      scale: <Scale size={size} />,
    };
    return icons[key] || <Briefcase size={size} />;
  };

  // ============ STATIC DATA (for non-API sections) ============

  // Keystones now fetched from API via keystones state

  const quickNavButtons = [
    { id: 'assembly', icon: 'building', label: 'Assembly', description: 'Meetings & Agendas' },
    { id: 'campaigns', icon: 'swords', label: 'Campaigns', description: 'Goals & Priorities' },
    { id: 'headwinds', icon: 'wind', label: 'Headwinds', description: 'Challenges & Issues' },
    { id: 'founding', icon: 'fileText', label: 'Founding Principles', description: 'Vision & Values' },
    { id: 'legacy', icon: 'trophy', label: 'The Legacy', description: '3-5 Year Vision' },
    { id: 'ledger', icon: 'bookOpen', label: 'The Ledger', description: 'Metrics & Scores' },
  ];

  const todayAssembly = {
    title: 'Weekly Assembly',
    time: '9:00 AM',
    agenda: ['Review Keystones', 'Headwinds Update', 'Campaign Progress', 'Victories', 'Action Items'],
    attendees: 5
  };

  // Campaign items now fetched from API via personalGoals, quarterlyGoals, annualGoals state
  // Founding document now fetched from API via foundingDoc state
  // Legacy milestones now fetched from API via legacyMilestones state

  // Ledger entries now fetched from API via ledgerEntries state

  // Helper to filter ledger entries by category
  const getFilteredLedgerEntries = (category: 'COMPANY' | 'TEAM' | 'PERSONAL') => {
    return ledgerEntries.filter(entry => entry.category === category);
  };

  // Helper to get status style for ledger entries
  const getLedgerStatusStyle = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return { color: '#28A745', bg: 'rgba(40, 167, 69, 0.15)', label: 'On Track' };
      case 'AT_RISK': return { color: '#F0B323', bg: 'rgba(240, 179, 35, 0.15)', label: 'At Risk' };
      case 'BEHIND': return { color: '#DC3545', bg: 'rgba(220, 53, 69, 0.15)', label: 'Behind' };
      case 'EXCEEDED': return { color: '#0288D1', bg: 'rgba(2, 136, 209, 0.15)', label: 'Exceeded' };
      default: return { color: '#8888A0', bg: 'rgba(136, 136, 160, 0.15)', label: status };
    }
  };

  // ============ HELPER FUNCTIONS ============

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return '#28A745';
    if (trend === 'down') return '#DC3545';
    return '#8888A0';
  };

  const getPriorityStyle = (priority: string) => {
    if (priority === 'P1' || priority === 'high') return { bg: 'rgba(220, 53, 69, 0.1)', color: '#DC3545', label: priority === 'P1' ? 'P1' : 'HIGH' };
    if (priority === 'P2' || priority === 'medium') return { bg: 'rgba(240, 179, 35, 0.1)', color: '#B8860B', label: priority === 'P2' ? 'P2' : 'MEDIUM' };
    return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D', label: priority === 'P3' ? 'P3' : 'LOW' };
  };

  const getStatusStyle = (status: string) => {
    if (status === 'complete') return { bg: 'rgba(40, 167, 69, 0.1)', color: '#28A745', label: 'COMPLETE' };
    if (status === 'ahead') return { bg: 'rgba(40, 167, 69, 0.1)', color: '#28A745', label: 'AHEAD' };
    if (status === 'on-track') return { bg: 'rgba(0, 123, 255, 0.1)', color: '#007BFF', label: 'ON TRACK' };
    if (status === 'at-risk') return { bg: 'rgba(220, 53, 69, 0.1)', color: '#DC3545', label: 'AT RISK' };
    return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D', label: status.toUpperCase() };
  };

  const getStatusDot = (status: string) => {
    if (status === 'green') return '#28A745';
    if (status === 'yellow') return '#F0B323';
    if (status === 'red') return '#DC3545';
    return '#6C757D';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getDaysOld = (dateStr: string) => {
    const created = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  // ============ LOADING SPINNER COMPONENT ============

  const LoadingSpinner = ({ text = 'Loading...' }: { text?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#8888A0' }}>
      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
      {text}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', color: '#DC3545', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '8px', gap: '0.5rem' }}>
      <AlertCircle size={18} />
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{ marginLeft: '1rem', padding: '0.25rem 0.75rem', background: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Retry
        </button>
      )}
    </div>
  );

  // ============ MODAL CONTENT RENDERERS ============

  const renderAssemblyContent = () => (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #2A2A38', paddingBottom: '1rem' }}>
        {[
          { id: 'upcoming', label: 'Upcoming', count: upcomingMeetings.length },
          { id: 'past', label: 'Past Meetings', count: pastMeetings.length },
          { id: 'templates', label: 'Templates', count: meetingTemplates.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab.id ? '#00CCEE' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#8888A0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#09090F',
              padding: '0.15rem 0.5rem',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Upcoming Meetings */}
      {activeTab === 'upcoming' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#F0F0F5' }}>Upcoming Assemblies</h3>
            <button style={{ padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Schedule New</button>
          </div>
          {meetingsLoading ? (
            <LoadingSpinner text="Loading meetings..." />
          ) : meetingsError ? (
            <ErrorMessage message={meetingsError} onRetry={fetchUpcomingMeetings} />
          ) : upcomingMeetings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>No upcoming meetings scheduled</div>
          ) : (
            upcomingMeetings.map((meeting) => (
              <div key={meeting.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
                <div style={{ width: '50px', height: '50px', background: '#1C1C26', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #2A2A38' }}>
                  <span style={{ fontSize: '0.65rem', color: '#8888A0', textTransform: 'uppercase' }}>{formatDate(meeting.startTime).split(' ')[0]}</span>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#F0F0F5' }}>{formatDate(meeting.startTime) === 'Today' || formatDate(meeting.startTime) === 'Tomorrow' ? '•' : formatDate(meeting.startTime).split(' ')[1]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{meeting.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>{formatTime(meeting.startTime)}{meeting.attendees ? ` • ${meeting.attendees} attendees` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ padding: '0.5rem 1rem', background: '#13131A', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Join</button>
                  <button style={{ padding: '0.5rem 1rem', background: '#1C1C26', color: '#F0F0F5', border: '1px solid #2A2A38', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Agenda</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Past Meetings */}
      {activeTab === 'past' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#F0F0F5' }}>Meeting History</h3>
          {pastMeetingsLoading ? (
            <LoadingSpinner text="Loading past meetings..." />
          ) : pastMeetings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>No past meetings found</div>
          ) : (
            pastMeetings.map((meeting) => (
              <div key={meeting.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
                <div style={{ width: '50px', height: '50px', background: '#1C1C26', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #2A2A38' }}>
                  <ClipboardList size={24} style={{ color: '#00CCEE' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{meeting.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>{formatDate(meeting.startTime)}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ padding: '0.5rem 1rem', background: '#1C1C26', color: '#F0F0F5', border: '1px solid #2A2A38', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>View Notes</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#F0F0F5' }}>Meeting Templates</h3>
          {templatesLoading ? (
            <LoadingSpinner text="Loading templates..." />
          ) : templatesError ? (
            <ErrorMessage message={templatesError} onRetry={fetchMeetingTemplates} />
          ) : meetingTemplates.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>No meeting templates available</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {meetingTemplates.map((template) => (
                <div key={template.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', border: '2px solid #2A2A38' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#00CCEE' }}>{getIcon('calendar', 28)}</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#F0F0F5' }}>{template.name}</div>
                      {template.duration && <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>{template.duration}</div>}
                    </div>
                  </div>
                  {template.description && <p style={{ fontSize: '0.85rem', color: '#8888A0', margin: '0 0 1rem 0' }}>{template.description}</p>}
                  <button style={{ width: '100%', padding: '0.5rem', background: '#13131A', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Use Template</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderCampaignsContent = () => (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #2A2A38', paddingBottom: '1rem' }}>
        {[
          { id: 'my', label: 'My Campaign' },
          { id: 'quarterly', label: 'Quarterly' },
          { id: 'annual', label: 'Annual' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab.id ? '#00CCEE' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#8888A0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Campaign */}
      {activeTab === 'my' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#F0F0F5' }}>My Campaign</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#8888A0' }}>Your personal priorities for this quarter</p>
            </div>
            <button onClick={() => { setNewGoalScope('PERSONAL'); setShowGoalForm(true); }} style={{ padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Add Priority</button>
          </div>
          {goalsLoading ? (
            <LoadingSpinner text="Loading goals..." />
          ) : goalsError ? (
            <ErrorMessage message={goalsError} onRetry={fetchGoals} />
          ) : personalGoals.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0', background: '#09090F', borderRadius: '10px' }}>
              <Target size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div>No personal goals yet</div>
              <button onClick={() => { setNewGoalScope('PERSONAL'); setShowGoalForm(true); }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add Your First Goal</button>
            </div>
          ) : (
            personalGoals.map((item) => (
              <div key={item.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem', borderLeft: `4px solid ${item.progress === 100 ? '#28A745' : '#00CCEE'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                      {item.targetValue && `Target: ${item.targetValue}`}
                      {item.currentValue && ` • Current: ${item.currentValue}`}
                      {item.dueDate && ` • Due: ${formatDate(item.dueDate)}`}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: item.progress === 100 ? '#28A745' : '#F0F0F5' }}>{item.progress}%</span>
                </div>
                <div style={{ height: '10px', background: '#1C1C26', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: item.progress + '%', height: '100%', background: item.progress === 100 ? '#28A745' : '#00CCEE', borderRadius: '5px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quarterly Campaigns */}
      {activeTab === 'quarterly' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#F0F0F5' }}>Quarterly Campaigns</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#8888A0' }}>Team-wide quarterly priorities</p>
            </div>
            <button onClick={() => { setNewGoalScope('QUARTERLY'); setShowGoalForm(true); }} style={{ padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Add Campaign</button>
          </div>
          {goalsLoading ? (
            <LoadingSpinner text="Loading campaigns..." />
          ) : goalsError ? (
            <ErrorMessage message={goalsError} onRetry={fetchGoals} />
          ) : quarterlyGoals.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0', background: '#09090F', borderRadius: '10px' }}>
              <Rocket size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div>No quarterly campaigns yet</div>
              <button onClick={() => { setNewGoalScope('QUARTERLY'); setShowGoalForm(true); }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add First Campaign</button>
            </div>
          ) : (
            quarterlyGoals.map((item) => {
              const statusLabel = item.progress >= 100 ? 'Complete' : item.progress >= 75 ? 'On Track' : item.progress >= 50 ? 'In Progress' : 'At Risk';
              const statusColor = item.progress >= 100 ? '#28A745' : item.progress >= 75 ? '#28A745' : item.progress >= 50 ? '#F0B323' : '#DC3545';
              return (
                <div key={item.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>{item.ownerName ? `Owner: ${item.ownerName}` : item.quarter ? `${item.quarter} ${item.year || ''}` : ''}</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '12px', background: `${statusColor}22`, color: statusColor }}>{statusLabel}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '10px', background: '#1C1C26', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: item.progress + '%', height: '100%', background: statusColor, borderRadius: '5px' }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F0F0F5', minWidth: '45px' }}>{item.progress}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Annual Campaigns */}
      {activeTab === 'annual' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#F0F0F5' }}>Annual Campaign</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#8888A0' }}>Company-wide annual objectives</p>
            </div>
            <button onClick={() => { setNewGoalScope('ANNUAL'); setShowGoalForm(true); }} style={{ padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Add Objective</button>
          </div>
          {goalsLoading ? (
            <LoadingSpinner text="Loading objectives..." />
          ) : goalsError ? (
            <ErrorMessage message={goalsError} onRetry={fetchGoals} />
          ) : annualGoals.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0', background: '#09090F', borderRadius: '10px' }}>
              <Star size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div>No annual objectives yet</div>
              <button onClick={() => { setNewGoalScope('ANNUAL'); setShowGoalForm(true); }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add First Objective</button>
            </div>
          ) : (
            annualGoals.map((item) => (
              <div key={item.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                      {item.targetValue && `Target: ${item.targetValue}`}
                      {item.currentValue && ` • Current: ${item.currentValue}`}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F0F0F5' }}>{item.progress}%</span>
                </div>
                <div style={{ height: '10px', background: '#1C1C26', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: item.progress + '%', height: '100%', background: item.progress >= 75 ? '#28A745' : item.progress >= 50 ? '#F0B323' : '#DC3545', borderRadius: '5px' }} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderHeadwindsContent = () => (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #2A2A38', paddingBottom: '1rem' }}>
        {[
          { id: 'active', label: 'Active Headwinds', count: headwinds.length },
          { id: 'victories', label: 'Victories', count: victories.length },
          { id: 'horizon', label: 'The Horizon', count: horizonItems.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab.id ? '#00CCEE' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#8888A0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#09090F',
              padding: '0.15rem 0.5rem',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Active Headwinds */}
      {activeTab === 'active' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#F0F0F5' }}>Active Headwinds</h3>
            <button
              onClick={() => setShowHeadwindForm(true)}
              style={{ padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Plus size={16} /> Add Headwind
            </button>
          </div>

          {/* Create Headwind Form */}
          {showHeadwindForm && (
            <div style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '1rem', border: '2px solid #00CCEE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#F0F0F5' }}>New Headwind</h4>
                <button onClick={() => setShowHeadwindForm(false)} style={{ background: 'none', border: 'none', color: '#8888A0', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <input
                type="text"
                placeholder="Headwind title..."
                value={newHeadwind.title}
                onChange={(e) => setNewHeadwind({ ...newHeadwind, title: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', marginBottom: '0.75rem', fontSize: '0.9rem' }}
              />
              <textarea
                placeholder="Description (optional)..."
                value={newHeadwind.description}
                onChange={(e) => setNewHeadwind({ ...newHeadwind, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', marginBottom: '0.75rem', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <select
                  value={newHeadwind.priority}
                  onChange={(e) => setNewHeadwind({ ...newHeadwind, priority: e.target.value as 'P1' | 'P2' | 'P3' })}
                  style={{ flex: 1, padding: '0.5rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5' }}
                >
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - High</option>
                  <option value="P3">P3 - Normal</option>
                </select>
                <select
                  value={newHeadwind.category}
                  onChange={(e) => setNewHeadwind({ ...newHeadwind, category: e.target.value as 'BUG' | 'REBUILD' | 'NEW_BUILD' | 'ENHANCEMENT' | 'TASK' })}
                  style={{ flex: 1, padding: '0.5rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5' }}
                >
                  <option value="TASK">Task</option>
                  <option value="BUG">Bug</option>
                  <option value="ENHANCEMENT">Enhancement</option>
                  <option value="NEW_BUILD">New Build</option>
                  <option value="REBUILD">Rebuild</option>
                </select>
              </div>
              <button
                onClick={createHeadwind}
                disabled={!newHeadwind.title.trim() || submitting}
                style={{ padding: '0.75rem 1.5rem', background: newHeadwind.title.trim() ? '#00CCEE' : '#2A2A38', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: newHeadwind.title.trim() ? 'pointer' : 'not-allowed' }}
              >
                {submitting ? 'Creating...' : 'Create Headwind'}
              </button>
            </div>
          )}

          {headwindsLoading ? (
            <LoadingSpinner text="Loading headwinds..." />
          ) : headwindsError ? (
            <ErrorMessage message={headwindsError} onRetry={fetchHeadwinds} />
          ) : headwinds.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>No active headwinds. Great job!</div>
          ) : (
            headwinds.map((item) => {
              const priorityStyle = getPriorityStyle(item.priority);
              const daysOld = getDaysOld(item.createdAt);
              return (
                <div key={item.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem', borderLeft: `4px solid ${priorityStyle.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.35rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                        {item.owner && `Owner: ${item.owner} • `}
                        Category: {item.category} • {daysOld} days old
                      </div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '12px', background: priorityStyle.bg, color: priorityStyle.color }}>{priorityStyle.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      onClick={() => resolveHeadwind(item.id)}
                      style={{ padding: '0.4rem 0.75rem', background: '#28A745', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Check size={14} /> Mark Resolved
                    </button>
                    <button style={{ padding: '0.4rem 0.75rem', background: '#1C1C26', color: '#F0F0F5', border: '1px solid #2A2A38', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Discuss in Assembly</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Victories */}
      {activeTab === 'victories' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trophy size={20} style={{ color: '#00CCEE' }} /> Victories - Resolved Headwinds</h3>
          {victoriesLoading ? (
            <LoadingSpinner text="Loading victories..." />
          ) : victoriesError ? (
            <ErrorMessage message={victoriesError} onRetry={fetchVictories} />
          ) : victories.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>No victories yet. Keep pushing!</div>
          ) : (
            victories.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'rgba(40, 167, 69, 0.05)', borderRadius: '10px', marginBottom: '0.75rem', borderLeft: '4px solid #28A745' }}>
                <Check size={20} style={{ color: '#28A745' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                    Resolved: {item.resolvedAt ? formatDate(item.resolvedAt) : formatDate(item.createdAt)}
                    {item.owner && ` • By: ${item.owner}`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* The Horizon */}
      {activeTab === 'horizon' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#F0F0F5' }}>The Horizon</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#8888A0' }}>Future considerations and parking lot items</p>
            </div>
            <button
              onClick={() => setShowHorizonForm(true)}
              style={{ padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Plus size={16} /> Add to Horizon
            </button>
          </div>

          {/* Create Horizon Item Form */}
          {showHorizonForm && (
            <div style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '1rem', border: '2px solid #00CCEE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#F0F0F5' }}>New Horizon Item</h4>
                <button onClick={() => setShowHorizonForm(false)} style={{ background: 'none', border: 'none', color: '#8888A0', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <input
                type="text"
                placeholder="Idea title..."
                value={newHorizonItem.title}
                onChange={(e) => setNewHorizonItem({ ...newHorizonItem, title: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', marginBottom: '0.75rem', fontSize: '0.9rem' }}
              />
              <textarea
                placeholder="Description (optional)..."
                value={newHorizonItem.description}
                onChange={(e) => setNewHorizonItem({ ...newHorizonItem, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', marginBottom: '0.75rem', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical' }}
              />
              <input
                type="text"
                placeholder="Category (e.g., Technology, Growth, Operations)..."
                value={newHorizonItem.category}
                onChange={(e) => setNewHorizonItem({ ...newHorizonItem, category: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', marginBottom: '1rem', fontSize: '0.9rem' }}
              />
              <button
                onClick={createHorizonItem}
                disabled={!newHorizonItem.title.trim() || submitting}
                style={{ padding: '0.75rem 1.5rem', background: newHorizonItem.title.trim() ? '#00CCEE' : '#2A2A38', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: newHorizonItem.title.trim() ? 'pointer' : 'not-allowed' }}
              >
                {submitting ? 'Creating...' : 'Add to Horizon'}
              </button>
            </div>
          )}

          {horizonLoading ? (
            <LoadingSpinner text="Loading horizon items..." />
          ) : horizonError ? (
            <ErrorMessage message={horizonError} onRetry={fetchHorizonItems} />
          ) : horizonItems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>No items on the horizon. Add future ideas here!</div>
          ) : (
            horizonItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
                <Sparkles size={20} style={{ color: '#8888A0' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                    Added: {formatDate(item.createdAt)}
                    {item.category && ` • Category: ${item.category}`}
                  </div>
                </div>
                <button
                  onClick={() => promoteToHeadwind(item)}
                  style={{ padding: '0.4rem 0.75rem', background: '#1C1C26', color: '#F0F0F5', border: '1px solid #2A2A38', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  Promote to Headwind
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderFoundingContent = () => {
    if (foundingLoading) {
      return <LoadingSpinner text="Loading founding document..." />;
    }

    if (foundingError) {
      return <ErrorMessage message={foundingError} onRetry={fetchFoundingDocument} />;
    }

    const renderEditableSection = (field: 'vision' | 'mission' | 'story', icon: React.ReactNode, title: string, placeholder: string) => {
      const value = foundingDoc?.[field] || '';
      const isEditing = editingField === field;

      return (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#00CCEE' }}>{icon}</span>
              <h3 style={{ margin: 0, color: '#F0F0F5' }}>{title}</h3>
            </div>
            <button
              onClick={() => {
                if (isEditing) {
                  updateFoundingField(field, editFieldValue);
                } else {
                  setEditingField(field);
                  setEditFieldValue(value);
                }
              }}
              style={{
                background: isEditing ? '#00CCEE' : 'transparent',
                color: isEditing ? 'white' : '#00CCEE',
                border: isEditing ? 'none' : '1px solid #00CCEE',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
          <div style={{ padding: '1.5rem', background: field === 'story' ? 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)' : '#1C1C26', borderRadius: '10px', borderLeft: field !== 'story' ? '4px solid #00CCEE' : 'none' }}>
            {isEditing ? (
              <textarea
                value={editFieldValue}
                onChange={(e) => setEditFieldValue(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%',
                  minHeight: field === 'story' ? '150px' : '80px',
                  background: '#09090F',
                  border: '1px solid #2A2A38',
                  borderRadius: '8px',
                  padding: '1rem',
                  color: '#F0F0F5',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  resize: 'vertical'
                }}
              />
            ) : value ? (
              <p style={{ margin: 0, fontSize: field === 'story' ? '1rem' : '1.1rem', color: field === 'story' ? 'white' : '#F0F0F5', lineHeight: field === 'story' ? '1.8' : '1.6', fontStyle: field !== 'story' ? 'italic' : 'normal' }}>
                {field !== 'story' ? `"${value}"` : value}
              </p>
            ) : (
              <p style={{ margin: 0, color: '#8888A0', fontStyle: 'italic' }}>{placeholder}</p>
            )}
          </div>
        </div>
      );
    };

    const values = (foundingDoc?.values as FoundingValue[]) || [];
    const isEditingValues = editingField === 'values';

    return (
      <div>
        {renderEditableSection('vision', <Target size={28} />, 'Vision', 'What is your company\'s vision? What future are you creating?')}
        {renderEditableSection('mission', <Rocket size={28} />, 'Mission', 'What is your company\'s mission? What do you do and for whom?')}

        {/* Core Values */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#00CCEE' }}><Scale size={28} /></span>
              <h3 style={{ margin: 0, color: '#F0F0F5' }}>Core Values</h3>
            </div>
            <button
              onClick={() => {
                if (isEditingValues) {
                  saveFoundingValues();
                } else {
                  setEditingField('values');
                  setEditingValues([...values]);
                }
              }}
              style={{
                background: isEditingValues ? '#00CCEE' : 'transparent',
                color: isEditingValues ? 'white' : '#00CCEE',
                border: isEditingValues ? 'none' : '1px solid #00CCEE',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              {isEditingValues ? 'Save' : 'Edit'}
            </button>
          </div>

          {isEditingValues ? (
            <div>
              {editingValues.map((value, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      value={value.title}
                      onChange={(e) => updateFoundingValueField(index, 'title', e.target.value)}
                      placeholder="Value title..."
                      style={{ width: '100%', padding: '0.75rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', marginBottom: '0.5rem' }}
                    />
                    <textarea
                      value={value.description}
                      onChange={(e) => updateFoundingValueField(index, 'description', e.target.value)}
                      placeholder="Description..."
                      rows={2}
                      style={{ width: '100%', padding: '0.75rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', resize: 'vertical' }}
                    />
                  </div>
                  <button onClick={() => removeFoundingValue(index)} style={{ background: '#DC3545', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button onClick={addFoundingValue} style={{ background: '#1C1C26', border: '2px dashed #2A2A38', color: '#8888A0', padding: '1rem', borderRadius: '8px', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Add Value
              </button>
            </div>
          ) : values.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {values.map((value, index) => (
                <div key={index} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', borderTop: '3px solid #00CCEE' }}>
                  <div style={{ fontWeight: '700', color: '#F0F0F5', marginBottom: '0.5rem', fontSize: '1rem' }}>{value.title}</div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#8888A0', lineHeight: '1.5' }}>{value.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0', background: '#1C1C26', borderRadius: '10px' }}>
              No values defined yet. Click Edit to add your company's core values.
            </div>
          )}
        </div>

        {renderEditableSection('story', <BookOpen size={28} />, 'Our Story', 'Tell your company\'s origin story. What drives you?')}
      </div>
    );
  };

  const renderLegacyContent = () => {
    if (legacyLoading) {
      return <LoadingSpinner text="Loading legacy roadmap..." />;
    }

    if (legacyError) {
      return <ErrorMessage message={legacyError} onRetry={fetchLegacyMilestones} />;
    }

    const getStatusBadge = (status: string) => {
      const styles: Record<string, { bg: string; color: string }> = {
        PLANNED: { bg: 'rgba(108, 117, 125, 0.2)', color: '#6C757D' },
        IN_PROGRESS: { bg: 'rgba(0, 204, 238, 0.2)', color: '#00CCEE' },
        COMPLETED: { bg: 'rgba(40, 167, 69, 0.2)', color: '#28A745' },
        DEFERRED: { bg: 'rgba(240, 179, 35, 0.2)', color: '#F0B323' },
      };
      const style = styles[status] || styles.PLANNED;
      return (
        <span style={{ background: style.bg, color: style.color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>
          {status}
        </span>
      );
    };

    return (
      <div>
        {/* Legacy Vision - pulled from Founding Document */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ color: '#00CCEE' }}><Star size={28} /></span>
            <h3 style={{ margin: 0, color: '#F0F0F5' }}>The Legacy We're Building</h3>
          </div>
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)', borderRadius: '10px', color: 'white' }}>
            {foundingDoc?.vision ? (
              <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.7' }}>{foundingDoc.vision}</p>
            ) : (
              <p style={{ margin: 0, color: '#8888A0', fontStyle: 'italic' }}>Define your vision in the Founding Principles to see it here as your north star.</p>
            )}
          </div>
        </div>

        {/* 3-5 Year Roadmap */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#00CCEE' }}><Map size={28} /></span>
              <h3 style={{ margin: 0, color: '#F0F0F5' }}>3-5 Year Roadmap</h3>
            </div>
            <button
              onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              style={{
                background: showMilestoneForm ? '#DC3545' : '#00CCEE',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600'
              }}
            >
              {showMilestoneForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Milestone</>}
            </button>
          </div>

          {/* Add Milestone Form */}
          {showMilestoneForm && (
            <div style={{ background: '#1C1C26', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid #00CCEE' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8888A0', fontSize: '0.85rem' }}>Year</label>
                  <input
                    type="number"
                    value={newMilestone.year}
                    onChange={(e) => setNewMilestone({ ...newMilestone, year: parseInt(e.target.value) })}
                    min={2024}
                    max={2100}
                    style={{ width: '100%', padding: '0.75rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8888A0', fontSize: '0.85rem' }}>Title</label>
                  <input
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    placeholder="e.g., Market Expansion"
                    style={{ width: '100%', padding: '0.75rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8888A0', fontSize: '0.85rem' }}>Description (optional)</label>
                <input
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  placeholder="Brief description of this milestone..."
                  style={{ width: '100%', padding: '0.75rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#8888A0', fontSize: '0.85rem' }}>Goals (one per line)</label>
                <textarea
                  value={newMilestone.goals}
                  onChange={(e) => setNewMilestone({ ...newMilestone, goals: e.target.value })}
                  placeholder="Reach 1,000 customers&#10;Launch mobile app&#10;Expand to 3 new markets"
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', resize: 'vertical' }}
                />
              </div>
              <button
                onClick={createMilestone}
                disabled={submitting || !newMilestone.title.trim()}
                style={{
                  background: '#00CCEE',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  opacity: submitting || !newMilestone.title.trim() ? 0.5 : 1
                }}
              >
                {submitting ? 'Creating...' : 'Create Milestone'}
              </button>
            </div>
          )}

          {legacyMilestones.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0', background: '#1C1C26', borderRadius: '10px' }}>
              <Map size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No milestones yet. Add your first milestone to start building your legacy roadmap.</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', left: '24px', top: '40px', bottom: '40px', width: '2px', background: 'var(--zander-border-gray)' }} />

              {legacyMilestones.map((milestone) => (
                <div key={milestone.id} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                  {/* Year circle */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: milestone.status === 'COMPLETED' ? '#28A745' : milestone.progress > 0 ? '#00CCEE' : 'var(--zander-border-gray)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    zIndex: 1
                  }}>
                    {milestone.year}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '1rem 1.25rem', background: '#09090F', borderRadius: '10px', borderLeft: `4px solid ${milestone.status === 'COMPLETED' ? '#28A745' : milestone.progress > 0 ? '#00CCEE' : 'var(--zander-border-gray)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: '700', color: '#F0F0F5', fontSize: '1.1rem' }}>{milestone.title}</span>
                        {getStatusBadge(milestone.status)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {milestone.progress > 0 && (
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#00CCEE' }}>{milestone.progress}%</span>
                        )}
                        <button
                          onClick={() => deleteMilestone(milestone.id)}
                          style={{ background: 'transparent', border: 'none', color: '#DC3545', cursor: 'pointer', padding: '0.25rem' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {milestone.description && (
                      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#8888A0' }}>{milestone.description}</p>
                    )}

                    {milestone.goals && milestone.goals.length > 0 && (
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {milestone.goals.map((goal, i) => (
                          <li
                            key={i}
                            onClick={() => toggleGoalCompletion(milestone.id, i)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.9rem',
                              color: goal.completed ? '#28A745' : '#8888A0',
                              marginBottom: '0.35rem',
                              cursor: 'pointer',
                              textDecoration: goal.completed ? 'line-through' : 'none'
                            }}
                          >
                            <span style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: goal.completed ? '2px solid #28A745' : '2px solid #2A2A38',
                              background: goal.completed ? '#28A745' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {goal.completed && <Check size={12} color="white" />}
                            </span>
                            {goal.text}
                          </li>
                        ))}
                      </ul>
                    )}

                    {milestone.progress > 0 && (
                      <div style={{ marginTop: '0.75rem', height: '6px', background: '#1C1C26', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: milestone.progress + '%', height: '100%', background: milestone.status === 'COMPLETED' ? '#28A745' : '#00CCEE', borderRadius: '3px' }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLedgerContent = () => {
    const companyEntries = getFilteredLedgerEntries('COMPANY');
    const teamEntries = getFilteredLedgerEntries('TEAM');
    const personalEntries = getFilteredLedgerEntries('PERSONAL');

    return (
      <div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #2A2A38', paddingBottom: '1rem' }}>
          {[
            { id: 'COMPANY', label: 'Company', count: companyEntries.length },
            { id: 'TEAM', label: 'Team', count: teamEntries.length },
            { id: 'PERSONAL', label: 'Personal', count: personalEntries.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLedgerTab(tab.id as 'COMPANY' | 'TEAM' | 'PERSONAL')}
              style={{
                padding: '0.75rem 1.25rem',
                background: ledgerTab === tab.id ? '#00CCEE' : 'transparent',
                color: ledgerTab === tab.id ? 'white' : '#8888A0',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {tab.label}
              <span style={{
                background: ledgerTab === tab.id ? 'rgba(255,255,255,0.2)' : '#2A2A38',
                padding: '0.15rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.75rem'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {ledgerLoading ? (
          <LoadingSpinner text="Loading ledger..." />
        ) : ledgerError ? (
          <ErrorMessage message={ledgerError} onRetry={fetchLedgerEntries} />
        ) : (
          <>
            {/* Company Ledger */}
            {ledgerTab === 'COMPANY' && (
              <div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#F0F0F5' }}>Company Performance</h3>
                {companyEntries.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0', background: '#09090F', borderRadius: '10px' }}>
                    No company metrics yet. Add your first metric above.
                  </div>
                ) : (
                  companyEntries.map((entry) => (
                    <div key={entry.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{entry.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>Target: {entry.target || 'Not set'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5' }}>{entry.value}</div>
                          <div style={{ fontSize: '0.8rem', color: getTrendColor(entry.trend || 'FLAT'), fontWeight: '600' }}>
                            {getTrendIcon(entry.trend || 'FLAT')} {entry.progress || 0}% of goal
                          </div>
                        </div>
                      </div>
                      <div style={{ height: '8px', background: '#1C1C26', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: Math.min(entry.progress || 0, 100) + '%',
                          height: '100%',
                          background: (entry.progress || 0) >= 90 ? '#28A745' : (entry.progress || 0) >= 70 ? '#F0B323' : '#DC3545',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Team Ledger */}
            {ledgerTab === 'TEAM' && (
              <div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#F0F0F5' }}>Team Keystones</h3>
                {teamEntries.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0', background: '#09090F', borderRadius: '10px' }}>
                    No team metrics yet. Add your first metric above.
                  </div>
                ) : (
                  <div style={{ background: '#09090F', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', padding: '0.75rem 1rem', background: '#13131A', color: 'white', fontWeight: '600', fontSize: '0.8rem' }}>
                      <div>Name</div>
                      <div>Keystone</div>
                      <div>Current</div>
                      <div>Owner</div>
                      <div style={{ textAlign: 'center' }}>Status</div>
                    </div>
                    {teamEntries.map((entry) => (
                      <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', padding: '1rem', borderBottom: '1px solid #2A2A38', alignItems: 'center' }}>
                        <div style={{ fontWeight: '600', color: '#F0F0F5' }}>{entry.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#8888A0' }}>{entry.keystone || '-'}</div>
                        <div style={{ fontWeight: '700', color: '#F0F0F5' }}>{entry.value}</div>
                        <div style={{ fontSize: '0.9rem', color: '#8888A0' }}>{entry.owner || '-'}</div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: getStatusDot(entry.status)
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Personal Ledger */}
            {ledgerTab === 'PERSONAL' && (
              <div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#F0F0F5' }}>Personal Goals</h3>
                {personalEntries.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0', background: '#09090F', borderRadius: '10px' }}>
                    No personal goals yet. Add your first goal above.
                  </div>
                ) : (
                  personalEntries.map((entry) => (
                    <div key={entry.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{entry.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>Target: {entry.target || 'Not set'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5' }}>{entry.value}</div>
                          <span style={{
                            ...getLedgerStatusStyle(entry.status),
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {entry.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {entry.progress !== undefined && (
                        <div style={{ height: '8px', background: '#1C1C26', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: Math.min(entry.progress, 100) + '%',
                            height: '100%',
                            background: entry.progress >= 90 ? '#28A745' : entry.progress >= 70 ? '#F0B323' : '#DC3545',
                            borderRadius: '4px'
                          }} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Reset tab when modal changes
  const handleModalOpen = (modalId: string) => {
    // Use the new Assembly modal for AI-generated assemblies
    if (modalId === 'assembly') {
      setShowAssemblyModal(true);
      return;
    }
    setActiveModal(modalId);
    if (modalId === 'campaigns') setActiveTab('my');
    else if (modalId === 'headwinds') setActiveTab('active');
    else if (modalId === 'ledger') setLedgerTab('COMPANY');
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#09090F' }}>
        <NavBar activeModule="cro" />


        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} />

        {/* Main Content */}
        <main style={{ marginLeft: sidebarCollapsed ? '64px' : '240px', marginTop: '64px', padding: '2rem', transition: 'margin-left 0.3s ease' }}>
          {/* Page Header */}
          <div style={{ background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#00CCEE' }}><Building2 size={48} /></span>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>Headquarters</h1>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>Your command center for alignment, accountability, and action</p>
              </div>
            </div>
          </div>

          {/* Keystones Row */}
          <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid #2A2A38' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} style={{ color: '#00CCEE' }} /> Keystones
              <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#8888A0' }}>Your vital signs at a glance</span>
            </h2>
            {keystonesLoading ? (
              <LoadingSpinner text="Loading keystones..." />
            ) : keystonesError ? (
              <ErrorMessage message={keystonesError} onRetry={fetchKeystones} />
            ) : keystones.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#8888A0', fontSize: '0.9rem' }}>No keystones configured</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(keystones.length, 7)}, 1fr)`, gap: '1rem' }}>
                {keystones.map((keystone) => (
                  <a
                    key={keystone.id}
                    href={keystone.executive === 'CRO' ? '/' : '/' + keystone.executive.toLowerCase()}
                    style={{
                      background: '#09090F',
                      borderRadius: '10px',
                      padding: '1rem',
                      textDecoration: 'none',
                      borderLeft: `4px solid ${keystone.color || '#00CCEE'}`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: keystone.color || '#00CCEE' }}>{getIcon(keystone.icon || 'target', 18)}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: keystone.color || '#00CCEE' }}>{keystone.executive}</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.15rem' }}>{keystone.value}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.65rem', color: '#8888A0' }}>{keystone.label}</span>
                      {keystone.trendValue && (
                        <span style={{ fontSize: '0.7rem', color: getTrendColor(keystone.trend || 'FLAT'), fontWeight: '600' }}>
                          {getTrendIcon(keystone.trend || 'FLAT')} {keystone.trendValue}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Consulting Client Portal - Only for CONSULTING tier users */}
          {isConsultingTier && (
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Consulting Portal Dashboard - Engagement Status, Documents, Deliverables, Time Log */}
              <ConsultingPortal
                authToken={authData.token || ''}
                tenantId={authData.tenantId}
              />

              {/* Scorecard Loading State */}
              {scorecardLoading && (
                <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '2px solid #2A2A38' }}>
                  <Loader2 size={32} style={{ color: '#00CCEE', animation: 'spin 1s linear infinite' }} />
                  <p style={{ margin: '1rem 0 0', color: '#8888A0' }}>Loading your scorecard...</p>
                </div>
              )}

              {/* Scorecard Error State */}
              {scorecardError && !scorecardLoading && (
                <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', border: '2px solid #DC3545' }}>
                  <p style={{ color: '#DC3545', margin: 0 }}>{scorecardError}</p>
                  <button
                    onClick={fetchScorecard}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#DC3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Scorecard Display */}
              {!scorecardLoading && !scorecardError && scorecardData.pillarScores && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Current Scorecard */}
                  <Scorecard
                    scores={scorecardData.pillarScores}
                    title="Operating Simply Scorecard"
                  />

                  {/* Scorecard Comparison */}
                  {scorecardData.snapshots && scorecardData.snapshots.length > 0 && (
                    <ScorecardComparison
                      currentScores={scorecardData.pillarScores}
                      snapshots={scorecardData.snapshots}
                      title="Progress Over Time"
                    />
                  )}
                </div>
              )}

              {/* No Scorecard Data State */}
              {!scorecardLoading && !scorecardError && !scorecardData.pillarScores && (
                <div style={{
                  background: '#1C1C26',
                  borderRadius: '12px',
                  padding: '3rem',
                  textAlign: 'center',
                  border: '2px solid #2A2A38'
                }}>
                  <TrendingUp size={48} style={{ color: '#55556A', marginBottom: '1rem' }} />
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#F0F0F5', fontSize: '1.25rem' }}>
                    Scorecard Coming Soon
                  </h3>
                  <p style={{ margin: 0, color: '#8888A0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Your consultant will complete your initial business assessment and your Operating Simply Scorecard will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Navigation Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {quickNavButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleModalOpen(btn.id)}
                style={{
                  background: '#1C1C26',
                  border: '2px solid #2A2A38',
                  borderRadius: '12px',
                  padding: '1.25rem 1rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00CCEE'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--zander-border-gray)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: '#00CCEE' }}>{getIcon(btn.icon, 32)}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F0F0F5', display: 'block' }}>{btn.label}</span>
                <span style={{ fontSize: '0.7rem', color: '#8888A0' }}>{btn.description}</span>
              </button>
            ))}
          </div>

          {/* Dashboard Loading State */}
          {dashboardLoading && (
            <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '3rem', marginBottom: '1.5rem', textAlign: 'center', border: '2px solid #2A2A38' }}>
              <LoadingSpinner text="Loading headquarters data..." />
            </div>
          )}

          {/* Dashboard Error State */}
          {dashboardError && !dashboardLoading && (
            <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid #DC3545' }}>
              <ErrorMessage message={dashboardError} onRetry={fetchDashboard} />
            </div>
          )}

          {/* Empty Tenant State */}
          {isEmpty && !dashboardLoading && (
            <div style={{ background: 'linear-gradient(135deg, #1C1C26 0%, #13131A 100%)', borderRadius: '12px', padding: '3rem', marginBottom: '1.5rem', textAlign: 'center', border: '2px solid #00CCEE' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Sparkles size={48} style={{ color: '#00CCEE' }} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#F0F0F5' }}>Welcome to Headquarters</h2>
              <p style={{ margin: '0 0 1.5rem 0', color: '#8888A0', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                Your command center is ready! Start by defining your Founding Principles, setting Campaigns, and tracking Headwinds.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => handleModalOpen('founding')} style={{ padding: '0.75rem 1.5rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Define Founding Principles
                </button>
                <button onClick={() => handleModalOpen('campaigns')} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#00CCEE', border: '2px solid #00CCEE', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Create First Campaign
                </button>
              </div>
            </div>
          )}

          {/* Dashboard Cards - 2x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Today's Assembly */}
            <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', border: '2px solid #2A2A38' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} style={{ color: '#00CCEE' }} /> Today's Assembly
                </h3>
                {dashboardSummary?.nextMeeting && (
                  <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>@ {formatTime(dashboardSummary.nextMeeting.startTime)}</span>
                )}
              </div>
              <div style={{ background: '#09090F', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                {dashboardSummary?.nextMeeting ? (
                  <>
                    <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.5rem' }}>{dashboardSummary.nextMeeting.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8888A0', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> {formatDate(dashboardSummary.nextMeeting.startTime)}
                    </div>
                  </>
                ) : upcomingMeetings.length > 0 ? (
                  <>
                    <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.5rem' }}>{upcomingMeetings[0].title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8888A0', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> {formatDate(upcomingMeetings[0].startTime)}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#8888A0', fontSize: '0.85rem' }}>
                    No upcoming meetings scheduled
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                  <strong>Quick Stats:</strong>
                  <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>Active Headwinds: <span style={{ color: '#00CCEE', fontWeight: '600' }}>{dashboardSummary?.activeHeadwinds || headwinds.length}</span></div>
                    <div>Campaign Progress: <span style={{ color: '#00CCEE', fontWeight: '600' }}>{dashboardSummary?.campaignProgress || 0}%</span></div>
                    <div>Victories This Month: <span style={{ color: '#28A745', fontWeight: '600' }}>{dashboardSummary?.completedThisMonth || 0}</span></div>
                    <div>Next Milestone: <span style={{ color: '#F0B323', fontWeight: '600' }}>{dashboardSummary?.upcomingMilestoneYear || 'TBD'}</span></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => handleModalOpen('assembly')} style={{ flex: 1, padding: '0.75rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Generate Assembly</button>
                <button onClick={() => handleModalOpen('assembly')} style={{ flex: 1, padding: '0.75rem', background: '#1C1C26', color: '#F0F0F5', border: '2px solid #2A2A38', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>View Templates</button>
              </div>
            </div>

            {/* Active Headwinds */}
            <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', border: '2px solid #2A2A38' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wind size={18} style={{ color: '#00CCEE' }} /> Active Headwinds
                  <span style={{ background: '#00CCEE', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '700' }}>
                    {dashboardLoading ? '...' : dashboardSummary?.activeHeadwinds ?? headwinds.length}
                  </span>
                </h3>
                <button onClick={() => handleModalOpen('headwinds')} style={{ fontSize: '0.75rem', color: '#00CCEE', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {dashboardLoading ? (
                <LoadingSpinner text="Loading..." />
              ) : headwindsError ? (
                <ErrorMessage message={headwindsError} onRetry={fetchHeadwinds} />
              ) : headwinds.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#8888A0', fontSize: '0.9rem' }}>No active headwinds - great job!</div>
              ) : (
                headwinds.slice(0, 3).map((item) => {
                  const priorityStyle = getPriorityStyle(item.priority);
                  const daysOld = getDaysOld(item.createdAt);
                  return (
                    <div key={item.id} style={{ padding: '0.75rem', background: '#09090F', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid ' + priorityStyle.color }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.85rem', color: '#F0F0F5', flex: 1 }}>{item.title}</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', background: priorityStyle.bg, color: priorityStyle.color }}>{priorityStyle.label}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#8888A0', marginTop: '0.35rem' }}>{daysOld} days old</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* My Campaign Progress */}
            <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', border: '2px solid #2A2A38' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={18} style={{ color: '#00CCEE' }} /> My Campaign Progress
                  {dashboardSummary?.campaignProgress !== undefined && dashboardSummary.campaignProgress > 0 && (
                    <span style={{ background: dashboardSummary.campaignProgress >= 80 ? '#28A745' : dashboardSummary.campaignProgress >= 50 ? '#F0B323' : '#DC3545', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '700' }}>
                      {dashboardSummary.campaignProgress}%
                    </span>
                  )}
                </h3>
                <button onClick={() => handleModalOpen('campaigns')} style={{ fontSize: '0.75rem', color: '#00CCEE', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {dashboardLoading ? (
                <LoadingSpinner text="Loading..." />
              ) : goalsError ? (
                <ErrorMessage message={goalsError} onRetry={fetchGoals} />
              ) : personalGoals.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#8888A0', fontSize: '0.85rem' }}>
                  No personal goals yet. <button onClick={() => { setNewGoalScope('PERSONAL'); setShowGoalForm(true); }} style={{ background: 'none', border: 'none', color: '#00CCEE', cursor: 'pointer', fontWeight: '600' }}>Create one →</button>
                </div>
              ) : (
                personalGoals.slice(0, 3).map((item) => (
                  <div key={item.id} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#F0F0F5' }}>{item.title}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: item.progress === 100 ? '#28A745' : '#F0F0F5' }}>{item.progress}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#09090F', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: item.progress + '%', height: '100%', background: item.progress === 100 ? '#28A745' : '#00CCEE', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Victories */}
            <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', border: '2px solid #2A2A38' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={18} style={{ color: '#28A745' }} /> Recent Victories
                  {dashboardSummary?.totalVictories !== undefined && dashboardSummary.totalVictories > 0 && (
                    <span style={{ background: '#28A745', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '700' }}>
                      {dashboardSummary.totalVictories}
                    </span>
                  )}
                </h3>
                <button onClick={() => handleModalOpen('headwinds')} style={{ fontSize: '0.75rem', color: '#00CCEE', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {dashboardLoading ? (
                <LoadingSpinner text="Loading..." />
              ) : victoriesError ? (
                <ErrorMessage message={victoriesError} onRetry={fetchVictories} />
              ) : victories.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#8888A0', fontSize: '0.9rem' }}>
                  No victories yet - resolve headwinds to celebrate wins!
                </div>
              ) : (
                victories.slice(0, 3).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(40, 167, 69, 0.05)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid #28A745' }}>
                    <Check size={16} style={{ color: '#28A745' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', color: '#F0F0F5' }}>{item.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#8888A0', marginTop: '0.25rem' }}>{item.resolvedAt ? formatDate(item.resolvedAt) : formatDate(item.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Goal Creation Modal */}
        {showGoalForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }} onClick={() => setShowGoalForm(false)}>
            <div style={{
              background: '#1C1C26',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)',
                padding: '1.25rem 1.5rem',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={24} style={{ color: '#00CCEE' }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                    New {newGoalScope === 'PERSONAL' ? 'Personal Goal' : newGoalScope === 'QUARTERLY' ? 'Quarterly Campaign' : 'Annual Objective'}
                  </h3>
                </div>
                <button onClick={() => setShowGoalForm(false)} style={{ background: 'none', border: 'none', color: '#8888A0', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Goal title..."
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', marginBottom: '0.75rem', fontSize: '0.9rem' }}
                />
                <textarea
                  placeholder="Description (optional)..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', marginBottom: '0.75rem', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Target value"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                    style={{ flex: 1, padding: '0.5rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', fontSize: '0.9rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Current value"
                    value={newGoal.currentValue}
                    onChange={(e) => setNewGoal({ ...newGoal, currentValue: e.target.value })}
                    style={{ flex: 1, padding: '0.5rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as 'P1' | 'P2' | 'P3' })}
                    style={{ flex: 1, padding: '0.5rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5' }}
                  >
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - High</option>
                    <option value="P3">P3 - Normal</option>
                  </select>
                  <input
                    type="date"
                    placeholder="Due date"
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                    style={{ flex: 1, padding: '0.5rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5' }}
                  />
                </div>
                {newGoalScope !== 'PERSONAL' && (
                  <input
                    type="text"
                    placeholder="Owner name"
                    value={newGoal.ownerName}
                    onChange={(e) => setNewGoal({ ...newGoal, ownerName: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: '#09090F', border: '1px solid #2A2A38', borderRadius: '6px', color: '#F0F0F5', marginBottom: '0.75rem', fontSize: '0.9rem' }}
                  />
                )}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => setShowGoalForm(false)}
                    style={{ flex: 1, padding: '0.75rem', background: '#2A2A38', color: '#F0F0F5', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createGoal}
                    disabled={!newGoal.title.trim() || submitting}
                    style={{ flex: 1, padding: '0.75rem', background: newGoal.title.trim() ? '#00CCEE' : '#2A2A38', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: newGoal.title.trim() ? 'pointer' : 'not-allowed' }}
                  >
                    {submitting ? 'Creating...' : 'Create Goal'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Overlay */}
        {activeModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }} onClick={() => setActiveModal(null)}>
            <div style={{
              background: '#1C1C26',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '85vh',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)',
                padding: '1.5rem 2rem',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#00CCEE' }}>
                    {activeModal === 'assembly' && <Building2 size={32} />}
                    {activeModal === 'campaigns' && <Swords size={32} />}
                    {activeModal === 'headwinds' && <Wind size={32} />}
                    {activeModal === 'founding' && <FileText size={32} />}
                    {activeModal === 'legacy' && <Trophy size={32} />}
                    {activeModal === 'ledger' && <BookOpen size={32} />}
                  </span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                      {activeModal === 'assembly' && 'Assembly'}
                      {activeModal === 'campaigns' && 'Campaigns'}
                      {activeModal === 'headwinds' && 'Headwinds'}
                      {activeModal === 'founding' && 'Founding Principles'}
                      {activeModal === 'legacy' && 'The Legacy'}
                      {activeModal === 'ledger' && 'The Ledger'}
                    </h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                      {activeModal === 'assembly' && 'Meetings, agendas, and team alignment'}
                      {activeModal === 'campaigns' && 'Goals, priorities, and progress tracking'}
                      {activeModal === 'headwinds' && 'Challenges, issues, and victories'}
                      {activeModal === 'founding' && 'Vision, mission, and core values'}
                      {activeModal === 'legacy' && 'Your 3-5 year vision and goals'}
                      {activeModal === 'ledger' && 'Metrics, scores, and performance'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '2rem', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
                {activeModal === 'assembly' && renderAssemblyContent()}
                {activeModal === 'campaigns' && renderCampaignsContent()}
                {activeModal === 'headwinds' && renderHeadwindsContent()}
                {activeModal === 'founding' && renderFoundingContent()}
                {activeModal === 'legacy' && renderLegacyContent()}
                {activeModal === 'ledger' && renderLedgerContent()}
              </div>
            </div>
          </div>
        )}

        {/* Assembly Modal (AI-generated) */}
        <AssemblyModal
          isOpen={showAssemblyModal}
          onClose={() => setShowAssemblyModal(false)}
          authToken={authData.token || ''}
          tenantId={authData.tenantId || ''}
        />
      </div>
    </AuthGuard>
  );
}
