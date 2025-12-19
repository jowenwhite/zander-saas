'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ThemeToggle';
import NavBar from '../../components/NavBar';
import AuthGuard from '../../components/AuthGuard';
import { logout } from '../../utils/auth';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  source?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Deal {
  id: number;
  name: string;
  value: number;
  stage: string;
  probability: number;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'form';
  description: string;
  date: string;
  dealName?: string;
}

interface FormSubmission {
  id: string;
  formName: string;
  status: 'complete' | 'partial' | 'sent';
  submittedAt?: string;
  sentAt?: string;
}

// Sample activities
const sampleActivities: Activity[] = [
  { id: '1', type: 'email', description: 'Sent follow-up email: "Checking in on your project"', date: '2025-01-14T10:30:00', dealName: 'Kitchen Remodel' },
  { id: '2', type: 'call', description: 'Discovery call - discussed requirements and timeline', date: '2025-01-12T14:00:00', dealName: 'Kitchen Remodel' },
  { id: '3', type: 'form', description: 'Completed Client Onboarding Survey', date: '2025-01-10T09:15:00' },
  { id: '4', type: 'email', description: 'Received inquiry from website contact form', date: '2025-01-08T16:45:00' },
  { id: '5', type: 'note', description: 'Prefers communication via email, busy schedule', date: '2025-01-08T17:00:00' },
];

