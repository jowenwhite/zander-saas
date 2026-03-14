'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '../../components/ThemeToggle';
import NavBar from '../../components/NavBar';
import AuthGuard from '../../components/AuthGuard';
import { logout } from '../../utils/auth';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
}

interface Deal {
  id: string;
  dealName: string;
  dealValue: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  notes?: string;
  contact: Contact | null;
  createdAt: string;
  updatedAt: string;
}

interface TimelineItem {
  id: string;
  type: 'email' | 'call' | 'sms' | 'note' | 'task' | 'meeting' | 'stage_change';
  source?: 'activity' | 'email' | 'call' | 'sms';
  title: string;
  description: string;
  date: string;
  direction?: string;
  dealName?: string;
  fromAddress?: string;
  toAddress?: string;
  status?: string;
}

interface DocumentItem {
  id: string;
  name: string;
  status: 'pending' | 'not_started' | 'completed' | 'sent';
  type: string;
}

const STAGES = ['LEAD', 'PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getDaysInStage = (updatedAt: string) => {
  const updated = new Date(updatedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - updated.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getPriorityFromValue = (value: number) => {
  if (value >= 50000) return { label: 'High', color: '#BF0A30', bg: 'rgba(191, 10, 48, 0.9)' };
  if (value >= 25000) return { label: 'Medium', color: '#F0B323', bg: 'rgba(240, 179, 35, 0.9)' };
  return { label: 'Low', color: '#6C757D', bg: 'rgba(108, 117, 125, 0.9)' };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return { bg: 'rgba(39, 174, 96, 0.1)', color: '#27AE60', label: 'Completed' };
    case 'pending': return { bg: 'rgba(240, 179, 35, 0.1)', color: '#F0B323', label: 'Pending' };
    case 'sent': return { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498DB', label: 'Sent' };
    default: return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D', label: 'Not Started' };
  }
};

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModule, setActiveModule] = useState('cro');
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [lossReason, setLossReason] = useState('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');

  // Mock documents - generalized for any business
  const [documents] = useState<DocumentItem[]>([
    { id: '1', name: 'Project Proposal', status: 'pending', type: 'proposal' },
    { id: '2', name: 'Service Agreement', status: 'not_started', type: 'contract' },
    { id: '3', name: 'Quote/Estimate', status: 'not_started', type: 'quote' },
    { id: '4', name: 'Scope of Work', status: 'not_started', type: 'scope' },
    { id: '5', name: 'Invoice', status: 'not_started', type: 'invoice' },
    { id: '6', name: 'Change Order', status: 'not_started', type: 'change_order' },
  ]);

  // Mock activities
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  // Legacy hardcoded activities - now replaced by timeline
  const legacyActivities: TimelineItem[] = [
    { id: '1', type: 'stage_change', title: 'Stage Changed', description: 'Moved to current stage', date: new Date().toISOString() },
    { id: '2', type: 'email', title: 'Email Sent', description: 'Sent proposal follow-up', date: new Date(Date.now() - 86400000).toISOString() },
    { id: '3', type: 'call', title: 'Discovery Call', description: 'Initial requirements discussion', date: new Date(Date.now() - 172800000).toISOString() }
  ];

  useEffect(() => {
    fetchDeal();
  }, [dealId]);

  async function fetchDeal() {
    try {
      const response = await fetch(
        `https://api.zanderos.com/deals/${dealId}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setDeal(data);
        setNotes(data.notes || '');
        // Fetch timeline for this deal
        const timelineResponse = await fetch(
          `https://api.zanderos.com/activities/timeline?dealId=${dealId}`,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } }
        );
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json();
          setTimeline(timelineData.data || []);
        }
      } else {
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
    } finally {
      setLoading(false);
    }
  }
  async function updateDealStage(newStage: string) {
    try {
      const response = await fetch(
        `https://api.zanderos.com/deals/${dealId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` },
          body: JSON.stringify({ stage: newStage }),
        }
      );
      if (response.ok) {
        fetchDeal();
      }
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  }
  

  async function archiveDeal(reason?: string) {
    try {
      const response = await fetch(
        `https://api.zanderos.com/deals/${dealId}/archive`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` },
          body: JSON.stringify({ reason }),
        }
      );
      if (response.ok) {
        setShowArchiveModal(false);
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error archiving deal:', error);
    }
  }

  async function markDealLost(reason: string) {
    try {
      const response = await fetch(
        `https://api.zanderos.com/deals/${dealId}/mark-lost`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` },
          body: JSON.stringify({ reason }),
        }
      );
      if (response.ok) {
        setShowLostModal(false);
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error marking deal as lost:', error);
    }
  }
