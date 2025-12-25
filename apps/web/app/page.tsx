'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './components/ThemeToggle';
import NavBar from './components/NavBar';
import AuthGuard from './components/AuthGuard';
import { logout } from './utils/auth';

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

const STAGES = ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];

// Helper to format stage names for display
const formatStage = (stage: string) => {
  const stageLabels: Record<string, string> = {
    'PROSPECT': 'Prospect',
    'QUALIFIED': 'Qualified',
    'PROPOSAL': 'Proposal',
    'NEGOTIATION': 'Negotiation',
    'CLOSED_WON': 'Closed Won',
    'CLOSED_LOST': 'Closed Lost'
  };
  return stageLabels[stage] || stage;
};

export default function CRODashboard() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('cro');
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: '64px',
        bottom: 0,
        width: sidebarCollapsed ? '64px' : '240px',
        background: 'white',
        borderRight: '2px solid var(--zander-border-gray)',
        padding: '1.5rem 0',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 900
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            color: 'var(--zander-gray)', 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '0.75rem',
            display: sidebarCollapsed ? 'none' : 'block'
          }}>
            Sales & Revenue
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { icon: '📊', label: 'Dashboard', href: '/', active: true },
              { icon: '📈', label: 'Pipeline', href: '/pipeline', active: false },
              { icon: '👥', label: 'Contacts', href: '/contacts', active: false },
              { icon: '📉', label: 'Analytics', href: '/analytics', active: false },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a
                  href={item.href || "#"}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: item.active ? 'var(--zander-red)' : 'var(--zander-navy)',
                    background: item.active ? 'rgba(191, 10, 48, 0.1)' : 'transparent',
                    fontWeight: item.active ? '600' : '400',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ padding: '0 1rem' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            color: 'var(--zander-gray)', 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '0.75rem',
            display: sidebarCollapsed ? 'none' : 'block'
          }}>
            Tools
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { icon: '📬', label: 'Communications', href: '/communications' },
              { icon: '📅', label: 'Schedule', href: '/schedule' },
              { icon: '📋', label: 'Forms', href: '/forms' },
              { icon: '🤖', label: 'Ask Jordan (CRO)', href: '/ai' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a
                  href={item.href || "#"}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'var(--zander-navy)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

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
              + New Deal
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
              + New Contact
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Won This Month */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #E74C3C 0%, #d93426 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>💰</div>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: 'rgba(40, 167, 69, 0.1)',
                color: '#28a745'
              }}>↑ 12%</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
              {formatCurrency(wonValue)}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>
              Won This Month
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
              {wonDeals.length} deals closed
            </div>
          </div>

          {/* Pipeline Value */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>📊</div>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: 'rgba(40, 167, 69, 0.1)',
                color: '#28a745'
              }}>↑ 8%</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
              {formatCurrency(pipelineValue)}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>
              Pipeline Value
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
              {activeDeals.length} active deals
            </div>
          </div>

          {/* Closing This Week */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3498DB 0%, #2471a3 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>🤝</div>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: 'rgba(40, 167, 69, 0.1)',
                color: '#28a745'
              }}>+5</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
              {deals.filter(d => d.stage === 'NEGOTIATION').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>
              Closing This Week
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
              Expected: {formatCurrency(deals.filter(d => d.stage === 'NEGOTIATION').reduce((sum, d) => sum + d.dealValue, 0))}
            </div>
          </div>

          {/* Win Rate */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #9B59B6 0%, #7d3c98 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>📈</div>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: 'rgba(40, 167, 69, 0.1)',
                color: '#28a745'
              }}>↑ 3%</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
              {winRate}%
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>
              Win Rate
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
              Last 30 days
            </div>
          </div>
        </div>

        {/* Pipeline Overview - Full Width */}
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
              }}>Pipeline Overview</h3>
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
      </main>

            {/* New Deal Modal */}
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
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--zander-navy)' }}>New Deal</h2>
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

      {/* New Contact Modal */}
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
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--zander-navy)' }}>New Contact</h2>
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
    </div>
    </AuthGuard>

  );
}
