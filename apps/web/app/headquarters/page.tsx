'use client';

import { useState, useEffect, useCallback } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { AssemblyModal } from '../components/assembly';
import { logout, getStoredAuth } from '../utils/auth';
import { Briefcase, BarChart3, Settings, Palette, Users, Monitor, ClipboardList, Building2, Swords, Wind, FileText, Trophy, BookOpen, Calendar, Target, Rocket, Star, Map, Sparkles, Check, Scale, Loader2, AlertCircle, Plus, X } from 'lucide-react';

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

export default function HeadquartersPage() {
  const [activeModule, setActiveModule] = useState('cro');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showAssemblyModal, setShowAssemblyModal] = useState(false);
  const [authData, setAuthData] = useState<{ token: string | null; tenantId: string | null }>({ token: null, tenantId: null });

  // ============ API STATE ============

  // Headwinds state
  const [headwinds, setHeadwinds] = useState<Headwind[]>([]);
  const [headwindsLoading, setHeadwindsLoading] = useState(true);
  const [headwindsError, setHeadwindsError] = useState<string | null>(null);

  // Victories (resolved headwinds) state
  const [victories, setVictories] = useState<Headwind[]>([]);
  const [victoriesLoading, setVictoriesLoading] = useState(true);
  const [victoriesError, setVictoriesError] = useState<string | null>(null);

  // Horizon items state
  const [horizonItems, setHorizonItems] = useState<HorizonItem[]>([]);
  const [horizonLoading, setHorizonLoading] = useState(true);
  const [horizonError, setHorizonError] = useState<string | null>(null);

  // Calendar events state
  const [upcomingMeetings, setUpcomingMeetings] = useState<CalendarEvent[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);

  // Past meetings state
  const [pastMeetings, setPastMeetings] = useState<CalendarEvent[]>([]);
  const [pastMeetingsLoading, setPastMeetingsLoading] = useState(true);

  // Meeting templates state
  const [meetingTemplates, setMeetingTemplates] = useState<MeetingTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // Form states
  const [showHeadwindForm, setShowHeadwindForm] = useState(false);
  const [showHorizonForm, setShowHorizonForm] = useState(false);
  const [newHeadwind, setNewHeadwind] = useState<{ title: string; description: string; priority: 'P1' | 'P2' | 'P3'; category: 'BUG' | 'REBUILD' | 'NEW_BUILD' | 'ENHANCEMENT' | 'TASK' }>({ title: '', description: '', priority: 'P2', category: 'TASK' });
  const [newHorizonItem, setNewHorizonItem] = useState({ title: '', description: '', category: '' });
  const [submitting, setSubmitting] = useState(false);

  // Load auth data on mount
  useEffect(() => {
    const auth = getStoredAuth();
    setAuthData({ token: auth.token, tenantId: auth.tenantId });
  }, []);

  // ============ API FETCH FUNCTIONS ============

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

  // Fetch all data when auth is available
  useEffect(() => {
    if (authData.token) {
      fetchHeadwinds();
      fetchVictories();
      fetchHorizonItems();
      fetchUpcomingMeetings();
      fetchPastMeetings();
      fetchMeetingTemplates();
    }
  }, [authData.token, fetchHeadwinds, fetchVictories, fetchHorizonItems, fetchUpcomingMeetings, fetchPastMeetings, fetchMeetingTemplates]);

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

  const keystoneMetrics = [
    { id: 'cro', icon: 'briefcase', label: 'Pipeline Value', value: '$139,000', trend: 'up', trendValue: '12%', module: 'CRO', color: '#00CCEE' },
    { id: 'cfo', icon: 'barChart', label: 'Cash on Hand', value: '$47,500', trend: 'down', trendValue: '3%', module: 'CFO', color: '#2E7D32' },
    { id: 'coo', icon: 'settings', label: 'On-Time Delivery', value: '94%', trend: 'flat', trendValue: '', module: 'COO', color: '#5E35B1' },
    { id: 'cmo', icon: 'palette', label: 'Leads This Month', value: '12', trend: 'up', trendValue: '8%', module: 'CMO', color: '#F57C00' },
    { id: 'cpo', icon: 'users', label: 'Team Satisfaction', value: '4.2/5', trend: 'up', trendValue: '0.3', module: 'CPO', color: '#0288D1' },
    { id: 'cio', icon: 'monitor', label: 'System Uptime', value: '99.9%', trend: 'flat', trendValue: '', module: 'CIO', color: '#455A64' },
    { id: 'ea', icon: 'clipboard', label: 'Tasks Completed', value: '23/28', trend: 'up', trendValue: '82%', module: 'EA', color: '#C2185B' },
  ];

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

  const myCampaignItems = [
    { id: 1, title: 'Close 3 deals this quarter', progress: 66, target: '3 deals', current: '2 deals', dueDate: 'Dec 31' },
    { id: 2, title: 'Launch email automation sequence', progress: 80, target: 'Complete', current: '4/5 sequences', dueDate: 'Dec 20' },
    { id: 3, title: 'Complete team training on new CRM', progress: 100, target: '100%', current: 'Done', dueDate: 'Dec 15' },
  ];

  const quarterlyCampaigns = [
    { id: 1, title: 'Increase pipeline value by 25%', progress: 72, owner: 'Sales Team', status: 'on-track' },
    { id: 2, title: 'Reduce delivery time to under 4 weeks', progress: 85, owner: 'Operations', status: 'ahead' },
    { id: 3, title: 'Launch new website redesign', progress: 45, owner: 'Marketing', status: 'at-risk' },
    { id: 4, title: 'Hire and onboard 2 new team members', progress: 100, owner: 'HR', status: 'complete' },
  ];

  const annualCampaigns = [
    { id: 1, title: 'Reach $3M in annual revenue', progress: 78, target: '$3,000,000', current: '$2,340,000' },
    { id: 2, title: 'Expand team to 30 employees', progress: 80, target: '30', current: '24' },
    { id: 3, title: 'Achieve 95% customer satisfaction', progress: 88, target: '95%', current: '94%' },
    { id: 4, title: 'Launch Zander V1.0', progress: 65, target: 'April 1', current: 'In Development' },
  ];

  const foundingPrinciples = {
    vision: 'To empower every small business owner to reclaim their passion by providing AI-powered tools that handle the complexity of running a business.',
    mission: 'We build simple, robust software that gives small business owners the executive team they deserve - without the executive price tag.',
    values: [
      { id: 1, title: 'Simplicity Over Complexity', description: 'We choose the straightforward path. If it\'s complicated, we haven\'t found the right solution yet.' },
      { id: 2, title: 'Execution Beats Perfection', description: 'Done is better than perfect. We ship, learn, and iterate.' },
      { id: 3, title: 'Empowerment Through Ownership', description: 'Everyone owns their number. Clear accountability drives results.' },
      { id: 4, title: 'Relentless Resourcefulness', description: 'We find a way or make one. Obstacles are just problems waiting to be solved.' },
    ],
    story: 'In 1772, a devastating hurricane struck St. Croix at 64° West longitude. A young Alexander Hamilton wrote about the destruction with such clarity that his community funded his passage to the American colonies. That moment of crisis became the catalyst for a legacy that shaped a nation. At 64 West, we believe every business owner has their own hurricane moment - that overwhelming complexity that threatens to destroy their passion. We\'re here to help them not just survive, but transform that chaos into clarity.'
  };

  const legacyMilestones = [
    { id: 1, year: '2025', title: 'Foundation', goals: ['Launch Zander CRO Module', 'Reach 100 customers', 'Build core team to 10'], progress: 45 },
    { id: 2, year: '2026', title: 'Growth', goals: ['Launch all 7 AI Executives', 'Reach 500 customers', 'Expand to 25 employees'], progress: 0 },
    { id: 3, year: '2027', title: 'Scale', goals: ['Reach 2,000 customers', '$5M ARR', 'National recognition'], progress: 0 },
    { id: 4, year: '2028', title: 'Market Leader', goals: ['10,000+ customers', 'Industry standard for SMB AI', 'IPO readiness'], progress: 0 },
  ];

  const legacyVision = 'By 2028, Zander will be the default operating system for small businesses across America. Every entrepreneur will have access to the same strategic capabilities as Fortune 500 companies - AI-powered executives that work 24/7 to help them succeed. We\'re not just building software; we\'re democratizing business excellence.';

  const ledgerMetrics = {
    company: [
      { id: 1, name: 'Revenue (YTD)', value: '$2,340,000', target: '$3,000,000', progress: 78, trend: 'up' },
      { id: 2, name: 'Gross Margin', value: '42%', target: '45%', progress: 93, trend: 'flat' },
      { id: 3, name: 'Customer Count', value: '127', target: '150', progress: 85, trend: 'up' },
      { id: 4, name: 'Employee Count', value: '24', target: '30', progress: 80, trend: 'up' },
      { id: 5, name: 'NPS Score', value: '72', target: '75', progress: 96, trend: 'up' },
    ],
    team: [
      { id: 1, name: 'Sales', keystone: 'Pipeline Value', value: '$139,000', owner: 'Jonathan W.', status: 'green' },
      { id: 2, name: 'Finance', keystone: 'Cash on Hand', value: '$47,500', owner: 'CFO', status: 'yellow' },
      { id: 3, name: 'Operations', keystone: 'On-Time Delivery', value: '94%', owner: 'Operations Mgr', status: 'green' },
      { id: 4, name: 'Marketing', keystone: 'Leads/Month', value: '12', owner: 'Marketing Lead', status: 'green' },
      { id: 5, name: 'HR', keystone: 'Team Satisfaction', value: '4.2/5', owner: 'HR Lead', status: 'green' },
    ]
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
            <button style={{ padding: '0.5rem 1rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Add Priority</button>
          </div>
          {myCampaignItems.map((item) => (
            <div key={item.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem', borderLeft: `4px solid ${item.progress === 100 ? '#28A745' : '#00CCEE'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>Target: {item.target} • Current: {item.current} • Due: {item.dueDate}</div>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: item.progress === 100 ? '#28A745' : '#13131A' }}>{item.progress}%</span>
              </div>
              <div style={{ height: '10px', background: '#1C1C26', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: item.progress + '%', height: '100%', background: item.progress === 100 ? '#28A745' : '#00CCEE', borderRadius: '5px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quarterly Campaigns */}
      {activeTab === 'quarterly' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#F0F0F5' }}>Q4 2024 Campaigns</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#8888A0' }}>Team-wide quarterly priorities</p>
            </div>
          </div>
          {quarterlyCampaigns.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <div key={item.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>Owner: {item.owner}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '12px', background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, height: '10px', background: '#1C1C26', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: item.progress + '%', height: '100%', background: item.status === 'complete' || item.status === 'ahead' ? '#28A745' : item.status === 'at-risk' ? '#DC3545' : '#13131A', borderRadius: '5px' }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F0F0F5', minWidth: '45px' }}>{item.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Annual Campaigns */}
      {activeTab === 'annual' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#F0F0F5' }}>2024 Annual Campaign</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#8888A0' }}>Company-wide annual objectives</p>
            </div>
          </div>
          {annualCampaigns.map((item) => (
            <div key={item.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>Target: {item.target} • Current: {item.current}</div>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F0F0F5' }}>{item.progress}%</span>
              </div>
              <div style={{ height: '10px', background: '#1C1C26', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: item.progress + '%', height: '100%', background: item.progress >= 75 ? '#28A745' : item.progress >= 50 ? '#F0B323' : '#DC3545', borderRadius: '5px' }} />
              </div>
            </div>
          ))}
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

  const renderFoundingContent = () => (
    <div>
      {/* Vision */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ color: '#00CCEE' }}><Target size={28} /></span>
          <h3 style={{ margin: 0, color: '#F0F0F5' }}>Vision</h3>
        </div>
        <div style={{ padding: '1.5rem', background: '#1C1C26', borderRadius: '10px', borderLeft: '4px solid #00CCEE' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', color: '#F0F0F5', lineHeight: '1.6', fontStyle: 'italic' }}>"{foundingPrinciples.vision}"</p>
        </div>
      </div>

      {/* Mission */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ color: '#00CCEE' }}><Rocket size={28} /></span>
          <h3 style={{ margin: 0, color: '#F0F0F5' }}>Mission</h3>
        </div>
        <div style={{ padding: '1.5rem', background: '#1C1C26', borderRadius: '10px', borderLeft: '4px solid #00CCEE' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', color: '#F0F0F5', lineHeight: '1.6', fontStyle: 'italic' }}>"{foundingPrinciples.mission}"</p>
        </div>
      </div>

      {/* Core Values */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ color: '#00CCEE' }}><Scale size={28} /></span>
          <h3 style={{ margin: 0, color: '#F0F0F5' }}>Core Values</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {foundingPrinciples.values.map((value) => (
            <div key={value.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', borderTop: '3px solid #00CCEE' }}>
              <div style={{ fontWeight: '700', color: '#F0F0F5', marginBottom: '0.5rem', fontSize: '1rem' }}>{value.title}</div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#8888A0', lineHeight: '1.5' }}>{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ color: '#00CCEE' }}><BookOpen size={28} /></span>
          <h3 style={{ margin: 0, color: '#F0F0F5' }}>Our Story</h3>
        </div>
        <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)', borderRadius: '10px', color: 'white' }}>
          <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.8' }}>{foundingPrinciples.story}</p>
        </div>
      </div>
    </div>
  );

  const renderLegacyContent = () => (
    <div>
      {/* Legacy Vision */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ color: '#00CCEE' }}><Star size={28} /></span>
          <h3 style={{ margin: 0, color: '#F0F0F5' }}>The Legacy We're Building</h3>
        </div>
        <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)', borderRadius: '10px', color: 'white' }}>
          <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.7' }}>{legacyVision}</p>
        </div>
      </div>

      {/* 3-5 Year Roadmap */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ color: '#00CCEE' }}><Map size={28} /></span>
          <h3 style={{ margin: 0, color: '#F0F0F5' }}>3-5 Year Roadmap</h3>
        </div>
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: '24px', top: '40px', bottom: '40px', width: '2px', background: 'var(--zander-border-gray)' }} />

          {legacyMilestones.map((milestone, index) => (
            <div key={milestone.id} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
              {/* Year circle */}
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: milestone.progress > 0 ? '#00CCEE' : 'var(--zander-border-gray)',
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
              <div style={{ flex: 1, padding: '1rem 1.25rem', background: '#09090F', borderRadius: '10px', borderLeft: `4px solid ${milestone.progress > 0 ? '#00CCEE' : 'var(--zander-border-gray)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: '700', color: '#F0F0F5', fontSize: '1.1rem' }}>{milestone.title}</div>
                  {milestone.progress > 0 && (
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#00CCEE' }}>{milestone.progress}% Complete</span>
                  )}
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {milestone.goals.map((goal, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: '#8888A0', marginBottom: '0.25rem' }}>{goal}</li>
                  ))}
                </ul>
                {milestone.progress > 0 && (
                  <div style={{ marginTop: '0.75rem', height: '6px', background: '#1C1C26', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: milestone.progress + '%', height: '100%', background: '#00CCEE', borderRadius: '3px' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLedgerContent = () => (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #2A2A38', paddingBottom: '1rem' }}>
        {[
          { id: 'company', label: 'Company Ledger' },
          { id: 'team', label: 'Team Ledger' },
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

      {/* Company Ledger */}
      {activeTab === 'company' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#F0F0F5' }}>Company Performance</h3>
          {ledgerMetrics.company.map((metric) => (
            <div key={metric.id} style={{ padding: '1.25rem', background: '#09090F', borderRadius: '10px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{metric.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>Target: {metric.target}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5' }}>{metric.value}</div>
                  <div style={{ fontSize: '0.8rem', color: getTrendColor(metric.trend), fontWeight: '600' }}>
                    {getTrendIcon(metric.trend)} {metric.progress}% of goal
                  </div>
                </div>
              </div>
              <div style={{ height: '8px', background: '#1C1C26', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: Math.min(metric.progress, 100) + '%', height: '100%', background: metric.progress >= 90 ? '#28A745' : metric.progress >= 70 ? '#F0B323' : '#DC3545', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Ledger */}
      {activeTab === 'team' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#F0F0F5' }}>Team Keystones</h3>
          <div style={{ background: '#09090F', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', padding: '0.75rem 1rem', background: '#13131A', color: 'white', fontWeight: '600', fontSize: '0.8rem' }}>
              <div>Team</div>
              <div>Keystone</div>
              <div>Current</div>
              <div>Owner</div>
              <div style={{ textAlign: 'center' }}>Status</div>
            </div>
            {ledgerMetrics.team.map((team) => (
              <div key={team.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', padding: '1rem', borderBottom: '1px solid #2A2A38', alignItems: 'center' }}>
                <div style={{ fontWeight: '600', color: '#F0F0F5' }}>{team.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#8888A0' }}>{team.keystone}</div>
                <div style={{ fontWeight: '700', color: '#F0F0F5' }}>{team.value}</div>
                <div style={{ fontSize: '0.9rem', color: '#8888A0' }}>{team.owner}</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getStatusDot(team.status)
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
    else if (modalId === 'ledger') setActiveTab('company');
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
              {keystoneMetrics.map((metric) => (
                <a key={metric.id} href={metric.module === 'CRO' ? '/' : '/' + metric.module.toLowerCase()} style={{ background: '#09090F', borderRadius: '10px', padding: '1rem', textDecoration: 'none', borderLeft: '4px solid ' + metric.color, transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: metric.color }}>{getIcon(metric.icon, 18)}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: metric.color }}>{metric.module}</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.15rem' }}>{metric.value}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.65rem', color: '#8888A0' }}>{metric.label}</span>
                    {metric.trendValue && <span style={{ fontSize: '0.7rem', color: getTrendColor(metric.trend), fontWeight: '600' }}>{getTrendIcon(metric.trend)} {metric.trendValue}</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>

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

          {/* Dashboard Cards - 2x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Today's Assembly */}
            <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', border: '2px solid #2A2A38' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} style={{ color: '#00CCEE' }} /> Today's Assembly
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>@ {todayAssembly.time}</span>
              </div>
              <div style={{ background: '#09090F', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.5rem' }}>{todayAssembly.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#8888A0', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={14} /> {todayAssembly.attendees} attendees</div>
                <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                  <strong>Agenda:</strong>
                  <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                    {todayAssembly.agenda.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ flex: 1, padding: '0.75rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Join Meeting</button>
                <button onClick={() => handleModalOpen('assembly')} style={{ flex: 1, padding: '0.75rem', background: '#1C1C26', color: '#F0F0F5', border: '2px solid #2A2A38', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>View Agenda</button>
              </div>
            </div>

            {/* Active Headwinds */}
            <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', border: '2px solid #2A2A38' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wind size={18} style={{ color: '#00CCEE' }} /> Active Headwinds
                  <span style={{ background: '#00CCEE', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '700' }}>
                    {headwindsLoading ? '...' : headwinds.length}
                  </span>
                </h3>
                <button onClick={() => handleModalOpen('headwinds')} style={{ fontSize: '0.75rem', color: '#00CCEE', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {headwindsLoading ? (
                <LoadingSpinner text="Loading..." />
              ) : headwindsError ? (
                <ErrorMessage message={headwindsError} onRetry={fetchHeadwinds} />
              ) : headwinds.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#8888A0', fontSize: '0.9rem' }}>No active headwinds</div>
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
                </h3>
                <button onClick={() => handleModalOpen('campaigns')} style={{ fontSize: '0.75rem', color: '#00CCEE', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {myCampaignItems.map((item) => (
                <div key={item.id} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#F0F0F5' }}>{item.title}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: item.progress === 100 ? '#28A745' : '#13131A' }}>{item.progress}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#09090F', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: item.progress + '%', height: '100%', background: item.progress === 100 ? '#28A745' : '#00CCEE', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Victories */}
            <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '1.5rem', border: '2px solid #2A2A38' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={18} style={{ color: '#00CCEE' }} /> Recent Victories
                </h3>
                <button onClick={() => handleModalOpen('headwinds')} style={{ fontSize: '0.75rem', color: '#00CCEE', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {victoriesLoading ? (
                <LoadingSpinner text="Loading..." />
              ) : victoriesError ? (
                <ErrorMessage message={victoriesError} onRetry={fetchVictories} />
              ) : victories.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#8888A0', fontSize: '0.9rem' }}>No victories yet</div>
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