// Sample form submissions
const sampleForms: FormSubmission[] = [
  { id: '1', formName: 'Discovery Call Script', status: 'complete', submittedAt: '2025-01-12T14:30:00' },
  { id: '2', formName: 'Client Onboarding Survey', status: 'complete', submittedAt: '2025-01-10T09:15:00' },
  { id: '3', formName: 'Project Proposal', status: 'sent', sentAt: '2025-01-14T11:00:00' },
  { id: '4', formName: 'Service Agreement', status: 'partial', sentAt: '2025-01-13T10:00:00' },
];

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('cro');
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'communications' | 'forms'>('overview');
  const [contact, setContact] = useState<Contact | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const token = localStorage.getItem('zander_token');
        const response = await fetch(
          `https://api.zander.mcfapp.com/contacts/${params.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Contact not found');
        const data = await response.json();
        setContact(data);
        setNotes(data.notes || '');
        // Fetch deals for this contact
        const dealsResponse = await fetch(
          `https://api.zander.mcfapp.com/deals`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (dealsResponse.ok) {
          const allDeals = await dealsResponse.json();
          const contactDeals = allDeals.data.filter((d: any) => d.contactId === data.id);
          setDeals(contactDeals);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contact');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchContact();
    }
  }, [params.id]);
  const handleSaveNotes = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      await fetch(
        `https://api.zander.mcfapp.com/contacts/${params.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
        }
      );
      setContact(prev => prev ? { ...prev, notes } : null);
      setIsEditingNotes(false);
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      'PROSPECT': 'Prospect',
      'QUALIFIED': 'Qualified',
      'PROPOSAL': 'Proposal',
      'NEGOTIATION': 'Negotiation',
      'CLOSED_WON': 'Closed Won',
      'CLOSED_LOST': 'Closed Lost'
    };
    return labels[stage] || stage;
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      'PROSPECT': { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D' },
      'QUALIFIED': { bg: 'rgba(0, 123, 255, 0.1)', color: '#007BFF' },
      'PROPOSAL': { bg: 'rgba(255, 193, 7, 0.1)', color: '#B8860B' },
      'NEGOTIATION': { bg: 'rgba(253, 126, 20, 0.1)', color: '#FD7E14' },
      'CLOSED_WON': { bg: 'rgba(40, 167, 69, 0.1)', color: '#28A745' },
      'CLOSED_LOST': { bg: 'rgba(220, 53, 69, 0.1)', color: '#DC3545' }
    };
    return colors[stage] || { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D' };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return '✉️';
      case 'call': return '📞';
      case 'meeting': return '📅';
      case 'note': return '📝';
      case 'form': return '📋';
      default: return '📌';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const totalDealValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'CLOSED_WON');

  if (loading) {
    return (
      <AuthGuard>
        <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--zander-gray)' }}>Loading contact...</p>
        </div>
      </AuthGuard>
    );
  }

  if (error || !contact) {
    return (
      <AuthGuard>
        <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--zander-red)', marginBottom: '1rem' }}>{error || 'Contact not found'}</p>
            <button onClick={() => router.push('/contacts')} style={{ padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Back to Contacts
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        {/* Top Navigation */}
        <NavBar activeModule="cro" />

        {/* Main Content */}
        <main style={{ marginTop: '64px', padding: '2rem', maxWidth: '1200px', margin: '64px auto 0' }}>
          {/* Back Button */}
          <button
            onClick={() => router.push('/contacts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'var(--zander-gray)',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}
          >
            ← Back to Contacts
          </button>

          {/* Contact Header Card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
            borderRadius: '12px',
            padding: '2rem',
            color: 'white',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <button
              onClick={() => router.push('/contacts')}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--zander-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '700'
              }}>
                {getInitials(contact.firstName, contact.lastName)}
              </div>

              <div style={{ flex: 1 }}>
                <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.75rem', fontWeight: '700' }}>
                  {contact.firstName} {contact.lastName}
                </h1>
                {contact.title && contact.company && (
                  <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '1rem' }}>
                    {contact.title} at {contact.company}
                  </p>
                )}
                {!contact.title && contact.company && (
                  <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '1rem' }}>
                    {contact.company}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <a href={`mailto:${contact.email}`} style={{ color: 'white', opacity: 0.9, fontSize: '0.9rem', textDecoration: 'none' }}>
                    ✉️ {contact.email}
                  </a>
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} style={{ color: 'white', opacity: 0.9, fontSize: '0.9rem', textDecoration: 'none' }}>
                      📞 {contact.phone}
                    </a>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{deals.length}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total Deals</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatCurrency(totalDealValue)}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total Value</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4ADE80' }}>{wonDeals.length}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Won</div>
                </div>
              </div>
            </div>

            {contact.tags && contact.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {contact.tags.map((tag, index) => (
                  <span key={index} style={{
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    fontSize: '0.75rem'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{
            background: 'var(--zander-navy)',
            borderRadius: '8px 8px 0 0',
            display: 'flex'
          }}>
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'deals', label: 'Deals', icon: '💼' },
              { id: 'communications', label: 'Communications', icon: '💬' },
              { id: 'forms', label: 'Forms', icon: '📄' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: activeTab === tab.id ? 'white' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid var(--zander-red)' : 'none',
                  borderRadius: activeTab === tab.id ? '8px 8px 0 0' : '0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: activeTab === tab.id ? 'var(--zander-navy)' : 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{
            background: 'white',
            borderRadius: '0 0 8px 8px',
            border: '2px solid var(--zander-border-gray)',
            borderTop: 'none',
            padding: '1.5rem'
          }}>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1rem' }}>Contact Details</h3>
                  <div style={{ background: 'var(--zander-off-white)', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>Email</div>
                      <div style={{ color: 'var(--zander-navy)' }}>{contact.email}</div>
                    </div>
                    {contact.phone && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>Phone</div>
                        <div style={{ color: 'var(--zander-navy)' }}>{contact.phone}</div>
                      </div>
                    )}
                    {contact.company && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>Company</div>
                        <div style={{ color: 'var(--zander-navy)' }}>{contact.company}</div>
                      </div>
                    )}
                    {contact.title && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>Title</div>
                        <div style={{ color: 'var(--zander-navy)' }}>{contact.title}</div>
                      </div>
                    )}
                    {contact.source && (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>Source</div>
                        <div style={{ color: 'var(--zander-navy)' }}>{contact.source}</div>
                      </div>
                    )}
                  </div>

                  <h3 style={{ margin: '1.5rem 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1rem' }}>Quick Actions</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a href={`mailto:${contact.email}`} style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--zander-navy)',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      ✉️ Email
                    </a>
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--zander-navy)',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        📞 Call
                      </a>
                    )}
                    <button
                      onClick={() => alert('Create new deal for this contact - coming soon!')}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--zander-red)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      + New Deal
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1rem' }}>Notes</h3>
                    <button
                      onClick={() => isEditingNotes ? handleSaveNotes() : setIsEditingNotes(true)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: isEditingNotes ? 'var(--zander-red)' : 'transparent',
                        color: isEditingNotes ? 'white' : 'var(--zander-red)',
                        border: isEditingNotes ? 'none' : '1px solid var(--zander-red)',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {isEditingNotes ? 'Save' : 'Edit'}
                    </button>
                  </div>
                  {isEditingNotes ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '1rem',
                        border: '2px solid var(--zander-red)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Add notes about this contact..."
                    />
                  ) : (
                    <div style={{
                      background: 'var(--zander-off-white)',
                      borderRadius: '8px',
                      padding: '1rem',
                      minHeight: '120px',
                      color: notes ? 'var(--zander-navy)' : 'var(--zander-gray)',
                      fontSize: '0.9rem',
                      lineHeight: 1.6
                    }}>
                      {notes || 'No notes yet. Click Edit to add notes.'}
                    </div>
                  )}

                  <h3 style={{ margin: '1.5rem 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1rem' }}>Recent Activity</h3>
                  <div style={{ background: 'var(--zander-off-white)', borderRadius: '8px', padding: '1rem' }}>
                    {sampleActivities.slice(0, 3).map((activity, index) => (
                      <div key={activity.id} style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginBottom: index < 2 ? '0.75rem' : 0,
                        paddingBottom: index < 2 ? '0.75rem' : 0,
                        borderBottom: index < 2 ? '1px solid var(--zander-border-gray)' : 'none'
                      }}>
                        <span style={{ fontSize: '1rem' }}>{getActivityIcon(activity.type)}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--zander-navy)' }}>{activity.description}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>
                            {formatDateTime(activity.date)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setActiveTab('communications')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--zander-red)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        marginTop: '0.75rem'
                      }}
                    >
                      View all activity →
                    </button>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1rem' }}>Timeline</h3>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>Created</div>
                      <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{formatDate(contact.createdAt)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>Last Updated</div>
                      <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{formatDate(contact.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DEALS TAB */}
            {activeTab === 'deals' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Deals ({deals.length})</h3>
                  <button
                    onClick={() => alert('Create new deal for this contact - coming soon!')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--zander-red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    + New Deal
                  </button>
                </div>

                {deals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>
                    <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>No deals yet for this contact</p>
                    <button
                      onClick={() => alert('Create new deal - coming soon!')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--zander-red)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Create First Deal
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {deals.map((deal) => {
                      const stageStyle = getStageColor(deal.stage);
                      return (
                        <div
                          key={deal.id}
                          onClick={() => router.push(`/deals/${deal.id}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.25rem',
                            background: 'var(--zander-off-white)',
                            border: '2px solid var(--zander-border-gray)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{deal.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Created {formatDate(deal.createdAt)}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: '700', color: 'var(--zander-navy)' }}>{formatCurrency(deal.value)}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{deal.probability}% probability</div>
                            </div>
                            <span style={{
                              padding: '0.375rem 0.75rem',
                              background: stageStyle.bg,
                              color: stageStyle.color,
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {getStageLabel(deal.stage)}
                            </span>
                            <span style={{ color: 'var(--zander-gray)' }}>→</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* COMMUNICATIONS TAB */}
            {activeTab === 'communications' && (
              <div>
                <div style={{
                  background: 'var(--zander-navy)',
                  borderRadius: '8px',
                  padding: '1rem 1.5rem',
                  color: 'white',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Communications Timeline</h3>
                  <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>
                    View all interactions with {contact.firstName} {contact.lastName}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sampleActivities.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'var(--zander-off-white)',
                        borderRadius: '8px',
                        border: '1px solid var(--zander-border-gray)'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0
                      }}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                          {activity.description}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                          <span>{formatDateTime(activity.date)}</span>
                          {activity.dealName && <span>• {activity.dealName}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORMS TAB */}
            {activeTab === 'forms' && (
              <div>
                <div style={{
                  background: 'var(--zander-navy)',
                  borderRadius: '8px',
                  padding: '1rem 1.5rem',
                  color: 'white',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Forms & Documents</h3>
                    <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>
                      Track forms sent to and completed by {contact.firstName}
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Send form to contact - coming soon!')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--zander-gold)',
                      color: 'var(--zander-navy)',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    + Send Form
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sampleForms.map((form) => (
                    <div
                      key={form.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: 'var(--zander-off-white)',
                        border: '1px solid var(--zander-border-gray)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📋</span>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{form.formName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                            {form.status === 'complete' && `Completed ${formatDateTime(form.submittedAt!)}`}
                            {form.status === 'sent' && `Sent ${formatDateTime(form.sentAt!)}`}
                            {form.status === 'partial' && `Started - sent ${formatDateTime(form.sentAt!)}`}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: form.status === 'complete' ? 'rgba(39, 174, 96, 0.1)' : form.status === 'sent' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(240, 179, 35, 0.1)',
                          color: form.status === 'complete' ? '#27AE60' : form.status === 'sent' ? '#3498DB' : '#B8860B',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {form.status === 'complete' ? 'Completed' : form.status === 'sent' ? 'Sent' : 'In Progress'}
                        </span>
                        <button
                          onClick={() => alert(`View ${form.formName} - coming soon!`)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: 'var(--zander-navy)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            padding: '1rem 1.5rem',
            background: 'var(--zander-off-white)',
            borderRadius: '8px'
          }}>
            <button
              onClick={() => alert('Enroll in email sequence - coming soon!')}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'var(--zander-navy)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Enroll in Email Sequence
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to archive this contact?')) {
                  alert('Contact archived - functionality coming soon!');
                }
              }}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'white',
                color: 'var(--zander-red)',
                border: '2px solid var(--zander-red)',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Archive Contact
            </button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
