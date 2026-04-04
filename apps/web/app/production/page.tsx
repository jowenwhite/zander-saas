'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import { logout } from '../utils/auth';
import Sidebar from '../components/Sidebar';
import { DollarSign, BarChart3, ClipboardList, Target, Settings, Phone, Mail, Calendar, RefreshCw, FileEdit, CheckSquare, TrendingUp, Gem, Sprout, FileText, TrendingDown, Handshake, Clock } from 'lucide-react';
import OnboardingWizard from '../components/OnboardingWizard';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
}

interface Deal {
  id: string;
  dealName: string;
  dealValue: number;
  stage: string;
  status?: 'open' | 'won' | 'lost';
  probability: number;
  expectedCloseDate?: string;
  contact: Contact | null;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change';
  title: string;
  description: string;
  date: string;
  dealId?: string;
}


interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
}

// Helper to format stage names for display
const formatStage = (stage: string) => {
  const stageLabels: Record<string, string> = {
    'PROSPECT': 'Prospect',
    'QUALIFIED': 'Qualified',
    'PROPOSAL': 'Proposal',
    'NEGOTIATION': 'Negotiation',
    'CLOSED_WON': 'Closed Won',
    'CLOSED_LOST': 'Closed Lost',
    'LEAD': 'Lead'
  };
  return stageLabels[stage] || stage;
};

