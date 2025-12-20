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


interface EmailMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  fromAddress: string;
  toAddress: string;
  subject: string;
  body: string;
  htmlBody?: string;
  status: string;
  sentAt: string;
  threadId?: string;
  contact?: { id: string; firstName: string; lastName: string; email: string; };
}

interface SmsMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  body: string;
  status: string;
  sentAt: string;
  contact?: { id: string; firstName: string; lastName: string; phone: string; };
}

interface CallLog {
  id: string;
  type: string; // 'online_meeting' | 'voicemail_drop' | 'manual_call'
  direction: 'inbound' | 'outbound';
  fromNumber?: string;
  toNumber?: string;
  platform?: string;
  meetingUrl?: string;
  meetingId?: string;
  duration?: number;
  outcome?: string;
  status: string;
  notes?: string;
  recordingUrl?: string;
  transcription?: string;
  aiSummary?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  contact?: { id: string; firstName: string; lastName: string; phone?: string; };
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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

export default function CommunicationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'inbox' | 'templates' | 'sequences' | 'scheduled'>('inbox');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [communications, setCommunications] = useState<ScheduledComm[]>([]);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [messageType, setMessageType] = useState<'email' | 'sms' | 'calls'>('email');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showSmsCompose, setShowSmsCompose] = useState(false);
  const [showLogCall, setShowLogCall] = useState(false);
  const [callForm, setCallForm] = useState({ type: 'manual_call', direction: 'outbound', toNumber: '', contactId: '', duration: '', outcome: 'completed', notes: '', platform: '' });
  const [savingCall, setSavingCall] = useState(false);
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const [showCallDetails, setShowCallDetails] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ platform: 'zoom', meetingUrl: '', contactId: '', scheduledAt: '', notes: '' });
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [smsForm, setSmsForm] = useState({ to: '', body: '', contactId: '' });
  const [sendingSms, setSendingSms] = useState(false);
  const [inboxFilter, setInboxFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [callsFilter, setCallsFilter] = useState<'all' | 'scheduled' | 'completed'>('all');
  const [composeForm, setComposeForm] = useState({ to: '', contactId: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
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
  // Send Email Modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState<Template | null>(null);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

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
      const [templatesRes, sequencesRes, commsRes, emailsRes, contactsRes, smsRes, callLogsRes] = await Promise.all([
        fetch(`${API_URL}/templates`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/sequences`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/scheduled-communications`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/email-messages`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/contacts`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/sms-messages`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/call-logs`, { headers: getAuthHeaders() }),
      ]);
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (sequencesRes.ok) setSequences(await sequencesRes.json());
      if (commsRes.ok) setCommunications(await commsRes.json());
      if (emailsRes.ok) setEmails(await emailsRes.json());
      if (contactsRes.ok) { const data = await contactsRes.json(); setContacts(data.data || data); }
      if (smsRes && smsRes.ok) setSmsMessages(await smsRes.json());
      if (callLogsRes && callLogsRes.ok) setCallLogs(await callLogsRes.json());
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

  

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/contacts`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.data || data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const handleSendTemplate = async (template: Template) => {
    setSendingTemplate(template);
    setSelectedContactId('');
    setSendResult(null);
    await fetchContacts();
    setShowSendModal(true);
  };

  const sendEmailToContact = async () => {
    if (!sendingTemplate || !selectedContactId) return;
    setSendingEmail(true);
    setSendResult(null);
    try {
      const res = await fetch(`${API_URL}/templates/${sendingTemplate.id}/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ contactId: selectedContactId })
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({ success: true, message: 'Email sent successfully to ' + data.recipient });
      } else {
        setSendResult({ success: false, message: data.error || 'Failed to send email' });
      }
    } catch (err) {
      setSendResult({ success: false, message: 'Failed to send email' });
    } finally {
      setSendingEmail(false);
    }
  };


  // Send SMS function
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsForm.to || !smsForm.body) return;
    setSendingSms(true);
    try {
      const response = await fetch(`${API_URL}/sms-messages/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          to: smsForm.to.startsWith('+') ? smsForm.to : '+1' + smsForm.to.replace(/\D/g, ''),
          body: smsForm.body,
          contactId: smsForm.contactId || undefined
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowSmsCompose(false);
        setSmsForm({ to: '', body: '', contactId: '' });
        fetchData();
      } else {
        alert('Failed to send SMS: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to send SMS');
    } finally {
      setSendingSms(false);
    }
  };

  // Log Call function
  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callForm.type) return;
    setSavingCall(true);
    try {
      const response = await fetch(`${API_URL}/call-logs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: callForm.type,
          direction: callForm.direction,
          toNumber: callForm.toNumber ? (callForm.toNumber.startsWith('+') ? callForm.toNumber : '+1' + callForm.toNumber.replace(/\D/g, '')) : undefined,
          contactId: callForm.contactId || undefined,
          duration: callForm.duration ? parseInt(callForm.duration) * 60 : undefined,
          outcome: callForm.outcome,
          notes: callForm.notes,
          platform: callForm.platform || undefined,
        })
      });
      if (response.ok) {
        setShowLogCall(false);
        setCallForm({ type: 'manual_call', direction: 'outbound', toNumber: '', contactId: '', duration: '', outcome: 'completed', notes: '', platform: '' });
        fetchData();
      } else {
        const err = await response.json();
        alert('Failed to log call: ' + (err.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to log call');
    } finally {
      setSavingCall(false);
    }
  };

  // Schedule Meeting function
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.meetingUrl || !meetingForm.scheduledAt) {
      alert('Please enter meeting URL and scheduled time');
      return;
    }
    setSavingMeeting(true);
    try {
      const response = await fetch(`${API_URL}/call-logs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: 'online_meeting',
          direction: 'outbound',
          platform: meetingForm.platform,
          meetingUrl: meetingForm.meetingUrl,
          contactId: meetingForm.contactId || undefined,
          scheduledAt: new Date(meetingForm.scheduledAt).toISOString(),
          outcome: 'scheduled',
          status: 'scheduled',
          notes: meetingForm.notes,
        })
      });
      if (response.ok) {
        setShowScheduleMeeting(false);
        setMeetingForm({ platform: 'zoom', meetingUrl: '', contactId: '', scheduledAt: '', notes: '' });
        fetchData();
      } else {
        const err = await response.json();
        alert('Failed to schedule meeting: ' + (err.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to schedule meeting');
    } finally {
      setSavingMeeting(false);
    }
  };

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
              { icon: '📬', label: 'Communications', href: '/communications', active: true },
              { icon: '📋', label: 'Forms', href: '/forms' },
              { icon: '🤖', label: 'Ask Jordan (CRO)', href: '/ai' },
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
                Communications Hub
              </h1>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Email, SMS, and call management - all in one place
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
              { id: 'inbox', label: 'Inbox', icon: '📥' },
              { id: 'templates', label: 'Templates', icon: '📝' },
              { id: 'sequences', label: 'Sequences', icon: '🔄' },
              { id: 'scheduled', label: 'Scheduled', icon: '📅' },
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
            {/* INBOX TAB */}
            {activeTab === 'inbox' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {messageType === 'calls' ? (
                      <>
                        {(['all', 'scheduled', 'completed'] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setCallsFilter(f)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: callsFilter === f ? 'var(--zander-navy)' : 'white',
                              color: callsFilter === f ? 'white' : 'var(--zander-navy)',
                              border: '1px solid var(--zander-border-gray)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: callsFilter === f ? '600' : '400'
                            }}
                          >
                            {f === 'all' ? '📞 All Calls' : f === 'scheduled' ? '📅 Scheduled' : '✅ Completed'}
                          </button>
                        ))}
                      </>
                    ) : (
                      <>
                        {(['all', 'inbound', 'outbound'] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setInboxFilter(f)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: inboxFilter === f ? 'var(--zander-navy)' : 'white',
                              color: inboxFilter === f ? 'white' : 'var(--zander-navy)',
                              border: '1px solid var(--zander-border-gray)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: inboxFilter === f ? '600' : '400'
                            }}
                          >
                            {f === 'all' ? '📬 All' : f === 'inbound' ? '📥 Received' : '📤 Sent'}
                          </button>
                        ))}
                      </>
                    )}
                    {/* Message Type Toggle */}
                    <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '1rem', background: '#f0f0f0', borderRadius: '6px', padding: '0.25rem' }}>
                      <button
                        onClick={() => setMessageType('email')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: messageType === 'email' ? 'white' : 'transparent',
                          color: messageType === 'email' ? 'var(--zander-navy)' : '#666',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: messageType === 'email' ? '600' : '400',
                          boxShadow: messageType === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        📧 Email
                      </button>
                      <button
                        onClick={() => setMessageType('sms')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: messageType === 'sms' ? 'white' : 'transparent',
                          color: messageType === 'sms' ? 'var(--zander-navy)' : '#666',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: messageType === 'sms' ? '600' : '400',
                          boxShadow: messageType === 'sms' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        💬 SMS
                      </button>
                      <button
                        onClick={() => setMessageType('calls')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: messageType === 'calls' ? 'white' : 'transparent',
                          color: messageType === 'calls' ? 'var(--zander-navy)' : '#666',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: messageType === 'calls' ? '600' : '400',
                          boxShadow: messageType === 'calls' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        📞 Calls
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => messageType === 'email' ? setShowComposeModal(true) : messageType === 'sms' ? setShowSmsCompose(true) : setShowLogCall(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {messageType === 'email' ? '✉️ Compose Email' : messageType === 'sms' ? '💬 Compose SMS' : '📞 Log Call'}
                  </button>
                  {messageType === 'calls' && (
                    <button
                      onClick={() => setShowScheduleMeeting(true)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: '0.5rem'
                      }}
                    >
                      🎥 Schedule Meeting
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: selectedEmail ? '350px 1fr' : '1fr', gap: '1rem' }}>
                  <div style={{ border: '1px solid var(--zander-border-gray)', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                    {messageType === 'email' ? (
                      emails.filter(e => inboxFilter === 'all' || e.direction === inboxFilter).length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                          <p>No emails yet</p>
                        </div>
                      ) : (
                        emails.filter(e => inboxFilter === 'all' || e.direction === inboxFilter).map(email => (
                        <div
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--zander-border-gray)',
                            cursor: 'pointer',
                            background: selectedEmail?.id === email.id ? 'rgba(191, 10, 48, 0.05)' : 'transparent',
                            borderLeft: selectedEmail?.id === email.id ? '3px solid var(--zander-red)' : '3px solid transparent'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--zander-navy)' }}>
                              {email.direction === 'inbound' ? email.fromAddress : email.toAddress}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--zander-gray)' }}>
                              {new Date(email.sentAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: email.direction === 'inbound' ? '#e3f2fd' : '#fce4ec', color: email.direction === 'inbound' ? '#1976d2' : '#c2185b' }}>
                              {email.direction === 'inbound' ? '📥' : '📤'}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {email.subject}
                            </span>
                          </div>
                        </div>
                      ))
                    )
                    ) : messageType === 'sms' ? (
                      /* SMS Messages */
                      smsMessages.filter(s => inboxFilter === 'all' || s.direction === inboxFilter).length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                          <p>No SMS messages yet</p>
                          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Configure Twilio to send SMS</p>
                        </div>
                      ) : (
                        smsMessages.filter(s => inboxFilter === 'all' || s.direction === inboxFilter).map(sms => (
                          <div
                            key={sms.id}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--zander-border-gray)',
                              cursor: 'pointer',
                              background: 'transparent'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--zander-navy)' }}>
                                {sms.direction === 'inbound' ? sms.fromNumber : sms.toNumber}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--zander-gray)' }}>
                                {new Date(sms.sentAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: sms.direction === 'inbound' ? '#e8f5e9' : '#fff3e0', color: sms.direction === 'inbound' ? '#2e7d32' : '#f57c00' }}>
                                {sms.direction === 'inbound' ? '📥' : '📤'}
                              </span>
                              <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {sms.body.substring(0, 50)}{sms.body.length > 50 ? '...' : ''}
                              </span>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      /* Call Logs */
                      callLogs.filter(c => callsFilter === 'all' || (callsFilter === 'scheduled' ? c.status === 'scheduled' : c.status !== 'scheduled')).length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📞</div>
                          <p>No call logs yet</p>
                          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Log your first call to get started</p>
                        </div>
                      ) : (
                        callLogs.filter(c => callsFilter === 'all' || (callsFilter === 'scheduled' ? c.status === 'scheduled' : c.status !== 'scheduled')).map(call => (
                          <div
                            key={call.id}
                            onClick={() => { setSelectedCall(call); setTranscriptText(call.transcription || ''); setShowCallDetails(true); }}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--zander-border-gray)',
                              cursor: 'pointer',
                              background: call.status === 'scheduled' ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                              borderLeft: call.status === 'scheduled' ? '3px solid #1976d2' : '3px solid transparent'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--zander-navy)' }}>
                                {call.contact ? call.contact.firstName + ' ' + call.contact.lastName : (call.direction === 'inbound' ? call.fromNumber : call.toNumber) || 'Unknown'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: call.status === 'scheduled' ? '#1976d2' : 'var(--zander-gray)' }}>
                                {call.scheduledAt ? new Date(call.scheduledAt).toLocaleString() : new Date(call.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: call.type === 'online_meeting' ? '#e3f2fd' : call.type === 'voicemail_drop' ? '#fff3e0' : '#f3e5f5', color: call.type === 'online_meeting' ? '#1976d2' : call.type === 'voicemail_drop' ? '#f57c00' : '#7b1fa2' }}>
                                {call.type === 'online_meeting' ? '🎥' : call.type === 'voicemail_drop' ? '📱' : '📞'}
                              </span>
                              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: call.direction === 'inbound' ? '#e8f5e9' : '#fce4ec', color: call.direction === 'inbound' ? '#2e7d32' : '#c2185b' }}>
                                {call.direction === 'inbound' ? '📥' : '📤'}
                              </span>
                              {call.status === 'scheduled' ? (
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: '#e3f2fd', color: '#1976d2', fontWeight: '600' }}>
                                  📅 SCHEDULED
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {call.outcome || 'No outcome'} {call.duration ? '• ' + Math.floor(call.duration / 60) + 'm ' + (call.duration % 60) + 's' : ''}
                                </span>
                              )}
                              {call.status === 'scheduled' && call.meetingUrl && (
                                <a
                                
                                  href={call.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ marginLeft: 'auto', padding: '0.25rem 0.75rem', background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}
                                >
                                  🚀 Join
                                </a>
                              )}
                            </div>
                            {call.notes && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {call.notes.substring(0, 60)}{call.notes.length > 60 ? '...' : ''}
                              </div>
                            )}
                            {call.platform && call.type === 'online_meeting' && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>
                                via {call.platform === 'zoom' ? '📹 Zoom' : call.platform === 'google_meet' ? '🎦 Google Meet' : call.platform === 'teams' ? '👥 Teams' : call.platform}
                              </div>
                            )}
                          </div>
                        ))
                      )
                    )}
                  </div>
                  {selectedEmail && (
                    <div style={{ border: '1px solid var(--zander-border-gray)', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--zander-navy)' }}>{selectedEmail.subject}</h3>
                        <button onClick={() => setSelectedEmail(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--zander-gray)', marginBottom: '1rem' }}>
                        <p><strong>From:</strong> {selectedEmail.fromAddress}</p>
                        <p><strong>To:</strong> {selectedEmail.toAddress}</p>
                        <p><strong>Date:</strong> {new Date(selectedEmail.sentAt).toLocaleString()}</p>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--zander-border-gray)', margin: '1rem 0' }} />
                      <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedEmail.body}</div>
                      <button
                        onClick={() => {
                          setComposeForm({
                            to: selectedEmail.direction === 'inbound' ? selectedEmail.fromAddress : selectedEmail.toAddress,
                            contactId: selectedEmail.contact?.id || '',
                            subject: 'Re: ' + selectedEmail.subject.replace(/^Re: /, ''),
                            body: '\n\n---\nOn ' + new Date(selectedEmail.sentAt).toLocaleString() + ', ' + selectedEmail.fromAddress + ' wrote:\n> ' + selectedEmail.body.split('\n').join('\n> ')
                          });
                          setShowComposeModal(true);
                        }}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ↩️ Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                          {template.type === 'email' && <button onClick={() => handleSendTemplate(template)} style={{ padding: '0.5rem 1rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.75rem', cursor: 'pointer', marginRight: '0.5rem' }}>📤 Send</button>}
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
            {activeTab === 'scheduled' && (
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

      {/* SEND EMAIL MODAL */}
      {showSendModal && sendingTemplate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)' }}>📤 Send Email</h2>
            <div style={{ background: 'var(--zander-off-white)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{sendingTemplate.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>{sendingTemplate.subject}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Select Recipient</label>
              <select value={selectedContactId} onChange={(e) => setSelectedContactId(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px' }}>
                <option value="">Choose a contact...</option>
                {(contacts || []).filter(c => c.email).map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                ))}
              </select>
            </div>
            {sendResult && (
              <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem', background: sendResult.success ? 'rgba(39,174,96,0.1)' : 'rgba(191,10,48,0.1)', color: sendResult.success ? '#27AE60' : 'var(--zander-red)' }}>
                {sendResult.success ? '✅' : '❌'} {sendResult.message}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setShowSendModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={sendEmailToContact} disabled={!selectedContactId || sendingEmail} style={{ padding: '0.75rem 1.5rem', background: !selectedContactId || sendingEmail ? 'var(--zander-gray)' : 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', cursor: !selectedContactId || sendingEmail ? 'not-allowed' : 'pointer' }}>
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '600px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--zander-border-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--zander-navy)' }}>New Email</h2>
              <button onClick={() => setShowComposeModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSending(true);
              try {
                const response = await fetch(`${API_URL}/email-messages/send`, {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({ to: composeForm.to, contactId: composeForm.contactId || undefined, subject: composeForm.subject, body: composeForm.body, htmlBody: '<div style="font-family: Arial, sans-serif;">' + composeForm.body.replace(/\n/g, '<br>') + '</div>' })
                });
                if (response.ok) { setShowComposeModal(false); setComposeForm({ to: '', contactId: '', subject: '', body: '' }); fetchData(); }
                else { const err = await response.json(); alert('Failed: ' + (err.message || 'Unknown error')); }
              } catch (error) { alert('Failed to send email'); }
              finally { setSending(false); }
            }} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>To</label>
                <select value={composeForm.contactId} onChange={(e) => { const c = contacts.find(x => x.id === e.target.value); setComposeForm({ ...composeForm, contactId: e.target.value, to: c?.email || composeForm.to }); }} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                  <option value="">Select a contact or enter email below</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>)}
                </select>
                <input type="email" value={composeForm.to} onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })} placeholder="Or enter email address" required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Subject</label>
                <input type="text" value={composeForm.subject} onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Message</label>
                <textarea value={composeForm.body} onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })} required rows={10} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowComposeModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={sending} style={{ padding: '0.75rem 1.5rem', background: sending ? 'var(--zander-gray)' : 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: sending ? 'not-allowed' : 'pointer' }}>{sending ? 'Sending...' : '📤 Send Email'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* SMS Compose Modal */}
      {showSmsCompose && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--zander-border-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--zander-navy)' }}>💬 New SMS</h2>
              <button onClick={() => setShowSmsCompose(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSendSms} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>To</label>
                <select 
                  value={smsForm.contactId} 
                  onChange={(e) => { 
                    const c = contacts.find(x => x.id === e.target.value); 
                    setSmsForm({ ...smsForm, contactId: e.target.value, to: (c as any)?.phone || smsForm.to }); 
                  }} 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', marginBottom: '0.5rem' }}
                >
                  <option value="">Select a contact or enter number below</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
                <input 
                  type="tel" 
                  value={smsForm.to} 
                  onChange={(e) => setSmsForm({ ...smsForm, to: e.target.value })} 
                  placeholder="Phone number (e.g., 678-555-1234)" 
                  required 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }} 
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: '500', color: 'var(--zander-navy)' }}>Message</label>
                  <span style={{ fontSize: '0.75rem', color: smsForm.body.length > 160 ? 'var(--zander-red)' : 'var(--zander-gray)' }}>
                    {smsForm.body.length}/160 {smsForm.body.length > 160 ? '(' + Math.ceil(smsForm.body.length / 160) + ' segments)' : ''}
                  </span>
                </div>
                <textarea 
                  value={smsForm.body} 
                  onChange={(e) => setSmsForm({ ...smsForm, body: e.target.value })} 
                  required 
                  rows={4} 
                  maxLength={480}
                  placeholder="Type your message..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', resize: 'vertical' }} 
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
                  SMS messages over 160 characters will be sent as multiple segments
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowSmsCompose(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={sendingSms || !smsForm.to || !smsForm.body} style={{ padding: '0.75rem 1.5rem', background: sendingSms || !smsForm.to || !smsForm.body ? 'var(--zander-gray)' : 'linear-gradient(135deg, #27AE60 0%, #219a52 100%)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: sendingSms || !smsForm.to || !smsForm.body ? 'not-allowed' : 'pointer' }}>
                  {sendingSms ? 'Sending...' : '💬 Send SMS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Log Call Modal */}
      {showLogCall && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '550px', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--zander-border-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--zander-navy)' }}>📞 Log Call</h2>
              <button onClick={() => setShowLogCall(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleLogCall} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Call Type *</label>
                  <select
                    value={callForm.type}
                    onChange={(e) => setCallForm({ ...callForm, type: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                  >
                    <option value="manual_call">📞 Manual Call</option>
                    <option value="online_meeting">🎥 Online Meeting</option>
                    <option value="voicemail_drop">📱 Voicemail Drop</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Direction *</label>
                  <select
                    value={callForm.direction}
                    onChange={(e) => setCallForm({ ...callForm, direction: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                  >
                    <option value="outbound">📤 Outbound</option>
                    <option value="inbound">📥 Inbound</option>
                  </select>
                </div>
              </div>
              
              {callForm.type === 'online_meeting' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Platform</label>
                  <select
                    value={callForm.platform}
                    onChange={(e) => setCallForm({ ...callForm, platform: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                  >
                    <option value="">Select platform...</option>
                    <option value="zoom">Zoom</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Contact</label>
                <select
                  value={callForm.contactId}
                  onChange={(e) => {
                    const c = contacts.find(x => x.id === e.target.value);
                    setCallForm({ ...callForm, contactId: e.target.value, toNumber: (c as any)?.phone || callForm.toNumber });
                  }}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', marginBottom: '0.5rem' }}
                >
                  <option value="">Select a contact or enter number below</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
                <input
                  type="tel"
                  value={callForm.toNumber}
                  onChange={(e) => setCallForm({ ...callForm, toNumber: e.target.value })}
                  placeholder="Phone number (optional)"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Duration (minutes)</label>
                  <input
                    type="number"
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                    placeholder="e.g., 15"
                    min="0"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Outcome</label>
                  <select
                    value={callForm.outcome}
                    onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                  >
                    <option value="completed">✅ Completed</option>
                    <option value="voicemail">📫 Left Voicemail</option>
                    <option value="no_answer">❌ No Answer</option>
                    <option value="busy">🔴 Busy</option>
                    <option value="cancelled">🚫 Cancelled</option>
                    <option value="scheduled">📅 Scheduled</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Notes</label>
                <textarea
                  value={callForm.notes}
                  onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                  rows={4}
                  placeholder="Call summary, action items, follow-up needed..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowLogCall(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={savingCall || !callForm.type} style={{ padding: '0.75rem 1.5rem', background: savingCall || !callForm.type ? 'var(--zander-gray)' : 'linear-gradient(135deg, #9B59B6 0%, #8e44ad 100%)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: savingCall || !callForm.type ? 'not-allowed' : 'pointer' }}>
                  {savingCall ? 'Saving...' : '📞 Log Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleMeeting && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--zander-border-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>🎥 Schedule Meeting</h2>
              <button onClick={() => setShowScheduleMeeting(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}>×</button>
            </div>
            <form onSubmit={handleScheduleMeeting} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Platform *</label>
                <select
                  value={meetingForm.platform}
                  onChange={(e) => setMeetingForm({ ...meetingForm, platform: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                >
                  <option value="zoom">📹 Zoom</option>
                  <option value="google_meet">🎦 Google Meet</option>
                  <option value="teams">👥 Microsoft Teams</option>
                  <option value="other">🔗 Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Meeting URL *</label>
                <input
                  type="url"
                  value={meetingForm.meetingUrl}
                  onChange={(e) => setMeetingForm({ ...meetingForm, meetingUrl: e.target.value })}
                  placeholder="https://zoom.us/j/123456789 or meet.google.com/abc-defg-hij"
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Scheduled Date & Time *</label>
                <input
                  type="datetime-local"
                  value={meetingForm.scheduledAt}
                  onChange={(e) => setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Contact (Optional)</label>
                <select
                  value={meetingForm.contactId}
                  onChange={(e) => setMeetingForm({ ...meetingForm, contactId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px' }}
                >
                  <option value="">-- Select Contact --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} - {c.email}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--zander-navy)' }}>Notes / Agenda</label>
                <textarea
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Meeting agenda, topics to discuss, preparation needed..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowScheduleMeeting(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={savingMeeting} style={{ padding: '0.75rem 1.5rem', background: savingMeeting ? 'var(--zander-gray)' : 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: savingMeeting ? 'not-allowed' : 'pointer' }}>
                  {savingMeeting ? 'Scheduling...' : '🎥 Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call Details Modal */}
      {showCallDetails && selectedCall && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--zander-border-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '12px 12px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>📞 Call Details</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                  {selectedCall.contact ? selectedCall.contact.firstName + ' ' + selectedCall.contact.lastName : 'Unknown Contact'}
                </p>
              </div>
              <button onClick={() => setShowCallDetails(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {/* Call Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Type</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedCall.type === 'online_meeting' ? '🎥 Online Meeting' : selectedCall.type === 'voicemail_drop' ? '📱 Voicemail' : '📞 Phone Call'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Duration</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedCall.duration ? Math.floor(selectedCall.duration / 60) + 'm ' + (selectedCall.duration % 60) + 's' : 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: selectedCall.status === 'completed' ? '#27ae60' : selectedCall.status === 'scheduled' ? '#1976d2' : '#666' }}>{selectedCall.status || 'Unknown'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Direction</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedCall.direction === 'inbound' ? '📥 Inbound' : '📤 Outbound'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Outcome</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedCall.outcome || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{new Date(selectedCall.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Notes */}
              {selectedCall.notes && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>📝 Notes</h3>
                  <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.6' }}>{selectedCall.notes}</div>
                </div>
              )}

              {/* Transcript Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>📝 Transcript / Meeting Notes</h3>
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Paste your call transcript, Zoom transcript export, meeting notes, or key points here..."
                  style={{ width: '100%', minHeight: '150px', padding: '1rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.6', resize: 'vertical' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
                  Tip: You can paste transcripts from Zoom, Otter.ai, Google Meet, or type your own notes
                </p>
              </div>

              {/* Generate Summary Button */}
              <button
                onClick={async () => {
                  if (!transcriptText.trim()) {
                    alert('Please enter transcript or notes first');
                    return;
                  }
                  setGeneratingSummary(true);
                  try {
                    const token = localStorage.getItem('zander_token');
                    const res = await fetch('https://api.zander.mcfapp.com/call-logs/' + selectedCall.id + '/generate-summary', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                      body: JSON.stringify({ transcript: transcriptText })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setSelectedCall({ ...selectedCall, transcription: data.transcription, aiSummary: data.aiSummary });
                      // Update in the list too
                      setCallLogs(callLogs.map(c => c.id === selectedCall.id ? { ...c, transcription: data.transcription, aiSummary: data.aiSummary } : c));
                    } else {
                      alert('Failed to generate summary');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Error generating summary');
                  }
                  setGeneratingSummary(false);
                }}
                disabled={generatingSummary || !transcriptText.trim()}
                style={{ width: '100%', padding: '0.75rem', background: generatingSummary ? '#ccc' : 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: generatingSummary ? 'not-allowed' : 'pointer', marginBottom: '1.5rem' }}
              >
                {generatingSummary ? '🤖 Generating Summary...' : '🤖 Generate AI Summary'}
              </button>

              {/* AI Summary Display */}
              {selectedCall.aiSummary && (
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--zander-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>AI</span>
                    Summary
                  </h3>
                  <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {selectedCall.aiSummary}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--zander-border-gray)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowCallDetails(false)} style={{ padding: '0.5rem 1.5rem', background: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
