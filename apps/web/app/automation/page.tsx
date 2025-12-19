'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';

interface Template {
  id: string;
  name: string;
  subject?: string;
  body?: string;
  type: 'email' | 'sms' | 'call';
  category?: string;
  stage?: string;
  status: 'active' | 'draft';
  createdAt: string;
}

interface Sequence {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  steps: any[];
  _count?: { enrollments: number };
  createdAt: string;
}

interface ScheduledComm {
  id: string;
  contact: { firstName: string; lastName: string; email: string };
  type: 'email' | 'sms' | 'call';
  subject?: string;
  scheduledFor: string;
  status: 'pending' | 'approved' | 'sent' | 'cancelled';
  needsApproval: boolean;
}

// Starter template packs
const starterTemplatePacks = {
  sales: {
    name: 'Sales Outreach Pack',
    description: 'Essential templates for sales follow-up and nurturing',
    templates: [
      { name: 'New Lead Welcome', subject: 'Thanks for reaching out!', type: 'email', category: 'Welcome', stage: 'PROSPECT', status: 'active', body: 'Hi {{firstName}},\n\nThank you for your interest in our services. I wanted to personally reach out and introduce myself.\n\nI\'d love to learn more about your project and how we can help. Would you have 15 minutes this week for a quick call?\n\nBest regards' },
      { name: 'Week 1 Follow-Up', subject: 'Checking in on your project', type: 'email', category: 'Follow-up', stage: 'PROSPECT', status: 'active', body: 'Hi {{firstName}},\n\nI wanted to follow up on my previous message. I understand you\'re busy, but I\'d still love the opportunity to discuss your project.\n\nIs there a better time to connect?\n\nBest regards' },
      { name: 'Week 2 Follow-Up', subject: 'Quick update request', type: 'email', category: 'Follow-up', stage: 'PROSPECT', status: 'active', body: 'Hi {{firstName}},\n\nI hope this finds you well. I\'m reaching out one more time to see if you\'re still interested in discussing your project.\n\nIf now isn\'t the right time, just let me know and I\'ll follow up in a few months.\n\nBest regards' },
      { name: 'Proposal Sent', subject: 'Your proposal is ready', type: 'email', category: 'Proposal', stage: 'PROPOSAL', status: 'active', body: 'Hi {{firstName}},\n\nGreat news! I\'ve attached your customized proposal for review.\n\nPlease take a look and let me know if you have any questions. I\'m happy to walk through it with you at your convenience.\n\nBest regards' },
      { name: 'Quote Follow-Up', subject: 'Questions about your quote?', type: 'email', category: 'Follow-up', stage: 'PROPOSAL', status: 'active', body: 'Hi {{firstName}},\n\nI wanted to check in and see if you had a chance to review the proposal I sent over.\n\nDo you have any questions I can help answer?\n\nBest regards' },
      { name: 'Thank You - Closed Won', subject: 'Welcome aboard!', type: 'email', category: 'Closing', stage: 'CLOSED_WON', status: 'active', body: 'Hi {{firstName}},\n\nThank you so much for choosing us! We\'re thrilled to work with you on this project.\n\nOur team will be in touch shortly to kick things off. In the meantime, please don\'t hesitate to reach out with any questions.\n\nWelcome aboard!' },
      { name: 'Re-engagement', subject: 'We\'d love to reconnect', type: 'email', category: 'Re-engagement', stage: 'CLOSED_LOST', status: 'active', body: 'Hi {{firstName}},\n\nIt\'s been a while since we last connected. I wanted to reach out and see how things are going.\n\nIf your situation has changed or you\'re considering new projects, I\'d love to chat.\n\nBest regards' },
    ]
  },
  appointments: {
    name: 'Appointment Pack',
    description: 'SMS and call templates for scheduling',
    templates: [
      { name: 'Quick Check-In SMS', type: 'sms', category: 'Follow-up', stage: 'PROSPECT', status: 'active', body: 'Hi {{firstName}}, just checking in on your project. Any questions I can help with? - {{senderName}}' },
      { name: 'Appointment Reminder SMS', type: 'sms', category: 'Reminder', status: 'active', body: 'Hi {{firstName}}, reminder: your appointment is tomorrow at {{appointmentTime}}. Reply to confirm or reschedule.' },
      { name: 'Discovery Call Script', type: 'call', category: 'Sales Call', stage: 'PROSPECT', status: 'active', body: '1. Introduction & rapport building\n2. Understand their current situation\n3. Identify pain points and goals\n4. Present how we can help\n5. Discuss timeline and budget\n6. Set next steps' },
      { name: 'Follow-Up Call Script', type: 'call', category: 'Follow-up', stage: 'QUALIFIED', status: 'active', body: '1. Reference previous conversation\n2. Address any concerns raised\n3. Provide additional information\n4. Ask qualifying questions\n5. Move toward proposal/next step' },
      { name: 'Closing Call Script', type: 'call', category: 'Closing', stage: 'NEGOTIATION', status: 'active', body: '1. Review proposal highlights\n2. Address final objections\n3. Discuss terms and timeline\n4. Ask for the business\n5. Outline next steps after signing' },
    ]
  }
};