async function saveNotes() {
    try {
      const response = await fetch(
        `https://api.zanderos.com/deals/${dealId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` },
          body: JSON.stringify({ notes }),
        }
      );
      if (response.ok) {
        setIsEditingNotes(false);
        fetchDeal();
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }


  function moveToNextStage() {
    if (!deal) return;
    const currentIndex = STAGES.indexOf(deal.stage);
    if (currentIndex < STAGES.length - 2) {
      updateDealStage(STAGES[currentIndex + 1]);
    }
  }

  function moveToPreviousStage() {
    if (!deal) return;
    const currentIndex = STAGES.indexOf(deal.stage);
    if (currentIndex > 0) {
      updateDealStage(STAGES[currentIndex - 1]);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1C1C26' }}>
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
          <div style={{ color: '#8888A0' }}>Loading Deal...</div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1C1C26' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <div style={{ color: '#8888A0' }}>Deal not found</div>
          <button onClick={() => router.push('/projects')} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const priority = getPriorityFromValue(deal.dealValue);
  const daysInStage = getDaysInStage(deal.updatedAt);
  const currentStageIndex = STAGES.indexOf(deal.stage);

  return (
    <AuthGuard>
    <div style={{ minHeight: '100vh', background: '#1C1C26' }}>
      <NavBar activeModule="cro" />


      {/* Main Content */}
      <main style={{ marginTop: '64px', padding: '2rem', maxWidth: '1000px', margin: '64px auto 0' }}>
        {/* Back Button */}
        <button 
          onClick={() => router.push('/projects')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#8888A0',
            cursor: 'pointer',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}
        >
          ← Back to Projects
        </button>

        {/* Modal-style Card */}
        <div style={{
          background: '#1C1C26',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          border: '1px solid #2A2A38'
        }}>
          {/* Dark Header */}
          <div style={{
            background: '#13131A',
            padding: '1.5rem 2rem',
            color: 'white',
            border: '1px solid #2A2A38',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start'
          }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>{deal.dealName}</h1>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: priority.bg,
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>{priority.label} priority</span>
                <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>{formatStage(deal.stage)} • {daysInStage} days</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/projects')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                opacity: 0.8
              }}
            >×</button>
          </div>

          {/* Tabs - Navy Background */}
          <div style={{
            background: '#13131A',
            display: 'flex'
          }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'documents', label: 'Forms & Documents' },
              { id: 'communications', label: 'Communication' },
              { id: 'financial', label: 'Financial' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: activeTab === tab.id ? '#1C1C26' : 'transparent',
                  color: activeTab === tab.id ? '#F0F0F5' : '#8888A0',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #00CCEE' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem' }}>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { icon: '📞', label: 'Call' },
                    { icon: '✉️', label: 'Email' },
                    { icon: '💬', label: 'SMS' }
                  ].map((action) => (
                    <button key={action.label} style={{
                      padding: '1rem',
                      background: '#13131A',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      color: 'white',
                      fontSize: '1rem'
                    }}>
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>

                {/* Contact Information */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#55556A', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Information</h3>
                  {deal.contact ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/headquarters" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1C1C26', border: '1px solid #2A2A38', color: '#8888A0', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>🏛️ HQ</a>
                        <span style={{ color: '#8888A0' }}>✉️</span>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>Email</div>
                          <a href={`mailto:${deal.contact.email}`} style={{ color: '#00CCEE', textDecoration: 'none', fontWeight: '500' }}>
                            {deal.contact.email}
                          </a>
                        </div>
                      </div>
                      {deal.contact.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/headquarters" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1C1C26', border: '1px solid #2A2A38', color: '#8888A0', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>🏛️ HQ</a>
                          <span style={{ color: '#8888A0' }}>📞</span>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>Phone</div>
                            <a href={`tel:${deal.contact.phone}`} style={{ color: '#00CCEE', textDecoration: 'none', fontWeight: '500' }}>
                              {deal.contact.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#8888A0', fontStyle: 'italic' }}>No contact assigned</div>
                  )}
                </div>

                {/* Deal Details */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#55556A', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deal Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Deal Value</div>
                      <div style={{ fontWeight: '600', color: '#00CCEE', fontSize: '1.25rem' }}>{formatCurrency(deal.dealValue)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Probability</div>
                      <div style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '1.25rem' }}>{deal.probability}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Expected Close</div>
                      <div style={{ fontWeight: '500', color: '#F0F0F5' }}>
                        {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'Not set'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Days in Current Stage</div>
                      <div style={{ fontWeight: '500', color: '#F0F0F5' }}>{daysInStage} days</div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#55556A', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timeline</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #2A2A38' }}>
                    <span style={{ color: '#8888A0' }}>Created:</span>
                    <span style={{ fontWeight: '500', color: '#F0F0F5' }}>{formatDate(deal.createdAt)}</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: '#55556A', margin: 0, fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</h3>
                    {!isEditingNotes && (
                      <button onClick={() => setIsEditingNotes(true)} style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        border: '1px solid #2A2A38',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: '#8888A0'
                      }}>Edit</button>
                    )}
                  </div>
                  {isEditingNotes ? (
                    <div>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '120px',
                          padding: '1rem',
                          border: '2px solid #2A2A38',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          background: '#13131A',
                          color: '#F0F0F5'
                        }}
                        placeholder="Add notes about this deal..."
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button onClick={saveNotes} style={{
                          padding: '0.5rem 1rem',
                          background: '#00CCEE',
                          color: '#000000',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}>Save</button>
                        <button onClick={() => { setIsEditingNotes(false); setNotes(deal.notes || ''); }} style={{
                          padding: '0.5rem 1rem',
                          background: 'transparent',
                          border: '1px solid #2A2A38',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          color: '#8888A0'
                        }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '1rem',
                      background: '#13131A',
                      borderRadius: '8px',
                      minHeight: '80px',
                      color: notes ? '#F0F0F5' : '#8888A0',
                      fontStyle: notes ? 'normal' : 'italic',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9rem',
                      lineHeight: '1.6'
                    }}>
                      {notes || 'No notes yet. Click Edit to add notes.'}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* FORMS & DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div>
                {documents.map((doc) => {
                  const status = getStatusColor(doc.status);
                  return (
                    <div key={doc.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 0',
                      borderBottom: '1px solid #2A2A38'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/headquarters" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1C1C26', border: '1px solid #2A2A38', color: '#8888A0', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>🏛️ HQ</a>
                        <span style={{ color: '#8888A0' }}>📄</span>
                        <span style={{ fontWeight: '500', color: '#F0F0F5' }}>{doc.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/headquarters" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1C1C26', border: '1px solid #2A2A38', color: '#8888A0', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>🏛️ HQ</a>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: status.bg,
                          color: status.color,
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {status.label}
                        </span>
                        <button style={{
                          padding: '0.5rem 1rem',
                          background: '#1C1C26',
                          color: '#F0F0F5',
                          border: '1px solid #2A2A38',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.75rem'
                        }}>Open</button>
                        <button style={{
                          padding: '0.5rem 1rem',
                          background: '#1C1C26',
                          color: '#F0F0F5',
                          border: '1px solid #2A2A38',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.75rem'
                        }}>Send</button>
                      </div>
                    </div>
                  );
                })}

                {/* Upload Section */}
                <div style={{
                  marginTop: '2rem',
                  border: '2px dashed #2A2A38',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📁</div>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    background: '#1C1C26',
                    border: '1px solid #2A2A38',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: '#F0F0F5'
                  }}>
                    ⬆️ Upload File
                  </button>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#8888A0' }}>
                    Accepted: PDF, JPG, PNG, GIF, DOC, DOCX (Max 10MB)
                  </div>
                </div>
              </div>
            )}

            {/* COMMUNICATIONS TAB */}
            {activeTab === 'communications' && (
              <div>
                <div style={{
                  background: '#13131A',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Communication Timeline</h3>
                  <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
                    View all interactions and scheduled communications with this client
                  </p>
                </div>

                {timeline.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {timeline.map((activity) => (
                      <div key={activity.id} style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        background: '#13131A',
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: activity.type === 'call' ? '#27AE60' : activity.type === 'sms' ? '#9B59B6'
                            : activity.type === 'email' ? '#3498DB'
                            : '#2A2A38',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1rem'
                        }}>
                          {activity.type === 'call' ? '📞' : activity.type === 'email' ? '✉️' : activity.type === 'sms' ? '💬' : activity.type === 'note' ? '📝' : '📊'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>{activity.direction === 'inbound' ? '📥 ' : activity.direction === 'outbound' ? '📤 ' : ''}{activity.title}</div>
                          <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>{activity.description}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                          {formatDate(activity.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#8888A0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
                    <h4 style={{ color: '#F0F0F5', marginBottom: '0.5rem' }}>Communication Timeline</h4>
                    <p style={{ fontSize: '0.9rem' }}>Coming soon - View emails, calls, and scheduled follow-ups</p>
                  </div>
                )}
              </div>
            )}

            {/* FINANCIAL TAB */}
            {activeTab === 'financial' && (
              <div>
                <div style={{
                  background: '#13131A',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Financial Overview</h3>
                  <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
                    Track estimates, proposals, and project financials
                  </p>
                </div>

                {/* Financial Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '1.5rem', background: '#13131A', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.5rem' }}>Estimated Value</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00CCEE' }}>{formatCurrency(deal.dealValue)}</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: '#13131A', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.5rem' }}>Probability</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5' }}>{deal.probability}%</div>
                  </div>
                  <div style={{ padding: '1.5rem', background: '#13131A', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.5rem' }}>Weighted Value</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5' }}>{formatCurrency(deal.dealValue * deal.probability / 100)}</div>
                  </div>
                </div>

                {/* Coming Soon */}
                <div style={{ textAlign: 'center', padding: '3rem', color: '#8888A0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>💰</div>
                  <h4 style={{ color: '#F0F0F5', marginBottom: '0.5rem' }}>Financial Details</h4>
                  <p style={{ fontSize: '0.9rem' }}>Coming soon - Proposals, payments, and invoices</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: '#13131A',
            borderTop: '1px solid #2A2A38'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={moveToPreviousStage}
                disabled={currentStageIndex === 0}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#1C1C26',
                  border: '1px solid #2A2A38',
                  borderRadius: '6px',
                  cursor: currentStageIndex === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  color: '#F0F0F5',
                  opacity: currentStageIndex === 0 ? 0.5 : 1,
                  fontSize: '0.875rem'
                }}
              >
                ← Previous Stage
              </button>
              <button
                onClick={moveToNextStage}
                disabled={currentStageIndex >= STAGES.length - 2}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#00CCEE',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentStageIndex >= STAGES.length - 2 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: currentStageIndex >= STAGES.length - 2 ? 0.5 : 1,
                  fontSize: '0.875rem'
                }}
              >
                Next Stage →
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{
                padding: '0.75rem 1.25rem',
                background: '#1C1C26',
                color: '#F0F0F5',
                border: '1px solid #2A2A38',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                Enroll in Email Sequence
              </button>
              <button
                onClick={() => setShowLostModal(true)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#1C1C26',
                  border: '1px solid #00CCEE',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#00CCEE',
                  fontSize: '0.875rem'
                }}
              >
                Mark as Lost
              </button>
              <button
                onClick={() => setShowArchiveModal(true)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#1C1C26',
                  border: '1px solid #8888A0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#8888A0',
                  fontSize: '0.875rem'
                }}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

      {/* Mark as Lost Modal */}
      {showLostModal && (
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
        }}>
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '2rem',
            width: '400px',
            maxWidth: '90%',
            border: '1px solid #2A2A38'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#F0F0F5' }}>Mark Project as Lost</h3>
            <p style={{ marginBottom: '1rem', color: '#8888A0', fontSize: '0.9rem' }}>
              This will count towards your win/loss metrics. Select a reason:
            </p>
            <select
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #2A2A38',
                marginBottom: '1rem',
                fontSize: '1rem',
                background: '#13131A',
                color: '#F0F0F5'
              }}
            >
              <option value="">Select a reason...</option>
              <option value="Price Too High">Price Too High</option>
              <option value="Lost to Competitor">Lost to Competitor</option>
              <option value="No Budget">No Budget</option>
              <option value="Timing">Timing</option>
              <option value="No Response">No Response</option>
              <option value="Went Another Direction">Went Another Direction</option>
            </select>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowLostModal(false); setLossReason(''); }}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#1C1C26',
                  border: '1px solid #2A2A38',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#8888A0'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => lossReason && markDealLost(lossReason)}
                disabled={!lossReason}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: lossReason ? '#00CCEE' : '#555',
                  color: lossReason ? '#000000' : '#888',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: lossReason ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                Mark as Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
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
        }}>
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '2rem',
            width: '400px',
            maxWidth: '90%',
            border: '1px solid #2A2A38'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#F0F0F5' }}>Archive Project</h3>
            <p style={{ marginBottom: '1rem', color: '#8888A0', fontSize: '0.9rem' }}>
              Archived projects are excluded from win/loss metrics. Optional reason:
            </p>
            <select
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #2A2A38',
                marginBottom: '1rem',
                fontSize: '1rem',
                background: '#13131A',
                color: '#F0F0F5'
              }}
            >
              <option value="">No reason specified</option>
              <option value="Bad Fit">Bad Fit</option>
              <option value="Duplicate">Duplicate</option>
              <option value="Not Qualified">Not Qualified</option>
              <option value="Test Data">Test Data</option>
              <option value="Other">Other</option>
            </select>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowArchiveModal(false); setArchiveReason(''); }}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#1C1C26',
                  border: '1px solid #2A2A38',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#8888A0'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => archiveDeal(archiveReason || undefined)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#8888A0',
                  color: '#13131A',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
