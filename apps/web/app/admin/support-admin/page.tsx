'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// Types
interface SystemHealth {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  email: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
}

interface Headwind {
  id: string;
  title: string;
  description: string;
  priority: 'P1' | 'P2' | 'P3';
  category: 'BUG' | 'REBUILD' | 'NEW_BUILD' | 'ENHANCEMENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DEPLOYED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

interface Tenant {
  id: string;
  name: string;
  userCount: number;
  plan: string;
  lastActive: string;
  status: 'active' | 'trial' | 'suspended';
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  userId: string;
  userName: string;
  tenantName: string;
  status: 'NEW' | 'AI_RESOLVED' | 'PENDING_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'P1' | 'P2' | 'P3' | 'AUTO';
  createdVia: string;
  createdAt: string;
}

interface ZanderMessage {
  role: 'zander' | 'user';
  content: string;
  timestamp: string;
  actions?: { label: string; action: string }[];
}

// Mock Data
const MOCK_HEALTH: SystemHealth = {
  api: 'healthy',
  database: 'healthy',
  email: 'healthy',
  lastChecked: new Date().toISOString()
};

const MOCK_HEADWINDS: Headwind[] = [
  { id: '1', title: 'Gmail sync failing for some users', description: 'OAuth token refresh issue', priority: 'P1', category: 'BUG', status: 'IN_PROGRESS', createdAt: '2026-01-02T10:00:00Z', updatedAt: '2026-01-02T14:00:00Z' },
  { id: '2', title: 'Dashboard slow on mobile', description: 'Performance optimization needed', priority: 'P2', category: 'ENHANCEMENT', status: 'OPEN', createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z' },
  { id: '3', title: 'Add bulk contact import', description: 'Users requesting CSV import', priority: 'P3', category: 'NEW_BUILD', status: 'OPEN', createdAt: '2025-12-28T12:00:00Z', updatedAt: '2025-12-28T12:00:00Z' },
];

const MOCK_TENANTS: Tenant[] = [
  { id: '1', name: 'My Cabinet Factory', userCount: 24, plan: 'Enterprise', lastActive: '2 min ago', status: 'active' },
  { id: '2', name: '64 West Holdings LLC', userCount: 3, plan: 'Pro', lastActive: '5 min ago', status: 'active' },
  { id: '3', name: '64 West Consulting', userCount: 2, plan: 'Pro', lastActive: '1 hour ago', status: 'active' },
  { id: '4', name: '64 West Finance', userCount: 1, plan: 'Starter', lastActive: '2 hours ago', status: 'active' },
  { id: '5', name: 'Zander Inc', userCount: 5, plan: 'Enterprise', lastActive: '10 min ago', status: 'active' },
];

const MOCK_TICKETS: SupportTicket[] = [
  { id: '1', ticketNumber: 'TICK-001', subject: 'How do I add a new contact?', userId: 'u1', userName: 'John Smith', tenantName: 'Acme Corp', status: 'AI_RESOLVED', priority: 'AUTO', createdVia: 'JORDAN', createdAt: '2026-01-02T15:00:00Z' },
  { id: '2', ticketNumber: 'TICK-002', subject: 'My import failed with error', userId: 'u2', userName: 'Jane Doe', tenantName: 'Beta LLC', status: 'PENDING_REVIEW', priority: 'P2', createdVia: 'MIRANDA', createdAt: '2026-01-02T14:30:00Z' },
  { id: '3', ticketNumber: 'TICK-003', subject: 'Cannot connect Gmail account', userId: 'u3', userName: 'Bob Wilson', tenantName: 'Test Inc', status: 'NEW', priority: 'P1', createdVia: 'MANUAL', createdAt: '2026-01-02T14:00:00Z' },
];

const INITIAL_ZANDER_MESSAGE: ZanderMessage = {
  role: 'zander',
  content: `Good afternoon, Jonathan. Here's your operational status:

📊 SYSTEM: All systems operational  •  🎫 TICKETS: 3 total (1 auto-resolved, 1 needs review, 1 new)  •  🔴 HEADWINDS: 1 P1 in progress (Gmail sync)  •  👥 TENANTS: 5 active, 35 total users

⚠️ I noticed the Gmail sync issue (Headwind #1) may be related to the new ticket from Bob Wilson. Should I link them?`,
  timestamp: new Date().toISOString(),
  actions: [
    { label: 'Yes, link ticket to Headwind', action: 'link_headwind' },
    { label: 'Show me the ticket', action: 'view_ticket' },
    { label: 'Dismiss', action: 'dismiss' }
  ]
};

export default function SupportAdminPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'headwinds' | 'tenants' | 'tickets'>('overview');
  
  // Data state
  const [health, setHealth] = useState<SystemHealth>(MOCK_HEALTH);
  const [headwinds, setHeadwinds] = useState<Headwind[]>(MOCK_HEADWINDS);
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  
  // Zander AI state
  const [zanderOpen, setZanderOpen] = useState(true);
  const [zanderExpanded, setZanderExpanded] = useState(false);
  const [zanderMessages, setZanderMessages] = useState<ZanderMessage[]>([INITIAL_ZANDER_MESSAGE]);
  const [zanderInput, setZanderInput] = useState('');
  
  // Search/Filter state
  const [tenantSearch, setTenantSearch] = useState('');
  const [headwindFilter, setHeadwindFilter] = useState<'all' | 'P1' | 'P2' | 'P3'>('all');
  
  // Modal state
  const [showHeadwindModal, setShowHeadwindModal] = useState(false);
  const [editingHeadwind, setEditingHeadwind] = useState<Headwind | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('zander_token');
    const userData = localStorage.getItem('zander_user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    if (!user.isSuperAdmin) {
      router.push('/production');
      return;
    }
    
    setIsSuperAdmin(true);
    setLoading(false);
    
    // TODO: Fetch real data from API
    checkSystemHealth();
  }, [router]);

  useEffect(() => {
    // Scroll to bottom of messages when new message added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [zanderMessages]);

  const checkSystemHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        setHealth(prev => ({ ...prev, api: 'healthy', lastChecked: new Date().toISOString() }));
      } else {
        setHealth(prev => ({ ...prev, api: 'degraded', lastChecked: new Date().toISOString() }));
      }
    } catch {
      setHealth(prev => ({ ...prev, api: 'down', lastChecked: new Date().toISOString() }));
    }
  };

  const handleZanderSend = () => {
    if (!zanderInput.trim()) return;
    
    const userMessage: ZanderMessage = {
      role: 'user',
      content: zanderInput,
      timestamp: new Date().toISOString()
    };
    
    setZanderMessages(prev => [...prev, userMessage]);
    const currentInput = zanderInput;
    setZanderInput('');
    
    // Mock AI response
    setTimeout(() => {
      const aiResponse: ZanderMessage = {
        role: 'zander',
        content: `I understand you're asking about "${currentInput}". Let me look into that for you.

Based on the current system state: All systems are operational, no related issues found in recent tickets. Would you like me to search for more specific information?`,
        timestamp: new Date().toISOString()
      };
      
      setZanderMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleZanderAction = (action: string) => {
    const actionResponses: Record<string, string> = {
      'link_headwind': "✅ Done! I've linked TICK-003 to Headwind #1 (Gmail sync issue). Bob Wilson will be notified when this is resolved.",
      'view_ticket': "Opening ticket TICK-003 from Bob Wilson...\n\n**Subject:** Cannot connect Gmail account\n**Details:** User reports OAuth error when attempting to connect Gmail. Error code: TOKEN_REFRESH_FAILED\n\nThis matches the pattern we're seeing in Headwind #1.",
      'dismiss': 'Got it. Let me know if you need anything else!'
    };
    
    const response: ZanderMessage = {
      role: 'zander',
      content: actionResponses[action] || 'Action completed.',
      timestamp: new Date().toISOString()
    };
    
    setZanderMessages(prev => [...prev, response]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'active': case 'DEPLOYED': case 'CLOSED': case 'AI_RESOLVED': case 'RESOLVED': return '#28a745';
      case 'degraded': case 'trial': case 'IN_PROGRESS': case 'TESTING': case 'PENDING_REVIEW': return '#ffc107';
      case 'down': case 'suspended': case 'OPEN': case 'NEW': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return '#dc3545';
      case 'P2': return '#ffc107';
      case 'P3': return '#28a745';
      default: return '#6c757d';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(tenantSearch.toLowerCase())
  );

  const filteredHeadwinds = headwinds.filter(h => 
    headwindFilter === 'all' || h.priority === headwindFilter
  );

  const zanderHeight = zanderExpanded ? '400px' : zanderOpen ? '200px' : '48px';

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', marginLeft: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading...</div>
        </main>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', marginLeft: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <h2>Access Denied</h2>
            <p>This page is only accessible to SuperAdmins.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zander-off-white)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Main Content Area - Scrollable */}
        <main style={{ flex: 1, padding: '2rem', overflow: 'auto', paddingBottom: zanderHeight }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
            borderRadius: '12px',
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ color: 'white', margin: 0, fontSize: '1.75rem' }}>🛡️ Support Admin</h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0.25rem 0 0' }}>
                Platform operations • Zander AI powered • SuperAdmin Only
              </p>
            </div>
          </div>

          {/* System Pulse Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>API Status</span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: getStatusColor(health.api) }}></span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                {health.api === 'healthy' ? '✓ Healthy' : health.api === 'degraded' ? '⚠ Degraded' : '✕ Down'}
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Database</span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: getStatusColor(health.database) }}></span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                {health.database === 'healthy' ? '✓ Healthy' : health.database === 'degraded' ? '⚠ Degraded' : '✕ Down'}
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Active Users</span>
                <span style={{ fontSize: '0.8rem', color: '#28a745' }}>↑ 12%</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>35</div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Open Tickets</span>
                <span style={{ fontSize: '0.8rem', color: tickets.filter(t => t.status === 'NEW' || t.status === 'PENDING_REVIEW').length > 0 ? '#dc3545' : '#28a745' }}>
                  {tickets.filter(t => t.status === 'NEW').length} new
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                {tickets.filter(t => !['RESOLVED', 'CLOSED', 'AI_RESOLVED'].includes(t.status)).length}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            background: 'white',
            padding: '0.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {(['overview', 'headwinds', 'tenants', 'tickets'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  background: activeTab === tab ? 'var(--zander-navy)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--zander-navy)',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab === 'overview' && '📊'} {tab === 'headwinds' && '🔴'} {tab === 'tenants' && '🏢'} {tab === 'tickets' && '🎫'}
                {' '}{tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'headwinds' && ` (${headwinds.filter(h => h.status !== 'CLOSED' && h.status !== 'DEPLOYED').length})`}
                {tab === 'tickets' && ` (${tickets.filter(t => !['RESOLVED', 'CLOSED', 'AI_RESOLVED'].includes(t.status)).length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Recent Headwinds */}
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>🔴 Active Headwinds</h3>
                  <button onClick={() => setActiveTab('headwinds')} style={{ background: 'none', border: 'none', color: 'var(--zander-red)', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
                </div>
                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {headwinds.filter(h => h.status !== 'CLOSED' && h.status !== 'DEPLOYED').slice(0, 5).map(h => (
                    <div key={h.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ background: getPriorityColor(h.priority), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>{h.priority}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{h.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{h.status} • {formatTimeAgo(h.updatedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Tickets */}
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>🎫 Recent Tickets</h3>
                  <button onClick={() => setActiveTab('tickets')} style={{ background: 'none', border: 'none', color: 'var(--zander-red)', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
                </div>
                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {tickets.slice(0, 5).map(t => (
                    <div key={t.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{t.status === 'AI_RESOLVED' ? '🤖' : t.status === 'NEW' ? '🆕' : '👤'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{t.subject}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{t.userName} • {t.tenantName} • {formatTimeAgo(t.createdAt)}</div>
                      </div>
                      <span style={{ background: getStatusColor(t.status), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>{t.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'headwinds' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['all', 'P1', 'P2', 'P3'] as const).map(f => (
                    <button key={f} onClick={() => setHeadwindFilter(f)} style={{
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      background: headwindFilter === f ? (f === 'all' ? 'var(--zander-navy)' : getPriorityColor(f)) : '#f5f5f5',
                      color: headwindFilter === f ? 'white' : '#666'
                    }}>
                      {f === 'all' ? 'All' : f}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setEditingHeadwind(null); setShowHeadwindModal(true); }} style={{
                  background: 'var(--zander-gold)',
                  color: 'var(--zander-navy)',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  + New Headwind
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Priority</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Title</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Category</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Updated</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHeadwinds.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: getPriorityColor(h.priority), color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>{h.priority}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{h.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{h.description}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>{h.category.replace('_', ' ')}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: getStatusColor(h.status), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{h.status.replace('_', ' ')}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>{formatTimeAgo(h.updatedAt)}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button onClick={() => { setEditingHeadwind(h); setShowHeadwindModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tenants' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee' }}>
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #eee',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Tenant</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Users</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Plan</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Last Active</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--zander-navy)' }}>{t.name}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>{t.userCount}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: t.plan === 'Enterprise' ? 'var(--zander-gold)' : t.plan === 'Pro' ? 'var(--zander-navy)' : '#6c757d', color: t.plan === 'Enterprise' ? 'var(--zander-navy)' : 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{t.plan}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>{t.lastActive}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: getStatusColor(t.status), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{t.status}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button style={{ background: 'var(--zander-navy)', color: 'white', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem', fontSize: '0.8rem' }}>View As</button>
                        <button style={{ background: '#f5f5f5', color: '#666', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Ticket</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Subject</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>User</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Via</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Created</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--zander-navy)' }}>{t.ticketNumber}</td>
                      <td style={{ padding: '1rem' }}>{t.subject}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{t.userName}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{t.tenantName}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>{t.createdVia}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: getStatusColor(t.status), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{t.status.replace('_', ' ')}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>{formatTimeAgo(t.createdAt)}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button style={{ background: 'var(--zander-navy)', color: 'white', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Open</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Zander AI Bottom Panel */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '240px',
          right: 0,
          height: zanderHeight,
          background: 'white',
          borderTop: '2px solid var(--zander-navy)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          transition: 'height 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100
        }}>
          {/* Zander Header Bar */}
          <div 
            style={{
              background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setZanderOpen(!zanderOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--zander-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🤖</div>
              <div>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>Zander</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>Your Operations AI</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {zanderOpen && (
                <button
                  onClick={(e) => { e.stopPropagation(); setZanderExpanded(!zanderExpanded); }}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  {zanderExpanded ? '▼ Collapse' : '▲ Expand'}
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setZanderOpen(!zanderOpen); }}
                style={{
                  background: zanderOpen ? 'var(--zander-gold)' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: zanderOpen ? 'var(--zander-navy)' : 'white',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                {zanderOpen ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Zander Content */}
          {zanderOpen && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {zanderMessages.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      background: msg.role === 'zander' ? '#f8f9fa' : 'var(--zander-navy)',
                      color: msg.role === 'zander' ? 'var(--zander-navy)' : 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      maxWidth: '80%',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9rem',
                      lineHeight: '1.4'
                    }}>
                      {msg.content}
                    </div>
                    {msg.actions && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {msg.actions.map((action, actionIdx) => (
                          <button
                            key={actionIdx}
                            onClick={() => handleZanderAction(action.action)}
                            style={{
                              background: action.action === 'dismiss' ? '#f5f5f5' : 'var(--zander-gold)',
                              color: action.action === 'dismiss' ? '#666' : 'var(--zander-navy)',
                              border: 'none',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.8rem'
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={zanderInput}
                  onChange={(e) => setZanderInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleZanderSend()}
                  placeholder="Ask Zander anything..."
                  style={{
                    flex: 1,
                    padding: '0.6rem 1rem',
                    border: '2px solid #eee',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  onClick={handleZanderSend}
                  style={{
                    background: 'var(--zander-navy)',
                    color: 'white',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  Send
                </button>
                <span style={{ fontSize: '0.75rem', color: '#999', marginLeft: '0.5rem' }}>Powered by Claude</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Headwind Modal */}
      {showHeadwindModal && (
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
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem', color: 'var(--zander-navy)' }}>
              {editingHeadwind ? 'Edit Headwind' : 'New Headwind'}
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Title</label>
              <input type="text" defaultValue={editingHeadwind?.title || ''} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
              <textarea defaultValue={editingHeadwind?.description || ''} rows={3} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Priority</label>
                <select defaultValue={editingHeadwind?.priority || 'P2'} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px' }}>
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - Important</option>
                  <option value="P3">P3 - Nice to Have</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Category</label>
                <select defaultValue={editingHeadwind?.category || 'BUG'} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px' }}>
                  <option value="BUG">Bug</option>
                  <option value="REBUILD">Rebuild</option>
                  <option value="NEW_BUILD">New Build</option>
                  <option value="ENHANCEMENT">Enhancement</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Status</label>
              <select defaultValue={editingHeadwind?.status || 'OPEN'} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px' }}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="TESTING">Testing</option>
                <option value="DEPLOYED">Deployed</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowHeadwindModal(false)} style={{ background: '#f5f5f5', color: '#666', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={() => setShowHeadwindModal(false)} style={{ background: 'var(--zander-navy)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
