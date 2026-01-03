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
  description?: string;
  priority: 'P1' | 'P2' | 'P3';
  category: 'BUG' | 'REBUILD' | 'NEW_BUILD' | 'ENHANCEMENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'TESTING' | 'DEPLOYED' | 'CLOSED';
  tenantId?: string;
  tenant?: { id: string; companyName: string };
  createdBy?: { id: string; firstName: string; lastName: string; email: string };
  assignedTo?: { id: string; firstName: string; lastName: string; email: string };
  gitCommit?: string;
  gitBranch?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface Tenant {
  id: string;
  companyName: string;
  subdomain: string;
  tenantType: string;
  subscriptionStatus?: string;
  subscriptionTier?: string;
  users?: { id: string }[];
  _count?: { users: number };
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  tenantId: string;
  tenant?: { id: string; companyName: string };
  status: 'NEW' | 'AI_RESOLVED' | 'PENDING_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'P1' | 'P2' | 'P3';
  category: 'PLATFORM' | 'BILLING' | 'BUG' | 'FEATURE_REQUEST' | 'HOW_TO' | 'OTHER';
  createdVia: string;
  aiSummary?: string;
  aiResponse?: string;
  linkedHeadwindId?: string;
  linkedHeadwind?: { id: string; title: string; status: string; priority: string };
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}


interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  category: 'PLATFORM_GUIDE' | 'FAQ' | 'TROUBLESHOOTING' | 'RELEASE_NOTES' | 'API_DOCS';
  tags: string[];
  searchTerms?: string;
  isPublished: boolean;
  sortOrder: number;
  viewCount: number;
  createdBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

interface ZanderAction {
  label: string;
  action: string;
  ticketId?: string;
  headwindId?: string;
  ticketNumber?: string;
}

interface ZanderMessage {
  role: 'zander' | 'user';
  content: string;
  timestamp: string;
  actions?: ZanderAction[];
}

