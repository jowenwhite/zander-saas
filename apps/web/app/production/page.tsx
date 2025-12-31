'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import { logout } from '../utils/auth';
import Sidebar from '../components/Sidebar';

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
  probability: number;
  expectedCloseDate?: string;
  contact: Contact | null;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description: string;
  date: string;
  dealId?: string;
}

const STAGES = ['LEAD', 'PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];

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
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('cro');
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  
  // Widget configuration - which KPIs to show in each slot
  const [widgetConfig, setWidgetConfig] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zander_widget_config');
      return saved ? JSON.parse(saved) : ['won_revenue', 'pipeline_value', 'closing_soon', 'win_rate'];
    }
    return ['won_revenue', 'pipeline_value', 'closing_soon', 'win_rate'];
  });
  
  // KPI Library - all available metrics
  const kpiLibrary = [
    { id: 'won_revenue', name: 'Won This Month', icon: '💰', color: '#E74C3C', gradient: 'linear-gradient(135deg, #E74C3C 0%, #d93426 100%)' },
    { id: 'pipeline_value', name: 'Pipeline Value', icon: '📊', color: '#27AE60', gradient: 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)' },
    { id: 'closing_soon', name: 'Closing This Week', icon: '🤝', color: '#3498DB', gradient: 'linear-gradient(135deg, #3498DB 0%, #2471a3 100%)' },
    { id: 'win_rate', name: 'Win Rate', icon: '📈', color: '#9B59B6', gradient: 'linear-gradient(135deg, #9B59B6 0%, #7d3c98 100%)' },
    { id: 'avg_deal_size', name: 'Avg Deal Size', icon: '💎', color: '#F39C12', gradient: 'linear-gradient(135deg, #F39C12 0%, #d68910 100%)' },
    { id: 'total_deals', name: 'Total Deals', icon: '📋', color: '#1ABC9C', gradient: 'linear-gradient(135deg, #1ABC9C 0%, #16a085 100%)' },
    { id: 'weighted_pipeline', name: 'Weighted Pipeline', icon: '🎯', color: '#E67E22', gradient: 'linear-gradient(135deg, #E67E22 0%, #d35400 100%)' },
    { id: 'leads_count', name: 'New Leads', icon: '🌱', color: '#2ECC71', gradient: 'linear-gradient(135deg, #2ECC71 0%, #27ae60 100%)' },
    { id: 'proposals_out', name: 'Proposals Out', icon: '📄', color: '#9B59B6', gradient: 'linear-gradient(135deg, #9B59B6 0%, #8e44ad 100%)' },
    { id: 'lost_deals', name: 'Lost This Month', icon: '📉', color: '#95A5A6', gradient: 'linear-gradient(135deg, #95A5A6 0%, #7f8c8d 100%)' },
  ];
  
  // Calculate KPI values
  const getKpiValue = (kpiId: string) => {
    switch (kpiId) {
      case 'won_revenue':
        return { value: formatCurrency(wonValue), detail: `${wonDeals.length} deals closed`, trend: '+12%', trendUp: true };
      case 'pipeline_value':
        return { value: formatCurrency(pipelineValue), detail: `${activeDeals.length} active deals`, trend: '+8%', trendUp: true };
      case 'closing_soon':
        const closingDeals = deals.filter(d => d.stage === 'NEGOTIATION');
        return { value: String(closingDeals.length), detail: `Expected: ${formatCurrency(closingDeals.reduce((sum, d) => sum + d.dealValue, 0))}`, trend: '+5', trendUp: true };
      case 'win_rate':
        return { value: `${winRate}%`, detail: 'Last 30 days', trend: '+3%', trendUp: true };
      case 'avg_deal_size':
        const avgSize = wonDeals.length > 0 ? wonValue / wonDeals.length : 0;
        return { value: formatCurrency(avgSize), detail: `From ${wonDeals.length} deals`, trend: '+5%', trendUp: true };
      case 'total_deals':
        return { value: String(deals.length), detail: 'All time', trend: '+' + activeDeals.length, trendUp: true };
      case 'weighted_pipeline':
        const weighted = activeDeals.reduce((sum, d) => sum + (d.dealValue * d.probability / 100), 0);
        return { value: formatCurrency(weighted), detail: 'Risk-adjusted', trend: '+6%', trendUp: true };
      case 'leads_count':
        const leads = deals.filter(d => d.stage === 'LEAD' || d.stage === 'PROSPECT');
        return { value: String(leads.length), detail: 'In early stages', trend: '+3', trendUp: true };
      case 'proposals_out':
        const proposals = deals.filter(d => d.stage === 'PROPOSAL');
        return { value: String(proposals.length), detail: formatCurrency(proposals.reduce((sum, d) => sum + d.dealValue, 0)), trend: '+2', trendUp: true };
      case 'lost_deals':
        const lost = deals.filter(d => d.stage === 'CLOSED_LOST');
        return { value: String(lost.length), detail: formatCurrency(lost.reduce((sum, d) => sum + d.dealValue, 0)), trend: '-2', trendUp: false };
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
  }, []);

  async function fetchData() {
    try {
      const [contactsRes, dealsRes] = await Promise.all([
        fetch('https://api.zanderos.com/contacts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } }),
        fetch('https://api.zanderos.com/deals/pipeline', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } }),
      ]);
      
      if (contactsRes.ok && dealsRes.ok) {
        const contactsData = await contactsRes.json();
        const dealsData = await dealsRes.json();
        setContacts(contactsData.data || []);
        const allDeals = [...(dealsData.pipeline.PROSPECT || []), ...(dealsData.pipeline.QUALIFIED || []), ...(dealsData.pipeline.PROPOSAL || []), ...(dealsData.pipeline.NEGOTIATION || []), ...(dealsData.pipeline.CLOSED_WON || []), ...(dealsData.pipeline.CLOSED_LOST || [])]; setDeals(allDeals);
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

  // Calculate metrics
  const activeDeals = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
  const wonDeals = deals.filter(d => d.stage === 'CLOSED_WON');
  const pipelineValue = activeDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  // Get deals by stage for pipeline
  const getDealsByStage = (stage: string) => deals.filter(d => d.stage === stage);

  // Get greeting based on time
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

  const recentActivities: Activity[] = activities.length > 0 
    ? activities.slice(0, 5).map(a => ({
        id: a.id,
        type: a.type || 'note',
        title: a.subject || 'Activity',
        description: a.description || '',
        date: formatTimeAgo(a.createdAt)
      }))
    : [
        { id: '1', type: 'call', title: 'Called Precision Metal Works', description: 'Follow up on proposal', date: '2 hours ago' },
        { id: '2', type: 'email', title: 'Sent quote to ProBuild', description: 'Kitchen cabinet quote', date: '4 hours ago' },
        { id: '3', type: 'meeting', title: 'Demo with Elite HVAC', description: 'Product demonstration', date: 'Yesterday' },
        { id: '4', type: 'note', title: 'Updated Georgia Furniture', description: 'Added requirements notes', date: 'Yesterday' },
      ];

  // Compute tasks from deals in PROPOSAL/NEGOTIATION stages
  const todaysTasks = deals
    .filter(d => d.stage === 'PROPOSAL' || d.stage === 'NEGOTIATION')
    .slice(0, 3)
    .map(d => ({
      title: `Follow up with ${d.dealName.split(' - ')[1] || d.dealName}`,
      detail: d.stage === 'PROPOSAL' ? 'Proposal pending review' : 'In negotiation',
      priority: d.dealValue > 10000 ? 'high' : 'medium',
      dealId: d.id
    }));

  // Compute follow-ups from deals with no recent activity (using deals not in CLOSED stages)
  const followupsNeeded = deals
    .filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST')
    .filter(d => {
      const lastUpdate = new Date(d.updatedAt);
      const daysSince = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince >= 3;
    })
    .slice(0, 3)
    .map(d => {
      const lastUpdate = new Date(d.updatedAt);
      const daysSince = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        title: d.dealName.split(' - ')[1] || d.dealName,
        detail: `No contact in ${daysSince} days`,
        overdue: daysSince >= 7,
        dealId: d.id
      };
    });

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
        background: 'var(--zander-off-white)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <div style={{ color: 'var(--zander-gray)' }}>Loading Zander...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>

    <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
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
              background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.5rem'
            }}>JW</div>
            <div>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: 'var(--zander-navy)', 
                margin: 0,
                marginBottom: '0.25rem'
              }}>
                {getGreeting()}, Jonathan 👋
              </h1>
              <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
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
                border: '2px solid var(--zander-navy)',
                background: 'white',
                color: 'var(--zander-navy)',
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
                background: 'var(--zander-red)',
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
                border: '2px solid var(--zander-border-gray)',
                background: 'white',
                color: 'var(--zander-gray)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ⚙️ Customize
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
                background: 'white',
                border: '2px solid var(--zander-border-gray)',
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
                e.currentTarget.style.borderColor = 'var(--zander-border-gray)';
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
                  }}>{kpi.icon}</div>
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
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                  {kpiData.value}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>
                  {kpi.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
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
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
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
                color: 'var(--zander-navy)', 
                margin: 0 
              }}>Projects Overview</h3>
              <button style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: 'var(--zander-gray)',
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
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1rem'
            }}>
              {STAGES.map((stage) => {
                const stageDeals = getDealsByStage(stage);
                return (

                  <div key={stage} style={{
                    background: 'var(--zander-off-white)',
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
                      borderBottom: '2px solid var(--zander-border-gray)'
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: 'var(--zander-navy)', 
                        fontSize: '0.875rem' 
                      }}>{formatStage(stage)}</span>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: 'var(--zander-red)',
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
                        background: 'white',
                        border: '1px solid var(--zander-border-gray)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          color: 'var(--zander-navy)',
                          marginBottom: '0.25rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{deal.dealName}</div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--zander-red)',
                          fontWeight: '600'
                        }}>{formatCurrency(deal.dealValue)}</div>
                      </div>
                    ))}

                    {stageDeals.length > 3 && (
                      <div style={{ 
                        textAlign: 'center', 
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--zander-gray)'
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
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
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
                color: 'var(--zander-navy)', 
                margin: 0 
              }}>Recent Activity</h3>
            </div>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {recentActivities.map((activity) => (
                <li key={activity.id} onClick={() => router.push('/pipeline')} style={{
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
                              activity.type === 'meeting' ? 'rgba(155, 89, 182, 0.1)' :
                              'rgba(39, 174, 96, 0.1)'
                  }}>
                    {activity.type === 'call' ? '📞' :
                     activity.type === 'email' ? '📧' :
                     activity.type === 'meeting' ? '📅' : '📝'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: 'var(--zander-navy)', 
                      marginBottom: '0.25rem',
                      fontSize: '0.875rem'
                    }}>{activity.title}</div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--zander-gray)',
                      marginBottom: '0.25rem'
                    }}>{activity.description}</div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--zander-gray)' 
                    }}>{activity.date}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Today's Tasks */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'var(--zander-navy)', 
              margin: 0,
              marginBottom: '1.5rem'
            }}>Today's Tasks</h3>

            {(todaysTasks.length > 0 ? todaysTasks : [
              { title: 'Follow up with Precision Metal Works', detail: 'Proposal sent 3 days ago', priority: 'high' },
              { title: 'Prepare demo for Elite HVAC', detail: 'Meeting tomorrow at 2pm', priority: 'high' },
              { title: 'Send quote to ProBuild Contractors', detail: 'Requested yesterday', priority: 'medium' }
            ]).map((task, i) => (
              <div key={i} onClick={() => (task as any).dealId && router.push("/pipeline")} style={{
                display: 'flex',
                alignItems: 'start',
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--zander-off-white)',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '4px',
                  flexShrink: 0,
                  marginTop: '0.25rem'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: 'var(--zander-navy)',
                    marginBottom: '0.25rem'
                  }}>{task.title}</div>
                  <div style={{ 
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: 'var(--zander-gray)'
                  }}>
                    <span>📋 {task.detail}</span>
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
            ))}
          </div>

          {/* Follow-ups Needed */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
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
                color: 'var(--zander-navy)', 
                margin: 0 
              }}>Follow-ups Needed</h3>
              <span style={{
                padding: '0.25rem 0.75rem',
                background: 'rgba(220, 53, 69, 0.1)',
                color: '#dc3545',
                borderRadius: '50%',
                fontWeight: '700',
                fontSize: '0.875rem'
              }}>{followupsNeeded.length || 3}</span>
            </div>

            {(followupsNeeded.length > 0 ? followupsNeeded : [
              { title: 'Georgia Furniture Co.', detail: 'No contact in 7 days', overdue: true },
              { title: 'Summit Financial Advisors', detail: 'Proposal expires in 2 days', overdue: false },
              { title: 'Atlanta Law Group', detail: 'Waiting for response (5 days)', overdue: true }
            ]).map((task, i) => (
              <div key={i} onClick={() => (task as any).dealId && router.push("/pipeline")} style={{
                display: 'flex',
                alignItems: 'start',
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--zander-off-white)',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '4px',
                  flexShrink: 0,
                  marginTop: '0.25rem'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: 'var(--zander-navy)',
                    marginBottom: '0.25rem'
                  }}>{task.title}</div>
                  <div style={{ 
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: 'var(--zander-gray)'
                  }}>
                    <span>⏰ {task.detail}</span>
                    {task.overdue && (
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        background: 'rgba(220, 53, 69, 0.1)',
                        color: '#dc3545',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>Overdue</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '1.5rem' }}>
            📊 Analytics
          </h2>
          
          {/* Analytics Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>💰</div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                {formatCurrency(deals.reduce((sum, d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' ? sum + d.dealValue : sum, 0))}
              </div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Total Pipeline</div>
            </div>

            <div style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>🎯</div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                {formatCurrency(deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').reduce((sum, d) => sum + (d.dealValue * d.probability / 100), 0))}
              </div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Weighted Pipeline</div>
            </div>

            <div style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3498DB 0%, #2471a3 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>📊</div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                {(() => {
                  const won = deals.filter(d => d.stage === 'CLOSED_WON').length;
                  const lost = deals.filter(d => d.stage === 'CLOSED_LOST').length;
                  return won + lost > 0 ? ((won / (won + lost)) * 100).toFixed(1) : '0';
                })()}%
              </div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Win Rate</div>
            </div>

            <div style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #9B59B6 0%, #7d3c98 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>📈</div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                {(() => {
                  const activeDeals = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
                  const total = activeDeals.reduce((sum, d) => sum + d.dealValue, 0);
                  return activeDeals.length > 0 ? formatCurrency(total / activeDeals.length) : '$0';
                })()}
              </div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Avg Deal Size</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Pipeline Funnel */}
            <div style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.25rem' }}>Pipeline Funnel</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['LEAD', 'PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'].map((stage) => {
                  const stageDeals = deals.filter(d => d.stage === stage);
                  const stageValue = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);
                  const maxValue = Math.max(...['LEAD', 'PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'].map(s => deals.filter(d => d.stage === s).reduce((sum, d) => sum + d.dealValue, 0)), 1);
                  const stageLabels: Record<string, string> = { 'LEAD': 'Lead', 'PROSPECT': 'Prospect', 'QUALIFIED': 'Qualified', 'PROPOSAL': 'Proposal', 'NEGOTIATION': 'Negotiation', 'CLOSED_WON': 'Closed Won' };
                  return (
                    <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '100px', fontSize: '0.875rem', color: 'var(--zander-navy)', fontWeight: '500' }}>
                        {stageLabels[stage] || stage}
                      </div>
                      <div style={{ flex: 1, height: '32px', background: 'var(--zander-off-white)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(stageValue / maxValue) * 100}%`,
                          height: '100%',
                          background: stage === 'CLOSED_WON' ? 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)' : 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
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
                      <div style={{ width: '50px', textAlign: 'right', fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                        {stageDeals.length}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Win/Loss Summary */}
            <div style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.25rem' }}>Win/Loss Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Won</span>
                    <span style={{ color: '#27AE60', fontWeight: '600' }}>{deals.filter(d => d.stage === 'CLOSED_WON').length} deals</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--zander-off-white)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: (() => {
                        const won = deals.filter(d => d.stage === 'CLOSED_WON').length;
                        const lost = deals.filter(d => d.stage === 'CLOSED_LOST').length;
                        return won + lost > 0 ? `${(won / (won + lost)) * 100}%` : '0%';
                      })(),
                      height: '100%',
                      background: '#27AE60',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#27AE60' }}>
                    {formatCurrency(deals.filter(d => d.stage === 'CLOSED_WON').reduce((sum, d) => sum + d.dealValue, 0))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Lost</span>
                    <span style={{ color: 'var(--zander-red)', fontWeight: '600' }}>{deals.filter(d => d.stage === 'CLOSED_LOST').length} deals</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--zander-off-white)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: (() => {
                        const won = deals.filter(d => d.stage === 'CLOSED_WON').length;
                        const lost = deals.filter(d => d.stage === 'CLOSED_LOST').length;
                        return won + lost > 0 ? `${(lost / (won + lost)) * 100}%` : '0%';
                      })(),
                      height: '100%',
                      background: 'var(--zander-red)',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-red)' }}>
                    {formatCurrency(deals.filter(d => d.stage === 'CLOSED_LOST').reduce((sum, d) => sum + d.dealValue, 0))}
                  </div>
                </div>

                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'var(--zander-off-white)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>
                    Conversion Rate
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                    {(() => {
                      const won = deals.filter(d => d.stage === 'CLOSED_WON').length;
                      const lost = deals.filter(d => d.stage === 'CLOSED_LOST').length;
                      return won + lost > 0 ? ((won / (won + lost)) * 100).toFixed(1) : '0';
                    })()}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Breakdown Table */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--zander-border-gray)' }}>
              <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.25rem' }}>Stage Breakdown</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--zander-off-white)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--zander-navy)' }}>Stage</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>Deals</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>Value</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>Avg Deal</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>% of Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {['LEAD', 'PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'].map((stage) => {
                  const stageDeals = deals.filter(d => d.stage === stage);
                  const stageValue = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);
                  const totalPipeline = deals.filter(d => d.stage !== 'CLOSED_LOST').reduce((sum, d) => sum + d.dealValue, 0);
                  const stageLabels: Record<string, string> = { 'LEAD': 'Lead', 'PROSPECT': 'Prospect', 'QUALIFIED': 'Qualified', 'PROPOSAL': 'Proposal', 'NEGOTIATION': 'Negotiation', 'CLOSED_WON': 'Closed Won' };
                  return (
                    <tr key={stage} style={{ borderBottom: '1px solid var(--zander-border-gray)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: stage === 'CLOSED_WON' ? '#27AE60' : 'var(--zander-red)'
                          }}></div>
                          <span style={{ fontWeight: '500', color: 'var(--zander-navy)' }}>{stageLabels[stage] || stage}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--zander-gray)' }}>{stageDeals.length}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>{formatCurrency(stageValue)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--zander-gray)' }}>
                        {stageDeals.length > 0 ? formatCurrency(stageValue / stageDeals.length) : '$0'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--zander-gray)' }}>
                        {totalPipeline > 0 ? ((stageValue / totalPipeline) * 100).toFixed(1) : '0'}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--zander-navy)' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: 'white' }}>Total</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>{deals.filter(d => d.stage !== 'CLOSED_LOST').length}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>{formatCurrency(deals.filter(d => d.stage !== 'CLOSED_LOST').reduce((sum, d) => sum + d.dealValue, 0))}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
                    {(() => {
                      const filteredDeals = deals.filter(d => d.stage !== 'CLOSED_LOST');
                      const total = filteredDeals.reduce((sum, d) => sum + d.dealValue, 0);
                      return filteredDeals.length > 0 ? formatCurrency(total / filteredDeals.length) : '$0';
                    })()}
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
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--zander-navy)' }}>New Project</h2>
            <form onSubmit={handleCreateDeal}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                  Deal Name *
                </label>
                <input
                  type="text"
                  value={dealForm.dealName}
                  onChange={(e) => setDealForm({...dealForm, dealName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                    Value *
                  </label>
                  <input
                    type="number"
                    value={dealForm.dealValue}
                    onChange={(e) => setDealForm({...dealForm, dealValue: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                    Probability %
                  </label>
                  <input
                    type="number"
                    value={dealForm.probability}
                    onChange={(e) => setDealForm({...dealForm, probability: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                  Stage
                </label>
                <select
                  value={dealForm.stage}
                  onChange={(e) => setDealForm({...dealForm, stage: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                >
                  {STAGES.map(stage => (
                    <option key={stage} value={stage}>{formatStage(stage)}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                  Contact (Optional)
                </label>
                <select
                  value={dealForm.contactId}
                  onChange={(e) => setDealForm({...dealForm, contactId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--zander-border-gray)',
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
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '8px',
                    background: 'white',
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
                    background: 'var(--zander-red)',
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
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--zander-navy)' }}>New Person</h2>
            <form onSubmit={handleCreateContact}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                  Company
                </label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--zander-border-gray)',
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
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '8px',
                    background: 'white',
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
                    background: 'var(--zander-red)',
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
            background: 'white',
            borderRadius: '16px',
            width: '600px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
              color: 'white',
              padding: '1.5rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>⚙️ Customize Dashboard</h2>
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
            <div style={{ padding: '2rem', maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ color: 'var(--zander-gray)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Choose 4 KPIs to display in your dashboard. Click a slot to change its metric.
              </p>
              
              {/* Current Widget Slots */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--zander-navy)', fontSize: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
                  📊 Your Dashboard Widgets
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {[0, 1, 2, 3].map((slotIndex) => {
                    const currentKpiId = widgetConfig[slotIndex];
                    return (
                      <div key={slotIndex} style={{
                        border: '2px solid var(--zander-border-gray)',
                        borderRadius: '12px',
                        padding: '1rem',
                        background: 'var(--zander-off-white)'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                            border: '2px solid var(--zander-border-gray)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: 'var(--zander-navy)',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          {kpiLibrary.map((kpi) => (
                            <option key={kpi.id} value={kpi.id}>
                              {kpi.icon} {kpi.name}
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
                <h3 style={{ color: 'var(--zander-navy)', fontSize: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
                  📋 Available KPIs
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
                        border: isSelected ? '2px solid var(--zander-red)' : '2px solid transparent'
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
                        }}>{kpi.icon}</div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.875rem' }}>{kpi.name}</div>
                          {isSelected && <div style={{ fontSize: '0.7rem', color: 'var(--zander-red)' }}>In use</div>}
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
              borderTop: '1px solid var(--zander-border-gray)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--zander-off-white)'
            }}>
              <button
                onClick={() => {
                  saveWidgetConfig(['won_revenue', 'pipeline_value', 'closing_soon', 'win_rate']);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '8px',
                  background: 'white',
                  color: 'var(--zander-gray)',
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
                  background: 'var(--zander-red)',
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
