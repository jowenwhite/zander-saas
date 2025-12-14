'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
import AuthGuard from '../components/AuthGuard';
import { logout } from '../utils/auth';

interface Template {
  id: string;
  name: string;
  subject?: string;
  type: 'email' | 'sms' | 'call';
  category: string;
  stage?: string;
  status: 'active' | 'draft';
}

interface Sequence {
  id: string;
  name: string;
  description: string;
  steps: number;
  enrolled: number;
  status: 'active' | 'paused' | 'draft';
}

interface PendingComm {
  id: string;
  contactName: string;
  contactEmail: string;
  dealName?: string;
  type: 'email' | 'sms' | 'call';
  templateName: string;
  subject?: string;
  scheduledFor: string;
  status: 'pending' | 'approved' | 'sent';
  needsApproval: boolean;
}

// Sample data
const sampleTemplates: Template[] = [
  { id: '1', name: 'New Lead Welcome', subject: 'Thanks for reaching out!', type: 'email', category: 'Welcome', stage: 'PROSPECT', status: 'active' },
  { id: '2', name: 'Week 1 Follow-Up', subject: 'Checking in on your project', type: 'email', category: 'Follow-up', stage: 'PROSPECT', status: 'active' },
  { id: '3', name: 'Week 2 Follow-Up', subject: 'Quick update request', type: 'email', category: 'Follow-up', stage: 'PROSPECT', status: 'active' },
  { id: '4', name: 'Proposal Sent', subject: 'Your proposal is ready', type: 'email', category: 'Proposal', stage: 'PROPOSAL', status: 'active' },
  { id: '5', name: 'Quote Follow-Up', subject: 'Questions about your quote?', type: 'email', category: 'Follow-up', stage: 'PROPOSAL', status: 'active' },
  { id: '6', name: 'Thank You - Closed Won', subject: 'Welcome aboard!', type: 'email', category: 'Closing', stage: 'CLOSED_WON', status: 'active' },
  { id: '7', name: 'Re-engagement', subject: 'We\'d love to reconnect', type: 'email', category: 'Re-engagement', stage: 'CLOSED_LOST', status: 'active' },
  { id: '8', name: 'Quick Check-In SMS', type: 'sms', category: 'Follow-up', stage: 'PROSPECT', status: 'active' },
  { id: '9', name: 'Appointment Reminder SMS', type: 'sms', category: 'Reminder', status: 'active' },
  { id: '10', name: 'Discovery Call Script', type: 'call', category: 'Sales Call', stage: 'PROSPECT', status: 'active' },
  { id: '11', name: 'Follow-Up Call Script', type: 'call', category: 'Follow-up', stage: 'QUALIFIED', status: 'active' },
  { id: '12', name: 'Closing Call Script', type: 'call', category: 'Closing', stage: 'NEGOTIATION', status: 'active' },
];

const sampleSequences: Sequence[] = [
  { id: '1', name: 'New Lead 4-Week Nurture', description: 'Automated follow-up sequence for new prospects', steps: 4, enrolled: 12, status: 'active' },
  { id: '2', name: 'Proposal Follow-Up', description: '3-touch sequence after sending proposal', steps: 3, enrolled: 5, status: 'active' },
  { id: '3', name: 'Re-engagement Campaign', description: 'Win back lost deals after 30 days', steps: 3, enrolled: 8, status: 'paused' },
  { id: '4', name: 'Post-Sale Onboarding', description: 'Welcome sequence for new customers', steps: 5, enrolled: 3, status: 'active' },
];

const samplePending: PendingComm[] = [
  { id: '1', contactName: 'John Doe', contactEmail: 'john@example.com', dealName: 'Kitchen Remodel', type: 'email', templateName: 'Week 1 Follow-Up', subject: 'Checking in on your project', scheduledFor: '2025-01-15T09:00:00', status: 'pending', needsApproval: true },
  { id: '2', contactName: 'Jane Smith', contactEmail: 'jane@example.com', dealName: 'Office Renovation', type: 'sms', templateName: 'Quick Check-In SMS', scheduledFor: '2025-01-15T10:00:00', status: 'pending', needsApproval: false },
  { id: '3', contactName: 'Bob Wilson', contactEmail: 'bob@example.com', type: 'email', templateName: 'New Lead Welcome', subject: 'Thanks for reaching out!', scheduledFor: '2025-01-15T11:00:00', status: 'approved', needsApproval: false },
];

const providerLogos: Record<string, { icon: string; color: string }> = {
  gmail: { icon: '📧', color: '#EA4335' },
  outlook: { icon: '📬', color: '#0078D4' },
  yahoo: { icon: '📩', color: '#6001D2' },
};