// Mock Data
const MOCK_HEALTH: SystemHealth = {
  api: 'healthy',
  database: 'healthy',
  email: 'healthy',
  lastChecked: new Date().toISOString()
};




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
  const [activeTab, setActiveTab] = useState<'overview' | 'headwinds' | 'tenants' | 'tickets' | 'knowledge'>('overview');
  
  // Data state
  const [health, setHealth] = useState<SystemHealth>(MOCK_HEALTH);
  const [headwinds, setHeadwinds] = useState<Headwind[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [articleForm, setArticleForm] = useState({ title: '', slug: '', content: '', summary: '', category: 'PLATFORM_GUIDE', tags: '', searchTerms: '', isPublished: true });
  
  // Zander AI state
  const [zanderOpen, setZanderOpen] = useState(true);
  const [zanderExpanded, setZanderExpanded] = useState(false);
  const [zanderMessages, setZanderMessages] = useState<ZanderMessage[]>([INITIAL_ZANDER_MESSAGE]);
  const [zanderInput, setZanderInput] = useState('');
  const [zanderLoading, setZanderLoading] = useState(false);
  
  // Search/Filter state
  const [tenantSearch, setTenantSearch] = useState('');
  const [headwindFilter, setHeadwindFilter] = useState<'all' | 'P1' | 'P2' | 'P3'>('all');
  
  // Modal state
  const [showHeadwindModal, setShowHeadwindModal] = useState(false);
  const [editingHeadwind, setEditingHeadwind] = useState<Headwind | null>(null);
  const [headwindForm, setHeadwindForm] = useState({ title: '', description: '', priority: 'P2', category: 'BUG', status: 'OPEN', gitBranch: '' });
  const [saving, setSaving] = useState(false);

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
    fetchHeadwinds();
    fetchTenants();
    fetchTickets();
    fetchKnowledge();
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

  const fetchHeadwinds = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${API_URL}/headwinds`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHeadwinds(data);
      }
    } catch (error) {
      console.error('Failed to fetch headwinds:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${API_URL}/tenants/accessible`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  };

  
  const fetchKnowledge = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${API_URL}/knowledge`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setKnowledgeArticles(data);
      }
    } catch (error) {
      console.error('Failed to fetch knowledge articles:', error);
    }
  };

  const saveArticle = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('zander_token');
      const url = editingArticle 
        ? `${API_URL}/knowledge/${editingArticle.id}`
        : `${API_URL}/knowledge`;
      const method = editingArticle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...articleForm,
          tags: articleForm.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        })
      });
      
      if (response.ok) {
        setShowKnowledgeModal(false);
        setEditingArticle(null);
        setArticleForm({ title: '', slug: '', content: '', summary: '', category: 'PLATFORM_GUIDE', tags: '', searchTerms: '', isPublished: true });
        fetchKnowledge();
      }
    } catch (error) {
      console.error('Failed to save article:', error);
    }
    setSaving(false);
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      const token = localStorage.getItem('zander_token');
      await fetch(`${API_URL}/knowledge/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKnowledge();
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${API_URL}/support-tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const saveHeadwind = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('zander_token');
      const url = editingHeadwind 
        ? `${API_URL}/headwinds/${editingHeadwind.id}`
        : `${API_URL}/headwinds`;
      const method = editingHeadwind ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(headwindForm)
      });
      
      if (response.ok) {
        await fetchHeadwinds();
        setShowHeadwindModal(false);
        setEditingHeadwind(null);
        setHeadwindForm({ title: '', description: '', priority: 'P2', category: 'BUG', status: 'OPEN', gitBranch: '' });
      }
    } catch (error) {
      console.error('Failed to save headwind:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteHeadwind = async (id: string) => {
    if (!confirm('Are you sure you want to delete this headwind?')) return;
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${API_URL}/headwinds/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchHeadwinds();
      }
    } catch (error) {
      console.error('Failed to delete headwind:', error);
    }
  };

  const handleZanderSend = async () => {
    if (!zanderInput.trim() || zanderLoading) return;
    
    const userMessage: ZanderMessage = {
      role: 'user',
      content: zanderInput,
      timestamp: new Date().toISOString()
    };
    setZanderMessages(prev => [...prev, userMessage]);
    const currentInput = zanderInput;
    setZanderInput('');
    setZanderLoading(true);
    
    try {
      const token = localStorage.getItem('zander_token');
      // Build conversation history for context
      const conversationHistory = zanderMessages.map(msg => ({
        role: msg.role === 'zander' ? 'assistant' : msg.role,
        content: msg.content
      }));
      
      const response = await fetch(`${API_URL}/ai/zander/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from Zander');
      }
      
      const data = await response.json();
      
      const aiResponse: ZanderMessage = {
        role: 'zander',
        content: data.content,
        timestamp: new Date().toISOString()
      };
      setZanderMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Zander chat error:', error);
      const errorResponse: ZanderMessage = {
        role: 'zander',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      setZanderMessages(prev => [...prev, errorResponse]);
    } finally {
      setZanderLoading(false);
    }
  };

  const handleZanderAction = async (actionData: ZanderAction) => {
    const { action, ticketId, headwindId, ticketNumber } = actionData;
    
    if (action === 'dismiss') {
      const response: ZanderMessage = {
        role: 'zander',
        content: 'Got it. Let me know if you need anything else!',
        timestamp: new Date().toISOString()
      };
      setZanderMessages(prev => [...prev, response]);
      return;
    }
    
    if (action === 'link_headwind' && ticketId && headwindId) {
      try {
        const token = localStorage.getItem('zander_token');
        const response = await fetch(`${API_URL}/support-tickets/${ticketId}/link-headwind/${headwindId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const zanderResponse: ZanderMessage = {
            role: 'zander',
            content: `Done! I've linked ${ticketNumber || 'the ticket'} to the headwind. The ticket will be tracked with this issue.`,
            timestamp: new Date().toISOString()
          };
          setZanderMessages(prev => [...prev, zanderResponse]);
          fetchTickets();
          fetchHeadwinds();
        } else {
          throw new Error('Failed to link');
        }
      } catch (error) {
        const errorResponse: ZanderMessage = {
          role: 'zander',
          content: 'Sorry, I could not link the ticket to the headwind. Please try manually from the Tickets tab.',
          timestamp: new Date().toISOString()
        };
        setZanderMessages(prev => [...prev, errorResponse]);
      }
      return;
    }
    
    if (action === 'view_ticket' && ticketId) {
      try {
        const token = localStorage.getItem('zander_token');
        const response = await fetch(`${API_URL}/support-tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const ticket = await response.json();
          const zanderResponse: ZanderMessage = {
            role: 'zander',
            content: `**${ticket.ticketNumber}: ${ticket.subject}**

**Status:** ${ticket.status}  |  **Priority:** ${ticket.priority}  |  **Via:** ${ticket.createdVia}
**From:** ${ticket.user?.firstName || 'Unknown'} ${ticket.user?.lastName || ''} (${ticket.tenant?.companyName || 'Unknown'})
**Created:** ${new Date(ticket.createdAt).toLocaleString()}

**Description:**
${ticket.description}

${ticket.linkedHeadwind ? '**Linked to:** ' + ticket.linkedHeadwind.title + ' (' + ticket.linkedHeadwind.status + ')' : '**Not linked to any headwind**'}`,
            timestamp: new Date().toISOString(),
            actions: ticket.linkedHeadwind ? undefined : [
              { label: 'Link to a Headwind', action: 'suggest_link', ticketId: ticket.id, ticketNumber: ticket.ticketNumber },
              { label: 'Mark as Resolved', action: 'resolve_ticket', ticketId: ticket.id, ticketNumber: ticket.ticketNumber },
              { label: 'Close', action: 'dismiss' }
            ]
          };
          setZanderMessages(prev => [...prev, zanderResponse]);
        } else {
          throw new Error('Failed to fetch ticket');
        }
      } catch (error) {
        const errorResponse: ZanderMessage = {
          role: 'zander',
          content: 'Sorry, I could not fetch the ticket details. Please check the Tickets tab.',
          timestamp: new Date().toISOString()
        };
        setZanderMessages(prev => [...prev, errorResponse]);
      }
      return;
    }
    
    if (action === 'resolve_ticket' && ticketId) {
      try {
        const token = localStorage.getItem('zander_token');
        const response = await fetch(`${API_URL}/support-tickets/${ticketId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ status: 'RESOLVED' })
        });
        
        if (response.ok) {
          const zanderResponse: ZanderMessage = {
            role: 'zander',
            content: `${ticketNumber || 'Ticket'} has been marked as resolved.`,
            timestamp: new Date().toISOString()
          };
          setZanderMessages(prev => [...prev, zanderResponse]);
          fetchTickets();
        } else {
          throw new Error('Failed to resolve');
        }
      } catch (error) {
        const errorResponse: ZanderMessage = {
          role: 'zander',
          content: 'Sorry, I could not resolve the ticket. Please try from the Tickets tab.',
          timestamp: new Date().toISOString()
        };
        setZanderMessages(prev => [...prev, errorResponse]);
      }
      return;
    }
    
    if (action === 'suggest_link' && ticketId) {
      const activeHeadwinds = headwinds.filter(h => h.status !== 'CLOSED');
      if (activeHeadwinds.length === 0) {
        const zanderResponse: ZanderMessage = {
          role: 'zander',
          content: 'There are no active headwinds to link this ticket to. Create a new headwind from the Headwinds tab if needed.',
          timestamp: new Date().toISOString()
        };
        setZanderMessages(prev => [...prev, zanderResponse]);
        return;
      }
      
      const zanderResponse: ZanderMessage = {
        role: 'zander',
        content: `Which headwind should I link ${ticketNumber} to?`,
        timestamp: new Date().toISOString(),
        actions: [
          ...activeHeadwinds.slice(0, 3).map(h => ({
            label: `[${h.priority}] ${h.title}`,
            action: 'link_headwind',
            ticketId: ticketId,
            headwindId: h.id,
            ticketNumber: ticketNumber
          })),
          { label: 'Cancel', action: 'dismiss' }
        ]
      };
      setZanderMessages(prev => [...prev, zanderResponse]);
      return;
    }
    
    // Default
    const response: ZanderMessage = {
      role: 'zander',
      content: 'Action completed.',
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
    (t.companyName || '').toLowerCase().includes(tenantSearch.toLowerCase())
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
            {(['overview', 'headwinds', 'tenants', 'tickets', 'knowledge'] as const).map(tab => (
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
                {tab === 'overview' && '📊'} {tab === 'headwinds' && '🔴'} {tab === 'tenants' && '🏢'} {tab === 'tickets' && '🎫'} {tab === 'knowledge' && '📚'}
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
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{t.user ? `${t.user.firstName} ${t.user.lastName}` : 'Unknown'} • {t.tenant?.companyName || 'Unknown'} • {formatTimeAgo(t.createdAt)}</div>
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
                <button onClick={() => { setEditingHeadwind(null); setHeadwindForm({ title: '', description: '', priority: 'P2', category: 'BUG', status: 'OPEN', gitBranch: '' }); setShowHeadwindModal(true); }} style={{
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
                        <button onClick={() => { setEditingHeadwind(h); setHeadwindForm({ title: h.title, description: h.description || '', priority: h.priority, category: h.category, status: h.status, gitBranch: h.gitBranch || '' }); setShowHeadwindModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✏️</button>
                        <button onClick={() => deleteHeadwind(h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', marginLeft: '0.5rem' }}>🗑️</button>
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
                      <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--zander-navy)' }}>{t.companyName}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>{t._count?.users || t.users?.length || 0}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: t.subscriptionTier === 'enterprise' ? 'var(--zander-gold)' : t.subscriptionTier === 'pro' ? 'var(--zander-navy)' : '#6c757d', color: t.subscriptionTier === 'enterprise' ? 'var(--zander-navy)' : 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{t.subscriptionTier || 'starter'}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#666' }}>{t.tenantType}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: getStatusColor(t.subscriptionStatus || 'active'), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{t.subscriptionStatus || 'active'}</span>
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

          
          {activeTab === 'knowledge' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>📚 Knowledge Base ({knowledgeArticles.length} articles)</h3>
                <button
                  onClick={() => {
                    setEditingArticle(null);
                    setArticleForm({ title: '', slug: '', content: '', summary: '', category: 'PLATFORM_GUIDE', tags: '', searchTerms: '', isPublished: true });
                    setShowKnowledgeModal(true);
                  }}
                  style={{ background: 'var(--zander-gold)', color: 'var(--zander-navy)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  + New Article
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Title</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Category</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Tags</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Views</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#666' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {knowledgeArticles.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No articles yet</div>
                        <div>Create your first knowledge base article to help AI executives assist users.</div>
                      </td>
                    </tr>
                  ) : knowledgeArticles.map(article => (
                    <tr key={article.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{article.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{article.slug}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: article.category === 'PLATFORM_GUIDE' ? '#e3f2fd' : article.category === 'FAQ' ? '#f3e5f5' : article.category === 'TROUBLESHOOTING' ? '#fff3e0' : '#e8f5e9',
                          color: article.category === 'PLATFORM_GUIDE' ? '#1565c0' : article.category === 'FAQ' ? '#7b1fa2' : article.category === 'TROUBLESHOOTING' ? '#ef6c00' : '#2e7d32',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {article.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {article.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{ background: '#f5f5f5', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.7rem', color: '#666' }}>{tag}</span>
                          ))}
                          {article.tags.length > 3 && <span style={{ fontSize: '0.7rem', color: '#999' }}>+{article.tags.length - 3}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          background: article.isPublished ? '#c8e6c9' : '#ffecb3',
                          color: article.isPublished ? '#2e7d32' : '#f57f17',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {article.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>{article.viewCount}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setEditingArticle(article);
                            setArticleForm({
                              title: article.title,
                              slug: article.slug,
                              content: article.content,
                              summary: article.summary || '',
                              category: article.category,
                              tags: article.tags.join(', '),
                              searchTerms: article.searchTerms || '',
                              isPublished: article.isPublished
                            });
                            setShowKnowledgeModal(true);
                          }}
                          style={{ background: 'var(--zander-navy)', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.5rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          style={{ background: '#f44336', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Delete
                        </button>
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
                        <div style={{ fontWeight: '500' }}>{t.user ? `${t.user.firstName} ${t.user.lastName}` : 'Unknown'}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{t.tenant?.companyName || 'Unknown'}</div>
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

        
        {/* Knowledge Article Modal */}
        {showKnowledgeModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '12px', width: '700px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee' }}>
                <h2 style={{ margin: 0, color: 'var(--zander-navy)' }}>{editingArticle ? 'Edit Article' : 'New Knowledge Article'}</h2>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Title *</label>
                  <input
                    type="text"
                    value={articleForm.title}
                    onChange={(e) => {
                      setArticleForm({ ...articleForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
                    }}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    placeholder="How to add a new pipeline stage"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Slug</label>
                  <input
                    type="text"
                    value={articleForm.slug}
                    onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', color: '#666' }}
                    placeholder="how-to-add-pipeline-stage"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Category</label>
                    <select
                      value={articleForm.category}
                      onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    >
                      <option value="PLATFORM_GUIDE">Platform Guide</option>
                      <option value="FAQ">FAQ</option>
                      <option value="TROUBLESHOOTING">Troubleshooting</option>
                      <option value="RELEASE_NOTES">Release Notes</option>
                      <option value="API_DOCS">API Docs</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Status</label>
                    <select
                      value={articleForm.isPublished ? 'published' : 'draft'}
                      onChange={(e) => setArticleForm({ ...articleForm, isPublished: e.target.value === 'published' })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Summary</label>
                  <input
                    type="text"
                    value={articleForm.summary}
                    onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    placeholder="Brief description for article lists"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Content *</label>
                  <textarea
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', minHeight: '200px', fontFamily: 'inherit' }}
                    placeholder="Full article content. Markdown supported."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={articleForm.tags}
                    onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    placeholder="pipeline, crm, deals, stages"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>AI Search Terms</label>
                  <input
                    type="text"
                    value={articleForm.searchTerms}
                    onChange={(e) => setArticleForm({ ...articleForm, searchTerms: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                    placeholder="Keywords AI executives should match: add stage, create pipeline, new column"
                  />
                </div>
              </div>
              <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  onClick={() => { setShowKnowledgeModal(false); setEditingArticle(null); }}
                  style={{ padding: '0.75rem 1.5rem', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: 'white' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveArticle}
                  disabled={saving || !articleForm.title || !articleForm.content}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: 'var(--zander-gold)',
                    color: 'var(--zander-navy)',
                    fontWeight: '600',
                    opacity: saving || !articleForm.title || !articleForm.content ? 0.5 : 1
                  }}
                >
                  {saving ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                            onClick={() => handleZanderAction(action)}
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
                  disabled={zanderLoading || !zanderInput.trim()}
                  style={{
                    background: zanderLoading ? '#999' : 'var(--zander-navy)',
                    color: 'white',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '6px',
                    cursor: zanderLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    opacity: (!zanderInput.trim() || zanderLoading) ? 0.6 : 1
                  }}
                >
                  {zanderLoading ? '...' : 'Send'}
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
              <input type="text" value={headwindForm.title} onChange={(e) => setHeadwindForm(prev => ({ ...prev, title: e.target.value }))} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
              <textarea value={headwindForm.description} onChange={(e) => setHeadwindForm(prev => ({ ...prev, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Priority</label>
                <select value={headwindForm.priority} onChange={(e) => setHeadwindForm(prev => ({ ...prev, priority: e.target.value }))} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px' }}>
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - Important</option>
                  <option value="P3">P3 - Nice to Have</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Category</label>
                <select value={headwindForm.category} onChange={(e) => setHeadwindForm(prev => ({ ...prev, category: e.target.value }))} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px' }}>
                  <option value="BUG">Bug</option>
                  <option value="REBUILD">Rebuild</option>
                  <option value="NEW_BUILD">New Build</option>
                  <option value="ENHANCEMENT">Enhancement</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Status</label>
              <select value={headwindForm.status} onChange={(e) => setHeadwindForm(prev => ({ ...prev, status: e.target.value }))} style={{ width: '100%', padding: '0.75rem', border: '2px solid #eee', borderRadius: '6px' }}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="TESTING">Testing</option>
                <option value="DEPLOYED">Deployed</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowHeadwindModal(false)} style={{ background: '#f5f5f5', color: '#666', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={saveHeadwind} disabled={saving} style={{ background: 'var(--zander-navy)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