export default function ProductionPage() {
  // Debug: This log confirms the deployed code version
  console.log('[Zander v2.1] ProductionPage loaded - greeting should be dynamic');

  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [upcomingAssemblies, setUpcomingAssemblies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('cro');
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Widget configuration - which KPIs to show in each slot
  const [widgetConfig, setWidgetConfig] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zander_widget_config');
      return saved ? JSON.parse(saved) : ['won_revenue', 'pipeline_value', 'closing_soon', 'win_rate'];
    }
    return ['won_revenue', 'pipeline_value', 'closing_soon', 'win_rate'];
  });
  
  // KPI icon helper
  const getKpiIcon = (iconKey: string, size: number = 24) => {
    const icons: Record<string, React.ReactNode> = {
      dollar: <DollarSign size={size} />,
      chart: <BarChart3 size={size} />,
      handshake: <Handshake size={size} />,
      trending: <TrendingUp size={size} />,
      gem: <Gem size={size} />,
      clipboard: <ClipboardList size={size} />,
      target: <Target size={size} />,
      sprout: <Sprout size={size} />,
      file: <FileText size={size} />,
      trendingDown: <TrendingDown size={size} />,
    };
    return icons[iconKey] || <BarChart3 size={size} />;
  };

  // KPI Library - all available metrics
  const kpiLibrary = [
    { id: 'won_revenue', name: 'Won This Month', icon: 'dollar', color: '#E74C3C', gradient: 'linear-gradient(135deg, #E74C3C 0%, #d93426 100%)' },
    { id: 'pipeline_value', name: 'Pipeline Value', icon: 'chart', color: '#27AE60', gradient: 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)' },
    { id: 'closing_soon', name: 'Closing This Week', icon: 'handshake', color: '#3498DB', gradient: 'linear-gradient(135deg, #3498DB 0%, #2471a3 100%)' },
    { id: 'win_rate', name: 'Win Rate', icon: 'trending', color: '#9B59B6', gradient: 'linear-gradient(135deg, #9B59B6 0%, #7d3c98 100%)' },
    { id: 'avg_deal_size', name: 'Avg Deal Size', icon: 'gem', color: '#F39C12', gradient: 'linear-gradient(135deg, #F39C12 0%, #d68910 100%)' },
    { id: 'total_deals', name: 'Total Deals', icon: 'clipboard', color: '#1ABC9C', gradient: 'linear-gradient(135deg, #1ABC9C 0%, #16a085 100%)' },
    { id: 'weighted_pipeline', name: 'Weighted Pipeline', icon: 'target', color: '#E67E22', gradient: 'linear-gradient(135deg, #E67E22 0%, #d35400 100%)' },
    { id: 'leads_count', name: 'New Leads', icon: 'sprout', color: '#2ECC71', gradient: 'linear-gradient(135deg, #2ECC71 0%, #27ae60 100%)' },
    { id: 'proposals_out', name: 'Proposals Out', icon: 'file', color: '#9B59B6', gradient: 'linear-gradient(135deg, #9B59B6 0%, #8e44ad 100%)' },
    { id: 'lost_deals', name: 'Lost This Month', icon: 'trendingDown', color: '#95A5A6', gradient: 'linear-gradient(135deg, #95A5A6 0%, #7f8c8d 100%)' },
  ];
  
  // Calculate KPI values - uses dynamic stage detection from stages array
  const getKpiValue = (kpiId: string) => {
    // Get early-stage names (first few stages by order)
    const earlyStages = stages.slice(0, Math.min(2, stages.length)).map(s => s.name);
    // Get mid-to-late stage names (for "closing soon" - stages with high probability but not won)
    const closingStages = stages.filter(s => s.probability >= 50 && s.probability < 100).map(s => s.name);

    switch (kpiId) {
      case 'won_revenue':
        return { value: formatCurrency(wonValue), detail: `${wonDeals.length} deals closed`, trend: '+12%', trendUp: true };
      case 'pipeline_value':
        return { value: formatCurrency(pipelineValue), detail: `${activeDeals.length} active deals`, trend: '+8%', trendUp: true };
      case 'closing_soon':
        const closingDeals = deals.filter(d => closingStages.includes(d.stage));
        return { value: String(closingDeals.length), detail: `Expected: ${formatCurrency(closingDeals.reduce((sum, d) => sum + d.dealValue, 0))}`, trend: '+5', trendUp: true };
      case 'win_rate':
        return { value: `${winRate}%`, detail: 'Last 30 days', trend: '+3%', trendUp: true };
      case 'avg_deal_size':
        const avgSize = wonDeals.length > 0 ? wonValue / wonDeals.length : (activeDeals.length > 0 ? pipelineValue / activeDeals.length : 0);
        return { value: formatCurrency(avgSize), detail: `From ${wonDeals.length > 0 ? wonDeals.length : activeDeals.length} deals`, trend: '+5%', trendUp: true };
      case 'total_deals':
        return { value: String(deals.length), detail: 'All time', trend: '+' + activeDeals.length, trendUp: true };
      case 'weighted_pipeline':
        const weighted = activeDeals.reduce((sum, d) => sum + (d.dealValue * d.probability / 100), 0);
        return { value: formatCurrency(weighted), detail: 'Risk-adjusted', trend: '+6%', trendUp: true };
      case 'leads_count':
        const leads = deals.filter(d => earlyStages.includes(d.stage));
        return { value: String(leads.length), detail: 'In early stages', trend: '+3', trendUp: true };
      case 'proposals_out':
        // Mid-stages (not early, not closing, not won/lost)
        const midStages = stages.filter(s => s.probability >= 25 && s.probability < 50).map(s => s.name);
        const proposalDeals = deals.filter(d => midStages.includes(d.stage));
        return { value: String(proposalDeals.length), detail: formatCurrency(proposalDeals.reduce((sum, d) => sum + d.dealValue, 0)), trend: '+2', trendUp: true };
      case 'lost_deals':
        return { value: String(lostDeals.length), detail: formatCurrency(lostDeals.reduce((sum, d) => sum + d.dealValue, 0)), trend: '-2', trendUp: false };
      default:
        return { value: '0', detail: '', trend: '', trendUp: true };
    }
  };
  
  // Save widget config to localStorage
  const saveWidgetConfig = (newConfig: string[]) => {
    setWidgetConfig(newConfig);
    localStorage.setItem('zander_widget_config', JSON.stringify(newConfig));
  };

  // Form states
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: ''
  });

  const [dealForm, setDealForm] = useState({
    dealName: '',
    dealValue: '',
    stage: 'PROSPECT',
    probability: '25',
    contactId: ''
  });

  useEffect(() => {
    fetchData();
    checkOnboardingStatus();
  }, []);
  
  // Helper to extract first name with proper fallback chain
  const extractFirstName = (user: any): string => {
    if (!user) return 'there';
    // 1. Direct firstName field
    if (user.firstName && typeof user.firstName === 'string' && user.firstName.trim()) {
      return user.firstName.trim();
    }
    // 2. Full name field - split and take first part
    if (user.name && typeof user.name === 'string' && user.name.trim()) {
      return user.name.trim().split(' ')[0];
    }
    // 3. Email - take part before @
    if (user.email && typeof user.email === 'string') {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'there';
  };

  async function checkOnboardingStatus() {
    // First, set userName from localStorage as immediate fallback
    const storedUser = localStorage.getItem('zander_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(extractFirstName(user));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }

    try {
      const token = localStorage.getItem('zander_token');
      if (!token) return;

      const res = await fetch('https://api.zanderos.com/users/onboarding/status', {
        headers: { Authorization: 'Bearer ' + token },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[Zander v2.1] Onboarding status response:', { firstName: data.firstName, companyName: data.tenant?.companyName });
        // Use API firstName if available, otherwise keep the localStorage-derived name
        if (data.firstName) {
          setUserName(data.firstName);
        }
        setCompanyName(data.tenant?.companyName || 'your company');

        // Show wizard if onboarding not completed
        if (!data.onboardingCompleted) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Failed to check onboarding:', error);
      // userName already set from localStorage, no additional action needed
    }
  }
  
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh the sidebar to show checklist
    window.location.reload();
  };

  async function fetchData() {
    try {
      const token = localStorage.getItem('zander_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [contactsRes, dealsRes, stagesRes, activitiesRes, assembliesRes] = await Promise.all([
        fetch('https://api.zanderos.com/contacts', { headers }),
        fetch('https://api.zanderos.com/deals/pipeline', { headers }),
        fetch('https://api.zanderos.com/pipeline-stages', { headers }),
        fetch('https://api.zanderos.com/activities/timeline?limit=5', { headers }),
        fetch('https://api.zanderos.com/calendar-events/upcoming?limit=5', { headers }),
      ]);
      
      if (contactsRes.ok && dealsRes.ok && stagesRes.ok) {
        const contactsData = await contactsRes.json();
        const dealsData = await dealsRes.json();
        const stagesData = await stagesRes.json();
        const sortedStages = (stagesData || []).sort((a: PipelineStage, b: PipelineStage) => a.order - b.order);
        setStages(sortedStages);
        setContacts(contactsData.data || []);
        const allDeals = Object.values(dealsData.pipeline || {}).flat() as Deal[];
        setDeals(allDeals);
      }
      
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.data || activitiesData || []);
      }
      
      if (assembliesRes.ok) {
        const assembliesData = await assembliesRes.json();
        setUpcomingAssemblies(assembliesData.data || assembliesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateContact(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('https://api.zanderos.com/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` },
        body: JSON.stringify(contactForm),
      });
      if (response.ok) {
        setContactForm({ firstName: '', lastName: '', email: '', phone: '', company: '' });
        setShowNewContactModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  }

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('https://api.zanderos.com/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` },
        body: JSON.stringify({
          dealName: dealForm.dealName,
          dealValue: parseFloat(dealForm.dealValue),
          stage: dealForm.stage,
          probability: parseInt(dealForm.probability),
          contactId: dealForm.contactId || null
        }),
      });
      if (response.ok) {
        setDealForm({ dealName: '', dealValue: '', stage: 'PROSPECT', probability: '25', contactId: '' });
        setShowNewDealModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  }

  // Calculate metrics using deal status field (open/won/lost)
  // The status field is the source of truth for deal outcomes
  const activeDeals = deals.filter(d => d.status === 'open' || !d.status);
  const wonDeals = deals.filter(d => d.status === 'won');
  const lostDeals = deals.filter(d => d.status === 'lost');
  const pipelineValue = activeDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
  const winRate = (wonDeals.length + lostDeals.length) > 0 ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) : 0;

  // Get deals by stage for pipeline
  const getDealsByStage = (stageName: string) => {
    return deals.filter(d => d.stage === stageName);
  };

  // Get greeting based on time of day - uses logged-in user's firstName
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Format activities from API
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const recentActivities: Activity[] = activities.slice(0, 5).map(a => ({
    id: a.id,
    type: a.type || 'note',
    title: a.subject || a.title || 'Activity',
    description: a.description || a.notes || '',
    date: formatTimeAgo(a.createdAt)
  }));

  // Compute tasks from deals in PROPOSAL/NEGOTIATION stages
  // Action Required: Deals needing attention (stage-agnostic)
  const actionRequired = (() => {
    if (stages.length === 0 || deals.length === 0) return [];
    
    const firstStageName = stages[0]?.name;
    const lastStageName = stages[stages.length - 1]?.name;
    
    // Get deals that need attention: active deals (not new leads, not completed)
    const activeDeals = deals.filter(d => 
      d.stage !== firstStageName && 
      d.stage !== lastStageName &&
      d.stage?.toLowerCase() !== 'complete' &&
      d.stage?.toLowerCase() !== 'closed won' &&
      d.stage?.toLowerCase() !== 'closed lost'
    );
    
    // Score each deal by urgency
    const scoredDeals = activeDeals.map(d => {
      const lastUpdate = new Date(d.updatedAt);
      const daysSince = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      const isStale = daysSince >= 3;
      const isHighValue = d.dealValue > 10000;
      const urgencyScore = (isStale ? 2 : 0) + (isHighValue ? 1 : 0) + (daysSince >= 7 ? 2 : 0);
      
      return {
        ...d,
        daysSince,
        isStale,
        isHighValue,
        urgencyScore
      };
    });
    
    // Sort by urgency and take top 5
    return scoredDeals
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 5)
      .map(d => ({
        title: d.dealName,
        detail: d.isStale ? `No activity in ${d.daysSince} days` : `${d.stage} - $${d.dealValue.toLocaleString()}`,
        priority: d.urgencyScore >= 3 ? 'high' : d.urgencyScore >= 1 ? 'medium' : 'low',
        dealId: d.id,
        stage: d.stage
      }));
  })();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  if (loading) {
    return (

      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#09090F'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Image
              src="/images/zander-icon.svg"
              alt="Zander"
              width={48}
              height={48}
              priority
            />
          </div>
          <div style={{ color: '#8888A0' }}>Loading Zander...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        userName={userName}
        companyName={companyName}
      />

    <div style={{ minHeight: '100vh', background: '#09090F' }}>
      <NavBar activeModule={activeModule} />

      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main style={{ 
        marginLeft: sidebarCollapsed ? '64px' : '240px', 
        marginTop: '64px',
        padding: '2rem',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Dashboard Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00CCEE 0%, #0099BB 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.5rem'
            }}>{userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
            <div>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: '#F0F0F5', 
                margin: 0,
                marginBottom: '0.25rem'
              }}>
                {getGreeting()}, {userName || 'there'}
              </h1>
              <p style={{ color: '#8888A0', margin: 0 }}>
                Here's what's happening with your sales today
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowNewDealModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '2px solid #2A2A38',
                background: '#1C1C26',
                color: '#F0F0F5',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              + New Project
            </button>
            <button
              onClick={() => setShowNewContactModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: '#00CCEE',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              + New Person
            </button>
            <button
              onClick={() => setShowWidgetSettings(true)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '2px solid #2A2A38',
                background: '#1C1C26',
                color: '#8888A0',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Settings size={14} /> Customize
            </button>
          </div>
        </div>

        {/* Metrics Grid - Dynamic Widgets */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {widgetConfig.map((kpiId, index) => {
            const kpi = kpiLibrary.find(k => k.id === kpiId);
            if (!kpi) return null;
            const kpiData = getKpiValue(kpiId);
            return (
              <div key={kpiId} style={{
                background: '#1C1C26',
                border: '2px solid #2A2A38',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = kpi.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A38';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: kpi.gradient,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>{getKpiIcon(kpi.icon)}</div>
                  {kpiData.trend && (
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: kpiData.trendUp ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                      color: kpiData.trendUp ? '#28a745' : '#dc3545'
                    }}>{kpiData.trendUp ? '↑' : '↓'} {kpiData.trend.replace(/[+-]/g, '')}</span>
                  )}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.25rem' }}>
                  {kpiData.value}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.5rem' }}>
                  {kpi.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                  {kpiData.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Projects Overview - Full Width */}
        <div style={{
          marginBottom: '2rem'
        }}>
          {/* Pipeline Preview */}
          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                color: '#F0F0F5', 
                margin: 0 
              }}>Projects Overview</h3>
              <button style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#8888A0',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                View All →
              </button>
            </div>

            {/* Stage Columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${stages.length || 6}, minmax(180px, 1fr))`,
              overflowX: 'auto',
              gap: '1rem'
            }}>
              {stages.map((stageObj) => {
                const stageDeals = getDealsByStage(stageObj.name);
                return (

                  <div key={stageObj.id} style={{
                    background: '#09090F',
                    borderRadius: '8px',
                    padding: '1rem',
                    minHeight: '200px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '2px solid #2A2A38'
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#F0F0F5', 
                        fontSize: '0.875rem' 
                      }}>{stageObj.name}</span>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: '#00CCEE',
                        color: 'white',
                        borderRadius: '50%',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        minWidth: '24px',
                        textAlign: 'center'
                      }}>{stageDeals.length}</span>
                    </div>

                    {stageDeals.slice(0, 3).map((deal) => (
                      <div key={deal.id} onClick={() => router.push('/deals/' + deal.id)} style={{
                        background: '#1C1C26',
                        border: '1px solid #2A2A38',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          color: '#F0F0F5',
                          marginBottom: '0.25rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{deal.dealName}</div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#00CCEE',
                          fontWeight: '600'
                        }}>{formatCurrency(deal.dealValue)}</div>
                      </div>
                    ))}

                    {stageDeals.length > 3 && (
                      <div style={{ 
                        textAlign: 'center', 
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#8888A0'
                      }}>
                        +{stageDeals.length - 3} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity, Tasks & Follow-ups - 3 Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Activity Feed */}
          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                color: '#F0F0F5', 
                margin: 0 
              }}>Recent Activity</h3>
            </div>

            {recentActivities.length > 0 ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {recentActivities.map((activity) => (
                <li key={activity.id} onClick={() => router.push('/projects')} style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  transition: 'background 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(191, 10, 48, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '1rem',
                    background: activity.type === 'call' ? 'rgba(231, 76, 60, 0.1)' :
                              activity.type === 'email' ? 'rgba(52, 152, 219, 0.1)' :
                              activity.type === 'meeting' ? 'rgba(155, 89, 182, 0.1)' : activity.type === 'stage_change' ? 'rgba(39, 174, 96, 0.1)' :
                              'rgba(39, 174, 96, 0.1)'
                  }}>
                    {activity.type === 'call' ? <Phone size={18} /> :
                     activity.type === 'email' ? <Mail size={18} /> :
                     activity.type === 'meeting' ? <Calendar size={18} /> : activity.type === 'stage_change' ? <RefreshCw size={18} /> : <FileEdit size={18} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#F0F0F5', 
                      marginBottom: '0.25rem',
                      fontSize: '0.875rem'
                    }}>{activity.title}</div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#8888A0',
                      marginBottom: '0.25rem'
                    }}>{activity.description}</div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#8888A0' 
                    }}>{activity.date}</div>
                  </div>
                </li>
              ))}
            </ul>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#8888A0' }}>
                <div style={{ marginBottom: '0.5rem', color: '#00CCEE' }}><ClipboardList size={32} /></div>
                <div>No recent activity</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Activities will appear here as you work on deals</div>
              </div>
            )}
          </div>
          {/* Action Required */}
          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#F0F0F5', 
              margin: 0,
              marginBottom: '1.5rem'
            }}>Action Required</h3>

            {actionRequired.length > 0 ? actionRequired.map((task, i) => (
              <div key={i} onClick={() => (task as any).dealId && router.push("/projects")} style={{
                display: 'flex',
                alignItems: 'start',
                gap: '0.75rem',
                padding: '1rem',
                background: '#09090F',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #2A2A38',
                  borderRadius: '4px',
                  flexShrink: 0,
                  marginTop: '0.25rem'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#F0F0F5',
                    marginBottom: '0.25rem'
                  }}>{task.title}</div>
                  <div style={{ 
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: '#8888A0'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ClipboardList size={12} /> {task.detail}</span>
                    {task.priority === 'high' && (
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        background: 'rgba(220, 53, 69, 0.1)',
                        color: '#dc3545',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>High Priority</span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#8888A0' }}>
                <div style={{ marginBottom: '0.5rem', color: '#00CCEE' }}><CheckSquare size={32} /></div>
                <div>No action required</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>All deals are progressing smoothly</div>
              </div>
            )}
          </div>

          {/* Upcoming Assemblies */}
          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#F0F0F5',
                margin: 0
              }}>Upcoming Assemblies</h3>
              <span style={{
                padding: '0.25rem 0.75rem',
                background: 'rgba(155, 89, 182, 0.1)',
                color: '#9b59b6',
                borderRadius: '50%',
                fontWeight: '700',
                fontSize: '0.875rem'
              }}>{upcomingAssemblies.length}</span>
            </div>
            {upcomingAssemblies.length > 0 ? upcomingAssemblies.map((assembly: any, i: number) => (
              <div key={assembly.id || i} onClick={() => router.push('/schedule')} style={{
                display: 'flex',
                alignItems: 'start',
                gap: '0.75rem',
                padding: '1rem',
                background: '#09090F',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(155, 89, 182, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#9b59b6'
                }}><Calendar size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#F0F0F5',
                    marginBottom: '0.25rem'
                  }}>{assembly.title}</div>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: '#8888A0'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {new Date(assembly.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(assembly.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    {assembly.eventType && (
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        background: 'rgba(155, 89, 182, 0.1)',
                        color: '#9b59b6',
                        borderRadius: '4px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>{assembly.eventType}</span>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#8888A0' }}>
                <div style={{ marginBottom: '0.5rem', color: '#9b59b6' }}><Calendar size={32} /></div>
                <div>No upcoming assemblies scheduled</div>
              </div>
            )}
          </div>
        </div>
        {/* Analytics Section */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={24} /> Analytics
          </h2>
          
          {/* Analytics Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: '#1C1C26',
              border: '2px solid #2A2A38',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <DollarSign size={24} style={{ color: '#00CCEE' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.25rem' }}>
                {formatCurrency(pipelineValue)}
              </div>
              <div style={{ color: '#8888A0', fontSize: '0.875rem' }}>Total Pipeline</div>
            </div>

            <div style={{
              background: '#1C1C26',
              border: '2px solid #2A2A38',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <Target size={24} style={{ color: '#27AE60' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.25rem' }}>
                {formatCurrency(activeDeals.reduce((sum, d) => sum + (d.dealValue * d.probability / 100), 0))}
              </div>
              <div style={{ color: '#8888A0', fontSize: '0.875rem' }}>Weighted Pipeline</div>
            </div>

            <div style={{
              background: '#1C1C26',
              border: '2px solid #2A2A38',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <BarChart3 size={24} style={{ color: '#3498DB' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.25rem' }}>
                {winRate}%
              </div>
              <div style={{ color: '#8888A0', fontSize: '0.875rem' }}>Win Rate</div>
            </div>

            <div style={{
              background: '#1C1C26',
              border: '2px solid #2A2A38',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <TrendingUp size={24} style={{ color: '#9B59B6' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.25rem' }}>
                {activeDeals.length > 0 ? formatCurrency(pipelineValue / activeDeals.length) : '$0'}
              </div>
              <div style={{ color: '#8888A0', fontSize: '0.875rem' }}>Avg Deal Size</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Pipeline Funnel */}
            <div style={{
              background: '#1C1C26',
              border: '2px solid #2A2A38',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#F0F0F5', fontSize: '1.25rem' }}>Pipeline Funnel</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stages.map((stageObj) => {
                  const stageDeals = deals.filter(d => d.stage === stageObj.name);
                  const stageValue = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);
                  const maxValue = Math.max(...stages.map(s => deals.filter(d => d.stage === s.name).reduce((sum, d) => sum + d.dealValue, 0)), 1);
                  const isWonStage = stageObj.probability === 100 || stageObj.name.toLowerCase().includes('won');
                  return (
                    <div key={stageObj.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '100px', fontSize: '0.875rem', color: '#F0F0F5', fontWeight: '500' }}>
                        {stageObj.name}
                      </div>
                      <div style={{ flex: 1, height: '32px', background: '#09090F', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(stageValue / maxValue) * 100}%`,
                          height: '100%',
                          background: isWonStage ? 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)' : 'linear-gradient(135deg, #00CCEE 0%, #0099BB 100%)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '0.75rem',
                          minWidth: stageValue > 0 ? '60px' : '0'
                        }}>
                          {stageValue > 0 && (
                            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>
                              {formatCurrency(stageValue)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ width: '50px', textAlign: 'right', fontSize: '0.875rem', color: '#8888A0' }}>
                        {stageDeals.length}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Win/Loss Summary */}
            <div style={{
              background: '#1C1C26',
              border: '2px solid #2A2A38',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#F0F0F5', fontSize: '1.25rem' }}>Win/Loss Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#8888A0', fontSize: '0.875rem' }}>Won</span>
                    <span style={{ color: '#27AE60', fontWeight: '600' }}>{wonDeals.length} deals</span>
                  </div>
                  <div style={{ height: '8px', background: '#09090F', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: (wonDeals.length + lostDeals.length) > 0 ? `${(wonDeals.length / (wonDeals.length + lostDeals.length)) * 100}%` : '0%',
                      height: '100%',
                      background: '#27AE60',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#27AE60' }}>
                    {formatCurrency(wonValue)}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#8888A0', fontSize: '0.875rem' }}>Lost</span>
                    <span style={{ color: '#00CCEE', fontWeight: '600' }}>{lostDeals.length} deals</span>
                  </div>
                  <div style={{ height: '8px', background: '#09090F', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: (wonDeals.length + lostDeals.length) > 0 ? `${(lostDeals.length / (wonDeals.length + lostDeals.length)) * 100}%` : '0%',
                      height: '100%',
                      background: '#00CCEE',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#00CCEE' }}>
                    {formatCurrency(lostDeals.reduce((sum, d) => sum + d.dealValue, 0))}
                  </div>
                </div>

                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#09090F',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.5rem' }}>
                    Conversion Rate
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5' }}>
                    {winRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Breakdown Table */}
          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '2px solid #2A2A38' }}>
              <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>Stage Breakdown</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#09090F' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#F0F0F5' }}>Stage</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#F0F0F5' }}>Deals</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#F0F0F5' }}>Value</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#F0F0F5' }}>Avg Deal</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#F0F0F5' }}>% of Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {stages.filter(s => s.probability !== 0 && !s.name.toLowerCase().includes('lost')).map((stageObj) => {
                  const stageDeals = deals.filter(d => d.stage === stageObj.name);
                  const stageValue = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);
                  const totalPipeline = pipelineValue + wonValue;
                  const isWonStage = stageObj.probability === 100 || stageObj.name.toLowerCase().includes('won');
                  return (
                    <tr key={stageObj.id} style={{ borderBottom: '1px solid #2A2A38' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: isWonStage ? '#27AE60' : '#00CCEE'
                          }}></div>
                          <span style={{ fontWeight: '500', color: '#F0F0F5' }}>{stageObj.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#8888A0' }}>{stageDeals.length}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#F0F0F5' }}>{formatCurrency(stageValue)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#8888A0' }}>
                        {stageDeals.length > 0 ? formatCurrency(stageValue / stageDeals.length) : '$0'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#8888A0' }}>
                        {totalPipeline > 0 ? ((stageValue / totalPipeline) * 100).toFixed(1) : '0'}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#13131A' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: 'white' }}>Total</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>{activeDeals.length + wonDeals.length}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>{formatCurrency(pipelineValue + wonValue)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
                    {(activeDeals.length + wonDeals.length) > 0 ? formatCurrency((pipelineValue + wonValue) / (activeDeals.length + wonDeals.length)) : '$0'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

            {/* New Project Modal */}
      {showNewDealModal && (
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
          zIndex: 1100
        }}>
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#F0F0F5' }}>New Project</h2>
            <form onSubmit={handleCreateDeal}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                  Deal Name *
                </label>
                <input
                  type="text"
                  value={dealForm.dealName}
                  onChange={(e) => setDealForm({...dealForm, dealName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                    Value *
                  </label>
                  <input
                    type="number"
                    value={dealForm.dealValue}
                    onChange={(e) => setDealForm({...dealForm, dealValue: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #2A2A38',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                    Probability %
                  </label>
                  <input
                    type="number"
                    value={dealForm.probability}
                    onChange={(e) => setDealForm({...dealForm, probability: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #2A2A38',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                  Stage
                </label>
                <select
                  value={dealForm.stage}
                  onChange={(e) => setDealForm({...dealForm, stage: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                >
                  {stages.map(stageObj => (
                    <option key={stageObj.id} value={stageObj.name}>{stageObj.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                  Contact (Optional)
                </label>
                <select
                  value={dealForm.contactId}
                  onChange={(e) => setDealForm({...dealForm, contactId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a contact...</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowNewDealModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    background: '#1C1C26',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#00CCEE',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Person Modal */}
      {showNewContactModal && (
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
          zIndex: 1100
        }}>
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#F0F0F5' }}>New Person</h2>
            <form onSubmit={handleCreateContact}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #2A2A38',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #2A2A38',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                  Company
                </label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowNewContactModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    background: '#1C1C26',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#00CCEE',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Widget Settings Modal */}
      {showWidgetSettings && (
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
          zIndex: 1000
        }} onClick={() => setShowWidgetSettings(false)}>
          <div style={{
            background: '#1C1C26',
            borderRadius: '16px',
            width: '600px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)',
              color: 'white',
              padding: '1.5rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}><Settings size={14} /> Customize Dashboard</h2>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Select which KPIs appear in your dashboard widgets</p>
              </div>
              <button
                onClick={() => setShowWidgetSettings(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
              <p style={{ color: '#8888A0', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Choose 4 KPIs to display in your dashboard. Click a slot to change its metric.
              </p>
              
              {/* Current Widget Slots */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#F0F0F5', fontSize: '1rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={18} /> Your Dashboard Widgets
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {[0, 1, 2, 3].map((slotIndex) => {
                    const currentKpiId = widgetConfig[slotIndex];
                    return (
                      <div key={slotIndex} style={{
                        border: '2px solid #2A2A38',
                        borderRadius: '12px',
                        padding: '1rem',
                        background: '#09090F'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Widget {slotIndex + 1}
                        </div>
                        <select
                          value={currentKpiId}
                          onChange={(e) => {
                            const newConfig = [...widgetConfig];
                            newConfig[slotIndex] = e.target.value;
                            saveWidgetConfig(newConfig);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #2A2A38',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#F0F0F5',
                            background: '#1C1C26',
                            cursor: 'pointer'
                          }}
                        >
                          {kpiLibrary.map((kpi) => (
                            <option key={kpi.id} value={kpi.id}>
                              {getKpiIcon(kpi.icon)} {kpi.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Available KPIs Reference */}
              <div>
                <h3 style={{ color: '#F0F0F5', fontSize: '1rem', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList size={18} /> Available KPIs
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {kpiLibrary.map((kpi) => {
                    const isSelected = widgetConfig.includes(kpi.id);
                    return (
                      <div key={kpi.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(191, 10, 48, 0.1)' : 'transparent',
                        border: isSelected ? '2px solid #00CCEE' : '2px solid transparent'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: kpi.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem'
                        }}>{getKpiIcon(kpi.icon)}</div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '0.875rem' }}>{kpi.name}</div>
                          {isSelected && <div style={{ fontSize: '0.7rem', color: '#00CCEE' }}>In use</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{
              padding: '1rem 2rem',
              borderTop: '1px solid #2A2A38',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#09090F'
            }}>
              <button
                onClick={() => {
                  saveWidgetConfig(['won_revenue', 'pipeline_value', 'closing_soon', 'win_rate']);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #2A2A38',
                  borderRadius: '8px',
                  background: '#1C1C26',
                  color: '#8888A0',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Reset to Default
              </button>
              <button
                onClick={() => setShowWidgetSettings(false)}
                style={{
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#00CCEE',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>

  );
}