export default function AutomationPage() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('cro');
  const [activeTab, setActiveTab] = useState<'templates' | 'sequences' | 'communications'>('templates');
  const [templateFilter, setTemplateFilter] = useState<'all' | 'email' | 'sms' | 'call'>('all');
  const [commFilter, setCommFilter] = useState<'all' | 'pending' | 'scheduled' | 'sent'>('pending');
  const [connectedProvider, setConnectedProvider] = useState<string | null>(null);

  const filteredTemplates = templateFilter === 'all' 
    ? sampleTemplates 
    : sampleTemplates.filter(t => t.type === templateFilter);

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

  return (
    <AuthGuard>
    <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
      {/* Top Navigation */}
      <nav style={{
        background: 'white',
        borderBottom: '2px solid var(--zander-border-gray)',
        padding: '0 1.5rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)', letterSpacing: '-0.5px' }}>ZANDER</span>
        </a>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['CRO', 'CFO', 'COO', 'CMO', 'CPO', 'CIO', 'EA'].map((module) => (
            <button
              key={module}
              onClick={() => setActiveModule(module.toLowerCase())}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: activeModule === module.toLowerCase() ? 'var(--zander-red)' : 'transparent',
                color: activeModule === module.toLowerCase() ? 'white' : 'var(--zander-gray)',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              {module}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/headquarters" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>🏛️ HQ</a>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>JW</div>
          <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>Jonathan White</span>
          <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--zander-gray)' }}>Logout</button>
          <ThemeToggle />
        </div>
      </nav>

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
              { icon: '📊', label: 'Dashboard', href: '/', id: 'dashboard' },
              { icon: '📈', label: 'Pipeline', href: '/pipeline', id: 'pipeline' },
              { icon: '👥', label: 'Contacts', href: '/contacts', id: 'contacts' },
              { icon: '📉', label: 'Analytics', href: '/analytics', id: 'analytics' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--zander-navy)',
                  background: 'transparent',
                  fontWeight: '400'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
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
              { icon: '📧', label: 'Email Automation', href: '/automation', id: 'automation' },
              { icon: '📋', label: 'Forms', href: '/forms', id: 'forms' },
              { icon: '🤖', label: 'AI Assistant', href: '/ai', id: 'ai' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: item.id === 'automation' ? 'var(--zander-red)' : 'var(--zander-navy)',
                  background: item.id === 'automation' ? 'rgba(191, 10, 48, 0.1)' : 'transparent',
                  fontWeight: item.id === 'automation' ? '600' : '400'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '240px', marginTop: '64px', padding: '2rem' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', margin: 0, marginBottom: '0.5rem' }}>
              Email Automation
            </h1>
            <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
              Manage templates, sequences, and communications across Email, SMS, and Calls
            </p>
          </div>
          <button
            onClick={() => alert('Create Template modal coming soon!')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--zander-red)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            + Create Template
          </button>
        </div>

        {/* Provider Connection Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Connect Your Email Provider</h3>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                Sync your inbox to send emails, track replies, and manage communications in one place
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['gmail', 'outlook', 'yahoo'].map((provider) => (
                <button
                  key={provider}
                  onClick={() => {
                    alert(`OAuth integration for ${provider.charAt(0).toUpperCase() + provider.slice(1)} coming soon!\n\nThis will enable:\n• Send emails from Zander\n• Sync incoming emails\n• Track all communications\n• Auto-log to Deals & Contacts`);
                  }}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: connectedProvider === provider ? providerLogos[provider].color : 'rgba(255,255,255,0.1)',
                    border: connectedProvider === provider ? 'none' : '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  {providerLogos[provider].icon}
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(240, 179, 35, 0.2)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>OAuth integration planned for next release. Templates and sequences can be created now.</span>
          </div>
        </div>

        {/* Main Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '2px solid var(--zander-border-gray)',
          overflow: 'hidden'
        }}>
          {/* Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--zander-border-gray)' }}>
            {[
              { id: 'templates', label: 'Templates', icon: '📝' },
              { id: 'sequences', label: 'Sequences', icon: '🔄' },
              { id: 'communications', label: 'Communications', icon: '💬' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: activeTab === tab.id ? 'var(--zander-off-white)' : 'white',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid var(--zander-red)' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: activeTab === tab.id ? 'var(--zander-red)' : 'var(--zander-gray)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '1.5rem' }}>
            {/* TEMPLATES TAB */}
            {activeTab === 'templates' && (
              <>
                {/* Filter Bar */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'all', label: 'All', count: sampleTemplates.length },
                    { id: 'email', label: '✉️ Email', count: sampleTemplates.filter(t => t.type === 'email').length },
                    { id: 'sms', label: '💬 SMS', count: sampleTemplates.filter(t => t.type === 'sms').length },
                    { id: 'call', label: '📞 Call Scripts', count: sampleTemplates.filter(t => t.type === 'call').length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTemplateFilter(filter.id as any)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: templateFilter === filter.id ? 'var(--zander-red)' : 'white',
                        color: templateFilter === filter.id ? 'white' : 'var(--zander-navy)',
                        border: '2px solid var(--zander-border-gray)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.8rem'
                      }}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                {/* Templates Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {filteredTemplates.map((template) => {
                    const typeStyle = getTypeColor(template.type);
                    return (
                      <div
                        key={template.id}
                        style={{
                          background: 'var(--zander-off-white)',
                          border: '2px solid var(--zander-border-gray)',
                          borderRadius: '8px',
                          padding: '1rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => alert(`Edit template: ${template.name}\n\nTemplate editor coming soon!`)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: typeStyle.bg,
                            color: typeStyle.color,
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {getTypeIcon(template.type)} {template.type}
                          </span>
                          {template.stage && (
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(108, 117, 125, 0.1)',
                              color: 'var(--zander-gray)',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              fontWeight: '600'
                            }}>
                              {template.stage.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--zander-navy)', fontSize: '1rem' }}>
                          {template.name}
                        </h4>
                        {template.subject && (
                          <p style={{ margin: 0, color: 'var(--zander-gray)', fontSize: '0.8rem' }}>
                            {template.subject}
                          </p>
                        )}
                        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{template.category}</span>
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            background: template.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                            color: template.status === 'active' ? '#27AE60' : 'var(--zander-gray)',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: '600'
                          }}>
                            {template.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* SEQUENCES TAB */}
            {activeTab === 'sequences' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Follow-Up Sequences</h3>
                  <button
                    onClick={() => alert('Create Sequence wizard coming soon!')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--zander-navy)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    + New Sequence
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sampleSequences.map((sequence) => (
                    <div
                      key={sequence.id}
                      style={{
                        background: 'var(--zander-off-white)',
                        border: '2px solid var(--zander-border-gray)',
                        borderRadius: '8px',
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => alert(`Edit sequence: ${sequence.name}\n\nSequence builder coming soon!`)}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--zander-navy)' }}>{sequence.name}</h4>
                        <p style={{ margin: 0, color: 'var(--zander-gray)', fontSize: '0.875rem' }}>{sequence.description}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{sequence.steps}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)' }}>Steps</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-red)' }}>{sequence.enrolled}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)' }}>Enrolled</div>
                        </div>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: sequence.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : sequence.status === 'paused' ? 'rgba(240, 179, 35, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                          color: sequence.status === 'active' ? '#27AE60' : sequence.status === 'paused' ? '#B8860B' : 'var(--zander-gray)',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {sequence.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* COMMUNICATIONS TAB */}
            {activeTab === 'communications' && (
              <>
                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {['all', 'pending', 'scheduled', 'sent'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setCommFilter(filter as any)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: commFilter === filter ? 'var(--zander-red)' : 'transparent',
                        color: commFilter === filter ? 'white' : 'var(--zander-navy)',
                        border: commFilter === filter ? 'none' : '1px solid var(--zander-border-gray)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Communications List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {samplePending.map((comm) => {
                    const typeStyle = getTypeColor(comm.type);
                    return (
                      <div
                        key={comm.id}
                        style={{
                          background: 'white',
                          border: '2px solid var(--zander-border-gray)',
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'var(--zander-navy)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '1rem'
                        }}>
                          {comm.contactName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{comm.contactName}</span>
                            <span style={{ color: 'var(--zander-gray)', fontSize: '0.8rem' }}>{comm.contactEmail}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              background: typeStyle.bg,
                              color: typeStyle.color,
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              fontWeight: '600'
                            }}>
                              {getTypeIcon(comm.type)} {comm.type.toUpperCase()}
                            </span>
                            <span style={{ color: 'var(--zander-navy)', fontSize: '0.875rem' }}>{comm.templateName}</span>
                            {comm.dealName && (
                              <span style={{ color: 'var(--zander-gray)', fontSize: '0.8rem' }}>• {comm.dealName}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/headquarters" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>🏛️ HQ</a>
                          {comm.needsApproval && (
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(240, 179, 35, 0.1)',
                              color: '#B8860B',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: '600'
                            }}>
                              ⚠️ Needs Approval
                            </span>
                          )}
                          <button
                            onClick={() => alert('Review communication modal coming soon!')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'var(--zander-red)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.75rem'
                            }}
                          >
                            Review
                          </button>
                          <button
                            onClick={() => alert('Communication skipped')}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'white',
                              color: 'var(--zander-gray)',
                              border: '1px solid var(--zander-border-gray)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.75rem'
                            }}
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          {[
            { value: sampleTemplates.length, label: 'Total Templates', color: 'var(--zander-navy)' },
            { value: sampleSequences.filter(s => s.status === 'active').length, label: 'Active Sequences', color: '#27AE60' },
            { value: sampleSequences.reduce((sum, s) => sum + s.enrolled, 0), label: 'Contacts in Sequences', color: 'var(--zander-red)' },
            { value: samplePending.filter(p => p.needsApproval).length, label: 'Need Approval', color: '#B8860B' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