export default function AutomationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'templates' | 'sequences' | 'communications'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [communications, setCommunications] = useState<ScheduledComm[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateFilter, setTemplateFilter] = useState<'all' | 'email' | 'sms' | 'call'>('all');
  const [commFilter, setCommFilter] = useState<'all' | 'pending' | 'approved' | 'sent'>('all');
  
  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [showStarterPackModal, setShowStarterPackModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  
  // Form states
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', body: '', type: 'email', category: '', stage: '', status: 'draft' });
  const [sequenceForm, setSequenceForm] = useState({ name: '', description: '', status: 'draft' });
  const [saving, setSaving] = useState(false);
  const [activatingPack, setActivatingPack] = useState<string | null>(null);

  const API_URL = 'https://api.zander.mcfapp.com';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('zander_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesRes, sequencesRes, commsRes] = await Promise.all([
        fetch(`${API_URL}/templates`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/sequences`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/scheduled-communications`, { headers: getAuthHeaders() }),
      ]);
      
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (sequencesRes.ok) setSequences(await sequencesRes.json());
      if (commsRes.ok) setCommunications(await commsRes.json());
    } catch (err) {
      console.error('Failed to fetch automation data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Template CRUD
  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      const url = editingTemplate 
        ? `${API_URL}/templates/${editingTemplate.id}`
        : `${API_URL}/templates`;
      const method = editingTemplate ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(templateForm)
      });
      
      if (response.ok) {
        await fetchData();
        setShowTemplateModal(false);
        setEditingTemplate(null);
        setTemplateForm({ name: '', subject: '', body: '', type: 'email', category: '', stage: '', status: 'draft' });
      }
    } catch (err) {
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await fetch(`${API_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete template');
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject || '',
      body: template.body || '',
      type: template.type,
      category: template.category || '',
      stage: template.stage || '',
      status: template.status
    });
    setShowTemplateModal(true);
  };

  // Sequence CRUD
  const handleSaveSequence = async () => {
    setSaving(true);
    try {
      const url = editingSequence
        ? `${API_URL}/sequences/${editingSequence.id}`
        : `${API_URL}/sequences`;
      const method = editingSequence ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(sequenceForm)
      });
      
      if (response.ok) {
        await fetchData();
        setShowSequenceModal(false);
        setEditingSequence(null);
        setSequenceForm({ name: '', description: '', status: 'draft' });
      }
    } catch (err) {
      alert('Failed to save sequence');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSequence = async (id: string) => {
    if (!confirm('Delete this sequence?')) return;
    try {
      await fetch(`${API_URL}/sequences/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setSequences(sequences.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete sequence');
    }
  };

  // Starter Pack Activation
  const handleActivatePack = async (packKey: string) => {
    const pack = starterTemplatePacks[packKey as keyof typeof starterTemplatePacks];
    if (!pack) return;
    
    const existingNames = templates.map(t => t.name.toLowerCase());
    const newTemplates = pack.templates.filter(t => !existingNames.includes(t.name.toLowerCase()));
    
    if (newTemplates.length === 0) {
      alert(`All templates from ${pack.name} are already in your library!`);
      return;
    }
    
    if (!confirm(`Add ${newTemplates.length} templates from ${pack.name}?`)) return;
    
    setActivatingPack(packKey);
    try {
      for (const template of newTemplates) {
        await fetch(`${API_URL}/templates`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(template)
        });
      }
      await fetchData();
      alert(`Successfully added ${newTemplates.length} templates!`);
      setShowStarterPackModal(false);
    } catch (err) {
      alert('Failed to activate pack');
    } finally {
      setActivatingPack(null);
    }
  };

  // Communication actions
  const handleApproveCommunication = async (id: string) => {
    try {
      await fetch(`${API_URL}/scheduled-communications/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      setCommunications(communications.map(c => c.id === id ? { ...c, status: 'approved' } : c));
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleCancelCommunication = async (id: string) => {
    try {
      await fetch(`${API_URL}/scheduled-communications/${id}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      setCommunications(communications.map(c => c.id === id ? { ...c, status: 'cancelled' } : c));
    } catch (err) {
      alert('Failed to cancel');
    }
  };

  const filteredTemplates = templateFilter === 'all' 
    ? templates 
    : templates.filter(t => t.type === templateFilter);

  const filteredComms = commFilter === 'all'
    ? communications
    : communications.filter(c => c.status === commFilter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '✉️';
      case 'sms': return '💬';
      case 'call': return '📞';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498DB' };
      case 'sms': return { bg: 'rgba(39, 174, 96, 0.1)', color: '#27AE60' };
      case 'call': return { bg: 'rgba(155, 89, 182, 0.1)', color: '#9B59B6' };
      default: return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <AuthGuard>
    <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
      <NavBar activeModule="cro" />

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: '64px',
        bottom: 0,
        width: '240px',
        background: 'white',
        borderRight: '2px solid var(--zander-border-gray)',
        padding: '1.5rem 0',
        overflow: 'hidden',
        zIndex: 900
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--zander-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Sales & Revenue
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { icon: '📊', label: 'Dashboard', href: '/' },
              { icon: '📈', label: 'Pipeline', href: '/pipeline' },
              { icon: '👥', label: 'Contacts', href: '/contacts' },
              { icon: '📉', label: 'Analytics', href: '/analytics' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                  borderRadius: '8px', textDecoration: 'none', color: 'var(--zander-navy)', background: 'transparent'
                }}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ padding: '0 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--zander-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Tools
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { icon: '📧', label: 'Email Automation', href: '/automation', active: true },
              { icon: '📋', label: 'Forms', href: '/forms' },
              { icon: '🤖', label: 'AI Assistant', href: '/ai' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                  borderRadius: '8px', textDecoration: 'none',
                  color: item.active ? 'var(--zander-red)' : 'var(--zander-navy)',
                  background: item.active ? 'rgba(191, 10, 48, 0.1)' : 'transparent',
                  fontWeight: item.active ? '600' : '400'
                }}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '240px', marginTop: '64px', padding: '2rem' }}>
        {/* Page Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
          borderRadius: '12px',
          padding: '2rem',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                Email Automation
              </h1>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Manage templates, sequences, and scheduled communications
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowStarterPackModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  color: 'var(--zander-red)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                📦 Starter Packs
              </button>
              <button
                onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', subject: '', body: '', type: 'email', category: '', stage: '', status: 'draft' }); setShowTemplateModal(true); }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--zander-gold)',
                  color: 'var(--zander-navy)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                + New Template
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          background: 'white',
          border: '2px solid var(--zander-border-gray)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-red)' }}>{loading ? '...' : templates.length}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Templates</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#27AE60' }}>{loading ? '...' : sequences.length}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Sequences</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{loading ? '...' : sequences.reduce((sum, s) => sum + (s._count?.enrollments || 0), 0)}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Active Enrollments</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-gold)' }}>{loading ? '...' : communications.filter(c => c.status === 'pending').length}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Pending Approval</div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '2px solid var(--zander-border-gray)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', borderBottom: '2px solid var(--zander-border-gray)' }}>
            {[
              { id: 'templates', label: 'Templates', icon: '📝' },
              { id: 'sequences', label: 'Sequences', icon: '🔄' },
              { id: 'communications', label: 'Scheduled', icon: '📅' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1, padding: '1rem',
                  background: activeTab === tab.id ? 'var(--zander-off-white)' : 'white',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid var(--zander-red)' : '3px solid transparent',
                  cursor: 'pointer', fontWeight: '600',
                  color: activeTab === tab.id ? 'var(--zander-red)' : 'var(--zander-gray)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* TEMPLATES TAB */}
            {activeTab === 'templates' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'email', 'sms', 'call'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTemplateFilter(filter)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: templateFilter === filter ? 'var(--zander-navy)' : 'white',
                          color: templateFilter === filter ? 'white' : 'var(--zander-navy)',
                          border: '1px solid var(--zander-border-gray)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}
                      >
                        {filter === 'all' ? 'All Types' : filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>Loading...</div>
                ) : filteredTemplates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>No Templates Yet</h3>
                    <p style={{ color: 'var(--zander-gray)', marginBottom: '1rem' }}>Get started with a Starter Pack or create your own</p>
                    <button onClick={() => setShowStarterPackModal(true)} style={{ padding: '0.75rem 1.5rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                      Browse Starter Packs
                    </button>
                  </div>
                ) : (
                  <div>
                    {filteredTemplates.map((template, index) => (
                      <div
                        key={template.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '1rem', background: index % 2 === 0 ? 'white' : 'var(--zander-off-white)',
                          border: '1px solid var(--zander-border-gray)',
                          borderRadius: index === 0 ? '8px 8px 0 0' : index === filteredTemplates.length - 1 ? '0 0 8px 8px' : '0',
                          borderBottom: index < filteredTemplates.length - 1 ? 'none' : '1px solid var(--zander-border-gray)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            ...getTypeColor(template.type),
                            padding: '0.5rem',
                            borderRadius: '8px',
                            fontSize: '1.25rem'
                          }}>{getTypeIcon(template.type)}</span>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{template.name}</div>
                            {template.subject && <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{template.subject}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {template.category && <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', background: 'var(--zander-off-white)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{template.category}</span>}
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: template.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                            color: template.status === 'active' ? '#27AE60' : 'var(--zander-gray)',
                            borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase'
                          }}>{template.status}</span>
                          <button onClick={() => handleEditTemplate(template)} style={{ padding: '0.5rem 1rem', background: 'var(--zander-gold)', color: 'var(--zander-navy)', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteTemplate(template.id)} style={{ padding: '0.5rem 0.75rem', background: 'transparent', color: 'var(--zander-red)', border: '1px solid var(--zander-red)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SEQUENCES TAB */}
            {activeTab === 'sequences' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button
                    onClick={() => { setEditingSequence(null); setSequenceForm({ name: '', description: '', status: 'draft' }); setShowSequenceModal(true); }}
                    style={{ padding: '0.75rem 1.5rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    + New Sequence
                  </button>
                </div>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>Loading...</div>
                ) : sequences.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>No Sequences Yet</h3>
                    <p style={{ color: 'var(--zander-gray)' }}>Create automated follow-up sequences for your contacts</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {sequences.map((sequence) => (
                      <div key={sequence.id} style={{ background: 'white', border: '2px solid var(--zander-border-gray)', borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                          <h4 style={{ margin: 0, color: 'var(--zander-navy)' }}>{sequence.name}</h4>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: sequence.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : sequence.status === 'paused' ? 'rgba(240, 179, 35, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                            color: sequence.status === 'active' ? '#27AE60' : sequence.status === 'paused' ? '#B8860B' : 'var(--zander-gray)',
                            borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase'
                          }}>{sequence.status}</span>
                        </div>
                        {sequence.description && <p style={{ color: 'var(--zander-gray)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{sequence.description}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--zander-border-gray)' }}>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{sequence.steps?.length || 0} steps</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{sequence._count?.enrollments || 0} enrolled</span>
                          </div>
                          <button onClick={() => handleDeleteSequence(sequence.id)} style={{ padding: '0.5rem 0.75rem', background: 'transparent', color: 'var(--zander-red)', border: '1px solid var(--zander-red)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COMMUNICATIONS TAB */}
            {activeTab === 'communications' && (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {(['all', 'pending', 'approved', 'sent'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setCommFilter(filter)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: commFilter === filter ? 'var(--zander-navy)' : 'white',
                        color: commFilter === filter ? 'white' : 'var(--zander-navy)',
                        border: '1px solid var(--zander-border-gray)',
                        borderRadius: '6px', cursor: 'pointer', fontWeight: '500', textTransform: 'capitalize'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>Loading...</div>
                ) : filteredComms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>No Scheduled Communications</h3>
                    <p style={{ color: 'var(--zander-gray)' }}>Scheduled emails and messages will appear here</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--zander-navy)', color: 'white' }}>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Contact</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Subject</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Scheduled</th>
                        <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComms.map((comm, index) => (
                        <tr key={comm.id} style={{ background: index % 2 === 0 ? 'white' : 'var(--zander-off-white)', borderBottom: '1px solid var(--zander-border-gray)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '500', color: 'var(--zander-navy)' }}>{comm.contact?.firstName} {comm.contact?.lastName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{comm.contact?.email}</div>
                          </td>
                          <td style={{ padding: '1rem' }}><span style={{ ...getTypeColor(comm.type), padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{getTypeIcon(comm.type)} {comm.type}</span></td>
                          <td style={{ padding: '1rem', color: 'var(--zander-gray)' }}>{comm.subject || '—'}</td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--zander-gray)' }}>{formatDate(comm.scheduledFor)}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              background: comm.status === 'pending' ? 'rgba(240, 179, 35, 0.1)' : comm.status === 'approved' ? 'rgba(52, 152, 219, 0.1)' : comm.status === 'sent' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                              color: comm.status === 'pending' ? '#B8860B' : comm.status === 'approved' ? '#3498DB' : comm.status === 'sent' ? '#27AE60' : 'var(--zander-gray)',
                              borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase'
                            }}>{comm.status}</span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {comm.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button onClick={() => handleApproveCommunication(comm.id)} style={{ padding: '0.5rem 0.75rem', background: '#27AE60', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>✓</button>
                                <button onClick={() => handleCancelCommunication(comm.id)} style={{ padding: '0.5rem 0.75rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>✕</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Template Modal */}
      {showTemplateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)' }}>{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Name *</label>
                <input type="text" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Type</label>
                <select value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="call">Call Script</option>
                </select>
              </div>
            </div>
            
            {templateForm.type === 'email' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Subject</label>
                <input type="text" value={templateForm.subject} onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
            )}
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Body</label>
              <textarea value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} rows={6} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Use {{firstName}}, {{lastName}}, {{company}} for personalization..." />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Category</label>
                <input type="text" value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} placeholder="e.g., Follow-up" style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Pipeline Stage</label>
                <select value={templateForm.stage} onChange={(e) => setTemplateForm({ ...templateForm, stage: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="">Any Stage</option>
                  <option value="PROSPECT">Prospect</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="CLOSED_WON">Closed Won</option>
                  <option value="CLOSED_LOST">Closed Lost</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Status</label>
                <select value={templateForm.status} onChange={(e) => setTemplateForm({ ...templateForm, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: 'var(--zander-gray)' }}>Cancel</button>
              <button onClick={handleSaveTemplate} disabled={saving || !templateForm.name} style={{ padding: '0.75rem 1.5rem', background: saving || !templateForm.name ? 'var(--zander-gray)' : 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: saving || !templateForm.name ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Template'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Sequence Modal */}
      {showSequenceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)' }}>{editingSequence ? 'Edit Sequence' : 'New Sequence'}</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Name *</label>
              <input type="text" value={sequenceForm.name} onChange={(e) => setSequenceForm({ ...sequenceForm, name: e.target.value })} placeholder="e.g., New Lead Nurture" style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Description</label>
              <textarea value={sequenceForm.description} onChange={(e) => setSequenceForm({ ...sequenceForm, description: e.target.value })} rows={3} placeholder="Describe what this sequence does..." style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Status</label>
              <select value={sequenceForm.status} onChange={(e) => setSequenceForm({ ...sequenceForm, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', boxSizing: 'border-box' }}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowSequenceModal(false); setEditingSequence(null); }} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: 'var(--zander-gray)' }}>Cancel</button>
              <button onClick={handleSaveSequence} disabled={saving || !sequenceForm.name} style={{ padding: '0.75rem 1.5rem', background: saving || !sequenceForm.name ? 'var(--zander-gray)' : 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: saving || !sequenceForm.name ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Sequence'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Starter Pack Modal */}
      {showStarterPackModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>Template Starter Packs</h2>
            <p style={{ color: 'var(--zander-gray)', marginBottom: '1.5rem' }}>Pre-built template collections to get you started quickly</p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {Object.entries(starterTemplatePacks).map(([key, pack]) => (
                <div key={key} style={{ border: '2px solid var(--zander-border-gray)', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--zander-navy)' }}>{pack.name}</h3>
                      <p style={{ margin: 0, color: 'var(--zander-gray)', fontSize: '0.9rem' }}>{pack.description}</p>
                    </div>
                    <span style={{ background: 'var(--zander-off-white)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--zander-navy)' }}>{pack.templates.length} templates</span>
                  </div>
                  
                  <div style={{ marginBottom: '1rem', maxHeight: '120px', overflow: 'auto' }}>
                    {pack.templates.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', fontSize: '0.85rem', color: 'var(--zander-gray)' }}>
                        <span>{getTypeIcon(t.type)}</span>
                        <span>{t.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleActivatePack(key)}
                    disabled={activatingPack === key}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: activatingPack === key ? 'var(--zander-gray)' : 'var(--zander-red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: activatingPack === key ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {activatingPack === key ? 'Adding Templates...' : 'Activate Pack'}
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setShowStarterPackModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: 'var(--zander-gray)' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
