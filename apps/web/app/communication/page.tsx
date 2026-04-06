'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import AuthGuard from '../components/AuthGuard';
import { Building2, Rocket, Phone, Mail, Calendar, Star, Trash2, Video, Landmark, CheckSquare, MessageSquare, ListTodo, Clock, FileText, ArrowLeft, ArrowRight, Download, Mic, Bot, Users, Factory, Store, Smartphone, Check, X, Inbox, Send, Package, ClipboardList, AlertTriangle, Circle, Link2, Voicemail, Upload, MailOpen, List, Headphones, Layers, ExternalLink, MailX, XCircle, PhoneOff, Share2, Square } from 'lucide-react';

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

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'single' | 'multi';
  channels: string[];
  status: 'active' | 'paused' | 'draft';
  triggerType?: string;
  isFromTreasury: boolean;
  steps: CampaignStep[];
  _count?: { enrollments: number };
  createdAt: string;
}

interface CampaignStep {
  id: string;
  order: number;
  channel: 'email' | 'sms' | 'phone';
  dayOffset: number;
  hourOffset: number;
  subject?: string;
  content: string;
  status: string;
}

interface TreasuryItem {
  id: string;
  type: string;
  name: string;
  description?: string;
  category?: string;
  executive?: string;
  industry?: string;
  channels: string[];
  content: any;
  stepCount?: number;
  duration?: string;
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
  isRead: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  contact?: { id: string; firstName: string; lastName: string; email: string; };
  tenant?: { id: string; companyName: string; subdomain: string; };
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
  contact?: { id: string; firstName: string; lastName: string; phone?: string; email?: string; };
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



interface AccessibleTenant {
  id: string;
  companyName: string;
  subdomain: string;
  tenantType: string;
}

// Tenant colors for multi-tenant view
const TENANT_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  'mcf': { bg: '#BF0A30', text: 'white', icon: 'factory' },
  '64w': { bg: '#0C2340', text: 'white', icon: 'building' },
  'zander': { bg: '#F0B323', text: '#0C2340', icon: 'rocket' },
  'default': { bg: '#6c757d', text: 'white', icon: 'store' }
};

const getTenantIcon = (iconKey: string, size: number = 14) => {
  const icons: Record<string, React.ReactNode> = {
    factory: <Factory size={size} />,
    building: <Building2 size={size} />,
    rocket: <Rocket size={size} />,
    store: <Store size={size} />,
  };
  return icons[iconKey] || <Building2 size={size} />;
};

const getTenantColor = (subdomain: string) => {
  if (subdomain?.toLowerCase().includes('mcf') || subdomain?.toLowerCase().includes('cabinet')) {
    return TENANT_COLORS.mcf;
  }
  if (subdomain?.toLowerCase().includes('64w') || subdomain?.toLowerCase().includes('west')) {
    return TENANT_COLORS['64w'];
  }
  if (subdomain?.toLowerCase().includes('zander')) {
    return TENANT_COLORS.zander;
  }
  return TENANT_COLORS.default;
};

export default function CommunicationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'inbox' | 'campaigns' | 'scheduled'>('inbox');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'active' | 'draft' | 'paused'>('all');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTreasuryModal, setShowTreasuryModal] = useState(false);
  const [treasuryItems, setTreasuryItems] = useState<TreasuryItem[]>([]);
  const [treasuryLoading, setTreasuryLoading] = useState(false);
  const [treasuryFilter, setTreasuryFilter] = useState<{
    category: string;
    executive: string;
    industry: string;
    channels: string[];
  }>({ category: '', executive: '', industry: '', channels: [] });
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
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
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingEmails, setSharingEmails] = useState<string[]>([]);
  const [sendingSummary, setSendingSummary] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ platform: 'zoom', meetingUrl: '', contactId: '', scheduledAt: '', notes: '' });
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [smsForm, setSmsForm] = useState({ to: '', body: '', contactId: '' });
  const [sendingSms, setSendingSms] = useState(false);
  const [inboxFilter, setInboxFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [inboxView, setInboxView] = useState<'list' | 'threads'>('list');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadEmails, setThreadEmails] = useState<EmailMessage[]>([]);
  const [callsFilter, setCallsFilter] = useState<'all' | 'scheduled' | 'completed'>('all');
  const [composeForm, setComposeForm] = useState({ to: '', contactId: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());
  const [templateFilter, setTemplateFilter] = useState<'all' | 'email' | 'sms' | 'call'>('all');
  const [commFilter, setCommFilter] = useState<'all' | 'pending' | 'approved' | 'sent'>('all');
  
  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null);
  
  // Form states
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', body: '', type: 'email', category: '', stage: '', status: 'draft' });
  const [sequenceForm, setSequenceForm] = useState({ name: '', description: '', status: 'draft' });
  const [saving, setSaving] = useState(false);

  // Email Signatures
  const [signatures, setSignatures] = useState<{ id: string; name: string; body: string; isDefault: boolean }[]>([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureForm, setSignatureForm] = useState({ name: '', body: '', isDefault: false });
  const [editingSignature, setEditingSignature] = useState<{ id: string; name: string; body: string; isDefault: boolean } | null>(null);
  const [savingSignature, setSavingSignature] = useState(false);
  // Send Email Modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingTemplate, setSendingTemplate] = useState<Template | null>(null);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Multi-tenant state (SuperAdmin only)
  const [accessibleTenants, setAccessibleTenants] = useState<AccessibleTenant[]>([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [currentTenantId, setCurrentTenantId] = useState<string>('');

  const API_URL = 'https://api.zanderos.com';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('zander_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Email action handlers
  const handleMarkAsRead = async (emailId: string) => {
    try {
      await fetch(`${API_URL}/email-messages/${emailId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, isRead: true } : e));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleMarkAsUnread = async (emailId: string) => {
    try {
      await fetch(`${API_URL}/email-messages/${emailId}/unread`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, isRead: false } : e));
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      console.error('Mark as unread error:', err);
    }
  };

  const handleArchiveEmail = async (emailId: string) => {
    try {
      await fetch(`${API_URL}/email-messages/${emailId}/archive`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      setEmails(prev => prev.filter(e => e.id !== emailId));
      if (selectedEmail?.id === emailId) setSelectedEmail(null);
    } catch (err) {
      console.error('Archive email error:', err);
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (!confirm('Delete this email?')) return;
    try {
      await fetch(`${API_URL}/email-messages/${emailId}/delete`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      setEmails(prev => prev.filter(e => e.id !== emailId));
      if (selectedEmail?.id === emailId) setSelectedEmail(null);
    } catch (err) {
      console.error('Delete email error:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/email-messages/mark-all-read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      setEmails(prev => prev.map(e => ({ ...e, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedEmailIds.size === 0) return;
    try {
      const ids = Array.from(selectedEmailIds);
      const res = await fetch(`${API_URL}/email-messages/bulk-mark-read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state for marked emails
        const markedCount = emails.filter(e => selectedEmailIds.has(e.id) && !e.isRead && e.direction === 'inbound').length;
        setEmails(prev => prev.map(e => selectedEmailIds.has(e.id) ? { ...e, isRead: true } : e));
        setUnreadCount(prev => Math.max(0, prev - markedCount));
        setSelectedEmailIds(new Set());
      }
    } catch (err) {
      console.error('Bulk mark as read error:', err);
    }
  };

  const toggleEmailSelection = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmailIds(prev => {
      const next = new Set(prev);
      if (next.has(emailId)) {
        next.delete(emailId);
      } else {
        next.add(emailId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const visibleEmails = emails.filter(e => inboxFilter === 'all' || e.direction === inboxFilter);
    const allSelected = visibleEmails.every(e => selectedEmailIds.has(e.id));
    if (allSelected) {
      setSelectedEmailIds(new Set());
    } else {
      setSelectedEmailIds(new Set(visibleEmails.map(e => e.id)));
    }
  };

  const loadThread = async (threadId: string) => {
    try {
      const res = await fetch(`${API_URL}/email-messages/thread/${threadId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const thread = await res.json();
        setThreadEmails(thread);
        setSelectedThread(threadId);
      }
    } catch (err) {
      console.error('Load thread error:', err);
    }
  };

  // Group emails by thread for thread view
  const groupEmailsByThread = (emailList: EmailMessage[]) => {
    const threads: Map<string, EmailMessage[]> = new Map();
    const standalone: EmailMessage[] = [];

    emailList.forEach(email => {
      if (email.threadId) {
        const existing = threads.get(email.threadId) || [];
        existing.push(email);
        threads.set(email.threadId, existing);
      } else {
        standalone.push(email);
      }
    });

    // Convert to array of thread summaries
    const threadSummaries: { threadId: string; emails: EmailMessage[]; latestEmail: EmailMessage; unreadCount: number }[] = [];

    threads.forEach((emails, threadId) => {
      const sorted = emails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      threadSummaries.push({
        threadId,
        emails: sorted,
        latestEmail: sorted[0],
        unreadCount: emails.filter(e => !e.isRead && e.direction === 'inbound').length
      });
    });

    // Sort threads by latest email date
    threadSummaries.sort((a, b) => new Date(b.latestEmail.sentAt).getTime() - new Date(a.latestEmail.sentAt).getTime());

    return { threads: threadSummaries, standalone };
  };

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const token = localStorage.getItem('zander_token');
        const userStr = localStorage.getItem('zander_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsSuperAdmin(user.isSuperAdmin || false);
          setCurrentTenantId(user.tenantId || '');
          
          if (user.isSuperAdmin) {
            const res = await fetch(`${API_URL}/tenants/accessible`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const tenants = await res.json();
              setAccessibleTenants(tenants);
              setSelectedTenantIds([user.tenantId]);
            }
          }
        }
      } catch (err) {
        console.error('Error checking SuperAdmin status:', err);
      }
    };
    checkSuperAdmin();
  }, []);

  useEffect(() => {
    fetchData();
  }, [viewMode, selectedTenantIds]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build tenant query param for multi-tenant mode
      const tenantQuery = viewMode === 'all' && selectedTenantIds.length > 0 
        ? `?tenantIds=${selectedTenantIds.join(',')}`
        : '';
      
      const [templatesRes, sequencesRes, commsRes, emailsRes, contactsRes, smsRes, callLogsRes, unreadCountRes, campaignsRes, signaturesRes] = await Promise.all([
        fetch(`${API_URL}/templates`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/sequences`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/scheduled-communications`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/email-messages${tenantQuery}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/contacts`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/sms-messages${tenantQuery}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/call-logs${tenantQuery}`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/email-messages/unread-count`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/campaigns`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/email-signatures`, { headers: getAuthHeaders() }),
      ]);
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (sequencesRes.ok) setSequences(await sequencesRes.json());
      if (commsRes.ok) setCommunications(await commsRes.json());
      if (emailsRes.ok) setEmails(await emailsRes.json());
      if (contactsRes.ok) { const data = await contactsRes.json(); setContacts(data.data || data); }
      if (smsRes && smsRes.ok) setSmsMessages(await smsRes.json());
      if (callLogsRes && callLogsRes.ok) setCallLogs(await callLogsRes.json());
      if (unreadCountRes && unreadCountRes.ok) { const data = await unreadCountRes.json(); setUnreadCount(data.unreadCount || 0); }
      if (campaignsRes && campaignsRes.ok) setCampaigns(await campaignsRes.json());
      if (signaturesRes && signaturesRes.ok) {
        const sigs = await signaturesRes.json();
        setSignatures(sigs);
        const defaultSig = sigs.find((s: any) => s.isDefault);
        if (defaultSig) setSelectedSignatureId(defaultSig.id);
      }
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

  // Email Signature CRUD
  const handleSaveSignature = async () => {
    setSavingSignature(true);
    try {
      const url = editingSignature
        ? `${API_URL}/email-signatures/${editingSignature.id}`
        : `${API_URL}/email-signatures`;
      const method = editingSignature ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(signatureForm)
      });

      if (response.ok) {
        const signaturesRes = await fetch(`${API_URL}/email-signatures`, { headers: getAuthHeaders() });
        if (signaturesRes.ok) {
          const sigs = await signaturesRes.json();
          setSignatures(sigs);
          const defaultSig = sigs.find((s: any) => s.isDefault);
          if (defaultSig) setSelectedSignatureId(defaultSig.id);
        }
        setShowSignatureModal(false);
        setEditingSignature(null);
        setSignatureForm({ name: '', body: '', isDefault: false });
      } else {
        const err = await response.json();
        alert('Failed: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to save signature');
    } finally {
      setSavingSignature(false);
    }
  };

  const handleDeleteSignature = async (id: string) => {
    if (!confirm('Delete this signature?')) return;
    try {
      await fetch(`${API_URL}/email-signatures/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setSignatures(signatures.filter(s => s.id !== id));
      if (selectedSignatureId === id) {
        const remaining = signatures.filter(s => s.id !== id);
        const newDefault = remaining.find(s => s.isDefault) || remaining[0];
        setSelectedSignatureId(newDefault?.id || '');
      }
    } catch (err) {
      alert('Failed to delete signature');
    }
  };

  const handleSetDefaultSignature = async (id: string) => {
    try {
      await fetch(`${API_URL}/email-signatures/${id}/set-default`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      setSignatures(signatures.map(s => ({ ...s, isDefault: s.id === id })));
      setSelectedSignatureId(id);
    } catch (err) {
      alert('Failed to set default signature');
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignModal(true);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await fetch(`${API_URL}/campaigns/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      alert('Failed to delete campaign');
    }
  };

  const fetchTreasuryItems = async () => {
    setTreasuryLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', 'campaign');
      if (treasuryFilter.category) params.append('category', treasuryFilter.category);
      if (treasuryFilter.executive) params.append('executive', treasuryFilter.executive);
      if (treasuryFilter.industry) params.append('industry', treasuryFilter.industry);
      if (treasuryFilter.channels.length > 0) params.append('channels', treasuryFilter.channels.join(','));
      
      const res = await fetch(`${API_URL}/treasury/campaigns?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setTreasuryItems(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch treasury items:', err);
    } finally {
      setTreasuryLoading(false);
    }
  };

  const handleAddFromTreasury = async (item: TreasuryItem) => {
    try {
      const res = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          type: item.content?.type || 'multi',
          channels: item.channels,
          status: 'draft',
          isFromTreasury: true,
          steps: item.content?.steps || []
        })
      });
      if (res.ok) {
        const newCampaign = await res.json();
        setCampaigns([newCampaign, ...campaigns]);
        setShowTreasuryModal(false);
        alert(`"${item.name}" added to your campaigns!`);
      }
    } catch (err) {
      console.error('Failed to add from treasury:', err);
      alert('Failed to add campaign from treasury');
    }
  };

  // Fetch treasury items when modal opens
  React.useEffect(() => {
    if (showTreasuryModal) {
      fetchTreasuryItems();
    }
  }, [showTreasuryModal, treasuryFilter]);

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

  const filteredCampaigns = campaignFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === campaignFilter);

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

  const getTypeIcon = (type: string, size: number = 16): React.ReactNode => {
    switch (type) {
      case 'email': return <Mail size={size} />;
      case 'sms': return <MessageSquare size={size} />;
      case 'call': return <Phone size={size} />;
      default: return <FileText size={size} />;
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
    <div style={{ minHeight: '100vh', background: '#09090F' }}>
      <NavBar activeModule="cro" />

      <Sidebar />

      {/* Main Content */}
      <main style={{ marginLeft: '240px', marginTop: '64px', padding: '2rem' }}>
        {/* Page Header */}
        <div style={{
          background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)',
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
                onClick={() => setShowTreasuryModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Landmark size={16} /> The Treasury
              </button>
              <button
                onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', subject: '', body: '', type: 'email', category: '', stage: '', status: 'draft' }); setShowTemplateModal(true); }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#00CCEE',
                  color: '#F0F0F5',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                + New Campaign
              </button>
            </div>
          </div>
        </div>


        {/* SuperAdmin Tenant Toggle - Only visible for SuperAdmin */}
        {isSuperAdmin && accessibleTenants.length > 1 && (
          <div style={{
            background: '#1C1C26',
            borderRadius: '12px',
            border: '2px solid #00CCEE',
            marginBottom: '1rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ 
              fontWeight: '600', 
              color: '#F0F0F5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Star size={14} style={{ display: 'inline' }} /> Personal View:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setViewMode('single');
                  setSelectedTenantIds([currentTenantId]);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: viewMode === 'single' ? '#13131A' : 'transparent',
                  color: viewMode === 'single' ? 'white' : 'rgba(255, 255, 255, 0.85)',
                  border: viewMode === 'single' ? 'none' : '1px solid rgba(255, 255, 255, 0.35)',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Current Tenant
              </button>
              {accessibleTenants.map((tenant) => {
                const colors = getTenantColor(tenant.subdomain);
                const isSelected = viewMode === 'all' && selectedTenantIds.includes(tenant.id) && selectedTenantIds.length === 1;
                return (
                  <button
                    key={tenant.id}
                    onClick={() => {
                      setViewMode('all');
                      setSelectedTenantIds([tenant.id]);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: isSelected ? colors.bg : 'transparent',
                      color: isSelected ? colors.text : 'rgba(255, 255, 255, 0.85)',
                      border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.35)',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {colors.icon} {tenant.companyName}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setViewMode('all');
                  setSelectedTenantIds(accessibleTenants.map(t => t.id));
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: viewMode === 'all' && selectedTenantIds.length === accessibleTenants.length ? '#00CCEE' : 'transparent',
                  color: viewMode === 'all' && selectedTenantIds.length === accessibleTenants.length ? '#13131A' : 'rgba(255, 255, 255, 0.85)',
                  border: viewMode === 'all' && selectedTenantIds.length === accessibleTenants.length ? 'none' : '1px solid rgba(255, 255, 255, 0.35)',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Star size={14} style={{ display: 'inline' }} /> All My Companies
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{
          background: '#1C1C26',
          border: '2px solid #2A2A38',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#00CCEE' }}>{loading ? '...' : campaigns.length}</div>
              <div style={{ color: '#8888A0', fontSize: '0.875rem' }}>Campaigns</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#27AE60' }}>{loading ? '...' : campaigns.filter(c => c.status === 'active').length}</div>
              <div style={{ color: '#8888A0', fontSize: '0.875rem' }}>Active</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#F0F0F5' }}>{loading ? '...' : campaigns.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0)}</div>
              <div style={{ color: '#8888A0', fontSize: '0.875rem' }}>Active Enrollments</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#00CCEE' }}>{loading ? '...' : communications.filter(c => c.status === 'pending').length}</div>
              <div style={{ color: '#8888A0', fontSize: '0.875rem' }}>Pending Approval</div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div style={{
          background: '#1C1C26',
          borderRadius: '12px',
          border: '2px solid #2A2A38',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #2A2A38' }}>
            {[
              { id: 'inbox', label: 'Inbox', icon: <Inbox size={16} /> },
              { id: 'campaigns', label: 'Campaigns', icon: <Rocket size={16} /> },
              { id: 'scheduled', label: 'Scheduled', icon: <Calendar size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1, padding: '1rem',
                  background: activeTab === tab.id ? '#09090F' : 'white',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #00CCEE' : '3px solid transparent',
                  cursor: 'pointer', fontWeight: '600',
                  color: activeTab === tab.id ? '#00CCEE' : '#8888A0',
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
                              background: callsFilter === f ? '#13131A' : 'white',
                              color: callsFilter === f ? 'white' : '#13131A',
                              border: '1px solid #2A2A38',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: callsFilter === f ? '600' : '400'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{f === 'all' ? <><Phone size={14} /> All Calls</> : f === 'scheduled' ? <><Calendar size={14} /> Scheduled</> : <><CheckSquare size={14} /> Completed</>}</span>
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
                              background: inboxFilter === f ? '#13131A' : 'white',
                              color: inboxFilter === f ? 'white' : '#13131A',
                              border: '1px solid #2A2A38',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: inboxFilter === f ? '600' : '400'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{f === 'all' ? <><Inbox size={14} /> All</> : f === 'inbound' ? <><ArrowLeft size={14} /> Received{unreadCount > 0 ? ` (${unreadCount})` : ''}</> : <><ArrowRight size={14} /> Sent</>}</span>
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
                          color: messageType === 'email' ? '#13131A' : '#666',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: messageType === 'email' ? '600' : '400',
                          boxShadow: messageType === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={14} /> Email</span>
                      </button>
                      <button
                        onClick={() => setMessageType('sms')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: messageType === 'sms' ? 'white' : 'transparent',
                          color: messageType === 'sms' ? '#13131A' : '#666',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: messageType === 'sms' ? '600' : '400',
                          boxShadow: messageType === 'sms' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MessageSquare size={14} /> SMS</span>
                      </button>
                      <button
                        onClick={() => setMessageType('calls')}
                        style={{
                          padding: '0.4rem 0.75rem',
                          background: messageType === 'calls' ? 'white' : 'transparent',
                          color: messageType === 'calls' ? '#13131A' : '#666',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: messageType === 'calls' ? '600' : '400',
                          boxShadow: messageType === 'calls' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={14} /> Calls</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => messageType === 'email' ? setShowComposeModal(true) : messageType === 'sms' ? setShowSmsCompose(true) : setShowLogCall(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>{messageType === 'email' ? <><Mail size={14} /> Compose Email</> : messageType === 'sms' ? <><MessageSquare size={14} /> Compose SMS</> : <><Phone size={14} /> Log Call</>}</span>
                  </button>
                  {messageType === 'calls' && (
                    <button
                      onClick={() => setShowScheduleMeeting(true)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: '0.5rem'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Video size={14} /> Schedule Assembly</span>
                    </button>
                  )}
                </div>
                {/* View toggle and Mark All Read for email */}
                {messageType === 'email' && emails.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Select All Checkbox - only show in list view */}
                        {inboxView === 'list' && (
                          <button
                            onClick={toggleSelectAll}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.5rem',
                              background: 'transparent',
                              border: '1px solid #2A2A38',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#F0F0F5',
                              fontSize: '0.75rem'
                            }}
                          >
                            {emails.filter(e => inboxFilter === 'all' || e.direction === inboxFilter).every(e => selectedEmailIds.has(e.id)) && emails.filter(e => inboxFilter === 'all' || e.direction === inboxFilter).length > 0 ? (
                              <CheckSquare size={14} style={{ color: '#00CCEE' }} />
                            ) : (
                              <Square size={14} />
                            )}
                            Select All
                          </button>
                        )}
                        <div style={{ display: 'flex', gap: '0.25rem', background: '#f0f0f0', borderRadius: '6px', padding: '0.25rem' }}>
                          <button
                            onClick={() => { setInboxView('list'); setSelectedThread(null); }}
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: inboxView === 'list' ? 'white' : 'transparent',
                              color: inboxView === 'list' ? '#13131A' : '#666',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: inboxView === 'list' ? '600' : '400',
                              boxShadow: inboxView === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><List size={14} /> List</span>
                          </button>
                          <button
                            onClick={() => { setInboxView('threads'); setSelectedEmailIds(new Set()); }}
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: inboxView === 'threads' ? 'white' : 'transparent',
                              color: inboxView === 'threads' ? '#13131A' : '#666',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: inboxView === 'threads' ? '600' : '400',
                              boxShadow: inboxView === 'threads' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Layers size={14} /> Threads</span>
                          </button>
                        </div>
                      </div>
                      {unreadCount > 0 && selectedEmailIds.size === 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: 'transparent',
                            color: '#F0F0F5',
                            border: '1px solid #2A2A38',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}
                        >
                          ✓ Mark All Read
                        </button>
                      )}
                    </div>
                    {/* Bulk Action Bar - shown when emails are selected */}
                    {selectedEmailIds.size > 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(0, 204, 238, 0.1)',
                        border: '1px solid rgba(0, 204, 238, 0.3)',
                        borderRadius: '6px'
                      }}>
                        <span style={{ fontSize: '0.8rem', color: '#00CCEE', fontWeight: '600' }}>
                          {selectedEmailIds.size} selected
                        </span>
                        <button
                          onClick={handleBulkMarkAsRead}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            background: '#00CCEE',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          <Check size={14} /> Mark as Read
                        </button>
                        <button
                          onClick={() => setSelectedEmailIds(new Set())}
                          style={{
                            padding: '0.35rem 0.5rem',
                            background: 'transparent',
                            color: '#F0F0F5',
                            border: '1px solid #2A2A38',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: selectedEmail || selectedThread ? 'minmax(280px, 350px) 1fr' : '1fr', gap: '1rem' }}>
                  <div style={{ border: '1px solid #2A2A38', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                    {messageType === 'email' ? (
                      emails.filter(e => inboxFilter === 'all' || e.direction === inboxFilter).length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>
                          <div style={{ marginBottom: '0.5rem' }}><MailOpen size={32} /></div>
                          <p>No emails yet</p>
                        </div>
                      ) : inboxView === 'threads' ? (
                        /* Thread View */
                        (() => {
                          const { threads, standalone } = groupEmailsByThread(emails.filter(e => inboxFilter === 'all' || e.direction === inboxFilter));
                          return (
                            <>
                              {threads.map(thread => (
                                <div
                                  key={thread.threadId}
                                  onClick={() => loadThread(thread.threadId)}
                                  style={{
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid #2A2A38',
                                    cursor: 'pointer',
                                    background: selectedThread === thread.threadId ? 'rgba(191, 10, 48, 0.05)' : thread.unreadCount > 0 ? 'rgba(25, 118, 210, 0.03)' : 'transparent',
                                    borderLeft: selectedThread === thread.threadId ? '3px solid #00CCEE' : thread.unreadCount > 0 ? '3px solid #1976d2' : '3px solid transparent'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: thread.unreadCount > 0 ? '700' : '500', fontSize: '0.85rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                      <Layers size={14} /> {thread.latestEmail.subject}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {thread.unreadCount > 0 && (
                                        <span style={{ background: '#1976d2', color: 'white', borderRadius: '10px', padding: '0.1rem 0.4rem', fontSize: '0.65rem', fontWeight: '600' }}>
                                          {thread.unreadCount}
                                        </span>
                                      )}
                                      <span style={{ fontSize: '0.7rem', color: '#8888A0' }}>
                                        {new Date(thread.latestEmail.sentAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#8888A0' }}>
                                      {thread.emails.length} messages
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {thread.latestEmail.body.substring(0, 50)}...
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {standalone.map(email => (
                                <div
                                  key={email.id}
                                  onClick={() => { setSelectedEmail(email); setSelectedThread(null); if (!email.isRead && email.direction === 'inbound') handleMarkAsRead(email.id); }}
                                  style={{
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid #2A2A38',
                                    cursor: 'pointer',
                                    background: selectedEmail?.id === email.id ? 'rgba(191, 10, 48, 0.05)' : !email.isRead && email.direction === 'inbound' ? 'rgba(25, 118, 210, 0.03)' : 'transparent',
                                    borderLeft: selectedEmail?.id === email.id ? '3px solid #00CCEE' : !email.isRead && email.direction === 'inbound' ? '3px solid #1976d2' : '3px solid transparent'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: !email.isRead && email.direction === 'inbound' ? '700' : '500', fontSize: '0.85rem', color: '#F0F0F5' }}>
                                      {email.direction === 'inbound' ? email.fromAddress : email.toAddress}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: '#8888A0' }}>
                                      {new Date(email.sentAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: email.direction === 'inbound' ? '#e3f2fd' : '#fce4ec', color: email.direction === 'inbound' ? '#1976d2' : '#c2185b' }}>
                                      {email.direction === 'inbound' ? <Download size={12} /> : <Upload size={12} />}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: !email.isRead && email.direction === 'inbound' ? '600' : '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {email.subject}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </>
                          );
                        })()
                      ) : (
                        /* List View */
                        emails.filter(e => inboxFilter === 'all' || e.direction === inboxFilter).map(email => (
                        <div
                          key={email.id}
                          onClick={() => { setSelectedEmail(email); setSelectedThread(null); if (!email.isRead && email.direction === 'inbound') handleMarkAsRead(email.id); }}
                          onMouseEnter={(e) => {
                            const actions = e.currentTarget.querySelector('.email-actions') as HTMLElement;
                            if (actions) actions.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            const actions = e.currentTarget.querySelector('.email-actions') as HTMLElement;
                            if (actions) actions.style.opacity = '0';
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #2A2A38',
                            cursor: 'pointer',
                            background: selectedEmailIds.has(email.id) ? 'rgba(0, 204, 238, 0.08)' : selectedEmail?.id === email.id ? 'rgba(191, 10, 48, 0.05)' : !email.isRead && email.direction === 'inbound' ? 'rgba(25, 118, 210, 0.03)' : 'transparent',
                            borderLeft: selectedEmailIds.has(email.id) ? '3px solid #00CCEE' : selectedEmail?.id === email.id ? '3px solid #00CCEE' : !email.isRead && email.direction === 'inbound' ? '3px solid #1976d2' : '3px solid transparent',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            {/* Checkbox */}
                            <button
                              onClick={(e) => toggleEmailSelection(email.id, e)}
                              style={{
                                padding: '0.15rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                flexShrink: 0,
                                marginTop: '0.1rem'
                              }}
                            >
                              {selectedEmailIds.has(email.id) ? (
                                <CheckSquare size={16} style={{ color: '#00CCEE' }} />
                              ) : (
                                <Square size={16} style={{ color: '#666' }} />
                              )}
                            </button>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: !email.isRead && email.direction === 'inbound' ? '700' : '500', fontSize: '0.85rem', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  {!email.isRead && email.direction === 'inbound' && (
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1976d2', display: 'inline-block' }}></span>
                                  )}
                                  {email.direction === 'inbound' ? email.fromAddress : email.toAddress}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#8888A0' }}>
                                  {new Date(email.sentAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: email.direction === 'inbound' ? '#e3f2fd' : '#fce4ec', color: email.direction === 'inbound' ? '#1976d2' : '#c2185b' }}>
                                  {email.direction === 'inbound' ? <Download size={12} /> : <Upload size={12} />}
                                </span>
                                <span style={{ fontSize: '0.8rem', fontWeight: !email.isRead && email.direction === 'inbound' ? '600' : '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                  {email.subject}
                                </span>
                                {email.threadId && (
                                  <span style={{ fontSize: '0.6rem', color: '#666', background: '#f0f0f0', padding: '0.1rem 0.3rem', borderRadius: '3px', display: 'inline-flex', alignItems: 'center' }}><Layers size={10} /></span>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Quick Actions */}
                          <div
                            className="email-actions"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              right: '0.5rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              display: 'flex',
                              gap: '0.25rem',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              background: '#1C1C26',
                              padding: '0.25rem',
                              borderRadius: '4px',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                            }}
                          >
                            {email.isRead ? (
                              <button
                                onClick={() => handleMarkAsUnread(email.id)}
                                title="Mark as unread"
                                style={{ padding: '0.25rem 0.4rem', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.35)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.85)' }}
                              >
                                ○
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMarkAsRead(email.id)}
                                title="Mark as read"
                                style={{ padding: '0.25rem 0.4rem', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.35)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.85)' }}
                              >
                                ●
                              </button>
                            )}
                            <button
                              onClick={() => handleArchiveEmail(email.id)}
                              title="Archive"
                              style={{ padding: '0.25rem 0.4rem', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.35)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.85)' }}
                            >
                              <Package size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteEmail(email.id)}
                              title="Delete"
                              style={{ padding: '0.25rem 0.4rem', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.35)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.85)' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )
                    ) : messageType === 'sms' ? (
                      /* SMS Messages */
                      smsMessages.filter(s => inboxFilter === 'all' || s.direction === inboxFilter).length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>
                          <div style={{ marginBottom: '0.5rem' }}><MessageSquare size={32} /></div>
                          <p>No SMS messages yet</p>
                          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Configure Twilio to send SMS</p>
                        </div>
                      ) : (
                        smsMessages.filter(s => inboxFilter === 'all' || s.direction === inboxFilter).map(sms => (
                          <div
                            key={sms.id}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid #2A2A38',
                              cursor: 'pointer',
                              background: 'transparent'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#F0F0F5' }}>
                                {sms.direction === 'inbound' ? sms.fromNumber : sms.toNumber}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#8888A0' }}>
                                {new Date(sms.sentAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: sms.direction === 'inbound' ? '#e8f5e9' : '#fff3e0', color: sms.direction === 'inbound' ? '#2e7d32' : '#f57c00' }}>
                                {sms.direction === 'inbound' ? <Download size={12} /> : <Upload size={12} />}
                              </span>
                              <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                {sms.body.substring(0, 50)}{sms.body.length > 50 ? '...' : ''}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this SMS?')) {
                                    fetch(process.env.NEXT_PUBLIC_API_URL + '/sms-messages/' + sms.id, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('zander_token') }
                                    }).then(() => {
                                      setSmsMessages(prev => prev.filter(s => s.id !== sms.id));
                                    }).catch(err => console.error('Delete SMS error:', err));
                                  }
                                }}
                                style={{ padding: '0.25rem 0.5rem', background: 'transparent', color: '#00CCEE', border: '1px solid #00CCEE', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', opacity: 0.7 }}
                                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      /* Call Logs */
                      callLogs.filter(c => callsFilter === 'all' || (callsFilter === 'scheduled' ? c.status === 'scheduled' : c.status !== 'scheduled')).length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>
                          <div style={{ marginBottom: '0.5rem' }}><Phone size={32} /></div>
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
                              borderBottom: '1px solid #2A2A38',
                              cursor: 'pointer',
                              background: call.status === 'scheduled' ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                              borderLeft: call.status === 'scheduled' ? '3px solid #1976d2' : '3px solid transparent'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#F0F0F5' }}>
                                {call.contact ? call.contact.firstName + ' ' + call.contact.lastName : (call.direction === 'inbound' ? call.fromNumber : call.toNumber) || 'Unknown'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: call.status === 'scheduled' ? '#1976d2' : '#8888A0' }}>
                                {call.scheduledAt ? new Date(call.scheduledAt).toLocaleString() : new Date(call.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: call.type === 'online_meeting' ? '#e3f2fd' : call.type === 'voicemail_drop' ? '#fff3e0' : '#f3e5f5', color: call.type === 'online_meeting' ? '#1976d2' : call.type === 'voicemail_drop' ? '#f57c00' : '#7b1fa2' }}>
                                {call.type === 'online_meeting' ? <Video size={12} /> : call.type === 'voicemail_drop' ? <Voicemail size={12} /> : <Phone size={12} />}
                              </span>
                              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: call.direction === 'inbound' ? '#e8f5e9' : '#fce4ec', color: call.direction === 'inbound' ? '#2e7d32' : '#c2185b' }}>
                                {call.direction === 'inbound' ? <Download size={12} /> : <Upload size={12} />}
                              </span>
                              {call.status === 'scheduled' ? (
                                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: '#e3f2fd', color: '#1976d2', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Calendar size={10} /> SCHEDULED
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
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ExternalLink size={12} /> Join</span>
                                </a>
                              )}
                            </div>
                            {call.notes && (
                              <div style={{ fontSize: '0.75rem', color: '#8888A0', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {call.notes.substring(0, 60)}{call.notes.length > 60 ? '...' : ''}
                              </div>
                            )}
                            {call.platform && call.type === 'online_meeting' && (
                              <div style={{ fontSize: '0.7rem', color: '#8888A0', marginTop: '0.25rem' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>via {call.platform === 'zoom' ? <><Video size={12} /> Zoom</> : call.platform === 'google_meet' ? <><Video size={12} /> Google Meet</> : call.platform === 'teams' ? <><Users size={12} /> Teams</> : call.platform}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )
                    )}
                  </div>
                  {/* Thread View */}
                  {selectedThread && threadEmails.length > 0 && !selectedEmail && (
                    <div style={{ border: '1px solid #2A2A38', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '1rem', background: '#09090F', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#F0F0F5', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Layers size={16} /> {threadEmails[0]?.subject} ({threadEmails.length} messages)
                        </h3>
                        <button onClick={() => { setSelectedThread(null); setThreadEmails([]); }} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
                      </div>
                      <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        {threadEmails.map((email, idx) => (
                          <div key={email.id} style={{ padding: '1rem', borderBottom: idx < threadEmails.length - 1 ? '1px solid #2A2A38' : 'none', background: !email.isRead && email.direction === 'inbound' ? 'rgba(25, 118, 210, 0.03)' : 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <div>
                                <span style={{ fontWeight: !email.isRead && email.direction === 'inbound' ? '700' : '500', fontSize: '0.9rem', color: '#F0F0F5' }}>
                                  {email.direction === 'inbound' ? email.fromAddress : `To: ${email.toAddress}`}
                                </span>
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', padding: '0.1rem 0.3rem', borderRadius: '3px', background: email.direction === 'inbound' ? '#e3f2fd' : '#fce4ec', color: email.direction === 'inbound' ? '#1976d2' : '#c2185b' }}>
                                  {email.direction === 'inbound' ? <Download size={12} /> : <Upload size={12} />}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>{new Date(email.sentAt).toLocaleString()}</span>
                            </div>
                            <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#F0F0F5' }}>{email.body}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '1rem', background: '#09090F', borderTop: '1px solid #2A2A38' }}>
                        <button
                          onClick={() => {
                            const lastEmail = threadEmails[threadEmails.length - 1];
                            setComposeForm({
                              to: lastEmail.direction === "inbound" ? lastEmail.fromAddress : lastEmail.toAddress,
                              contactId: lastEmail.contact?.id || "",
                              subject: "Re: " + lastEmail.subject.replace(/^Re: /, ""),
                              body: "\n\n---\nOn " + new Date(lastEmail.sentAt).toLocaleString() + ", " + lastEmail.fromAddress + " wrote:\n> " + lastEmail.body.split("\n").join("\n> ")
                            });
                            setShowComposeModal(true);
                          }}
                          style={{ padding: "0.5rem 1rem", background: "#13131A", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ArrowLeft size={14} /> Reply to Thread</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Single Email View */}
                  {selectedEmail && (
                    <div style={{ border: '1px solid #2A2A38', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#F0F0F5' }}>{selectedEmail.subject}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {selectedEmail.direction === 'inbound' && (
                            <button
                              onClick={() => selectedEmail.isRead ? handleMarkAsUnread(selectedEmail.id) : handleMarkAsRead(selectedEmail.id)}
                              style={{ padding: '0.35rem 0.6rem', background: 'transparent', border: '1px solid #2A2A38', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                              title={selectedEmail.isRead ? 'Mark as unread' : 'Mark as read'}
                            >
                              {selectedEmail.isRead ? '○ Unread' : '● Read'}
                            </button>
                          )}
                          <button onClick={() => setSelectedEmail(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#8888A0', marginBottom: '1rem' }}>
                        <p><strong>From:</strong> {selectedEmail.fromAddress}</p>
                        <p><strong>To:</strong> {selectedEmail.toAddress}</p>
                        <p><strong>Date:</strong> {new Date(selectedEmail.sentAt).toLocaleString()}</p>
                        {selectedEmail.threadId && (
                          <p style={{ marginTop: '0.5rem' }}>
                            <button
                              onClick={() => { loadThread(selectedEmail.threadId!); setSelectedEmail(null); }}
                              style={{ padding: '0.25rem 0.5rem', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#666' }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Layers size={12} /> View full thread</span>
                            </button>
                          </p>
                        )}
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid #2A2A38', margin: '1rem 0' }} />
                      <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedEmail.body}</div>
                      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          onClick={() => {
                            setComposeForm({
                              to: selectedEmail.direction === "inbound" ? selectedEmail.fromAddress : selectedEmail.toAddress,
                              contactId: selectedEmail.contact?.id || "",
                              subject: "Re: " + selectedEmail.subject.replace(/^Re: /, ""),
                              body: "\n\n---\nOn " + new Date(selectedEmail.sentAt).toLocaleString() + ", " + selectedEmail.fromAddress + " wrote:\n> " + selectedEmail.body.split("\n").join("\n> ")
                            });
                            setShowComposeModal(true);
                          }}
                          style={{ padding: "0.5rem 1rem", background: "#13131A", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ArrowLeft size={14} /> Reply</span>
                        </button>
                        <button
                          onClick={() => {
                            setComposeForm({
                              to: "",
                              contactId: "",
                              subject: "Fwd: " + selectedEmail.subject.replace(/^Fwd: /, ""),
                              body: "\n\n---\nForwarded message:\nFrom: " + selectedEmail.fromAddress + "\nDate: " + new Date(selectedEmail.sentAt).toLocaleString() + "\nSubject: " + selectedEmail.subject + "\n\n" + selectedEmail.body
                            });
                            setShowComposeModal(true);
                          }}
                          style={{ padding: "0.5rem 1rem", background: "#005687", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ArrowRight size={14} /> Forward</span>
                        </button>
                        <button
                          onClick={() => handleArchiveEmail(selectedEmail.id)}
                          style={{ padding: "0.5rem 1rem", background: "#00CCEE", color: "#F0F0F5", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Package size={14} /> Archive</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEmail(selectedEmail.id)}
                          style={{ padding: "0.5rem 1rem", background: "transparent", color: "#00CCEE", border: "1px solid #00CCEE", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div>
                {/* Header with buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['all', 'active', 'draft', 'paused'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setCampaignFilter(filter)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: campaignFilter === filter ? '#13131A' : 'white',
                          color: campaignFilter === filter ? 'white' : '#13131A',
                          border: '1px solid #2A2A38',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}
                      >
                        {filter === 'all' ? 'All Campaigns' : filter}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => setShowTreasuryModal(true)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#00CCEE',
                        color: '#F0F0F5',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Landmark size={16} /> The Treasury
                    </button>
                    <button
                      onClick={() => setShowCampaignModal(true)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#00CCEE',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      + New Campaign
                    </button>
                  </div>
                </div>

                {/* Campaign List */}
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#8888A0' }}>Loading campaigns...</div>
                ) : filteredCampaigns.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ marginBottom: '1rem' }}><Rocket size={48} /></div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#F0F0F5' }}>No Campaigns Yet</h3>
                    <p style={{ color: '#8888A0', marginBottom: '1rem' }}>Create multi-step outreach campaigns or browse The Treasury for ready-made templates</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button onClick={() => setShowTreasuryModal(true)} style={{ padding: '0.75rem 1.5rem', background: '#00CCEE', color: '#F0F0F5', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                        <Landmark size={14} /> Browse Treasury
                      </button>
                      <button onClick={() => setShowCampaignModal(true)} style={{ padding: '0.75rem 1.5rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                        + Create Campaign
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                    {filteredCampaigns.map((campaign) => (
                      <div 
                        key={campaign.id} 
                        style={{ 
                          background: '#1C1C26', 
                          border: '2px solid #2A2A38', 
                          borderRadius: '12px', 
                          padding: '1.5rem',
                          transition: 'border-color 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#F0F0F5' }}>{campaign.name}</h4>
                            {campaign.isFromTreasury && <span style={{ fontSize: '0.65rem', color: '#00CCEE', fontWeight: '600' }}><Landmark size={10} /> FROM TREASURY</span>}
                          </div>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: campaign.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : campaign.status === 'paused' ? 'rgba(240, 179, 35, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                            color: campaign.status === 'active' ? '#27AE60' : campaign.status === 'paused' ? '#B8860B' : '#8888A0',
                            borderRadius: '4px', 
                            fontSize: '0.65rem', 
                            fontWeight: '600', 
                            textTransform: 'uppercase'
                          }}>
                            {campaign.status}
                          </span>
                        </div>

                        {campaign.description && (
                          <p style={{ color: '#8888A0', fontSize: '0.85rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                            {campaign.description}
                          </p>
                        )}

                        {/* Channel Indicators */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          {campaign.channels.includes('email') && (
                            <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(0, 204, 238, 0.1)', color: '#00CCEE', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Mail size={12} /> Email
                            </span>
                          )}
                          {campaign.channels.includes('sms') && (
                            <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(39, 174, 96, 0.1)', color: '#27AE60', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MessageSquare size={12} /> SMS
                            </span>
                          )}
                          {campaign.channels.includes('phone') && (
                            <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(12, 35, 64, 0.1)', color: '#F0F0F5', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Phone size={12} /> Phone
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #2A2A38' }}>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                              {campaign.steps?.length || 0} steps
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                              {campaign._count?.enrollments || 0} enrolled
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => handleEditCampaign(campaign)} 
                              style={{ 
                                padding: '0.5rem 1rem', 
                                background: '#00CCEE', 
                                color: '#F0F0F5', 
                                border: 'none', 
                                borderRadius: '6px', 
                                fontWeight: '600', 
                                fontSize: '0.75rem', 
                                cursor: 'pointer' 
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCampaign(campaign.id)} 
                              style={{ 
                                padding: '0.5rem 0.75rem', 
                                background: 'transparent',
                                color: '#00CCEE',
                                border: '1px solid #00CCEE',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
                        background: commFilter === filter ? '#13131A' : 'white',
                        color: commFilter === filter ? 'white' : '#13131A',
                        border: '1px solid #2A2A38',
                        borderRadius: '6px', cursor: 'pointer', fontWeight: '500', textTransform: 'capitalize'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#8888A0' }}>Loading...</div>
                ) : filteredComms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ marginBottom: '1rem' }}><Calendar size={48} /></div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#F0F0F5' }}>No Scheduled Communications</h3>
                    <p style={{ color: '#8888A0' }}>Scheduled emails and messages will appear here</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#13131A', color: 'white' }}>
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
                        <tr key={comm.id} style={{ background: index % 2 === 0 ? 'white' : '#09090F', borderBottom: '1px solid #2A2A38' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '500', color: '#F0F0F5' }}>{comm.contact?.firstName} {comm.contact?.lastName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>{comm.contact?.email}</div>
                          </td>
                          <td style={{ padding: '1rem' }}><span style={{ ...getTypeColor(comm.type), padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{getTypeIcon(comm.type)} {comm.type}</span></td>
                          <td style={{ padding: '1rem', color: '#8888A0' }}>{comm.subject || '—'}</td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#8888A0' }}>{formatDate(comm.scheduledFor)}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              background: comm.status === 'pending' ? 'rgba(240, 179, 35, 0.1)' : comm.status === 'approved' ? 'rgba(52, 152, 219, 0.1)' : comm.status === 'sent' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                              color: comm.status === 'pending' ? '#B8860B' : comm.status === 'approved' ? '#3498DB' : comm.status === 'sent' ? '#27AE60' : '#8888A0',
                              borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase'
                            }}>{comm.status}</span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {comm.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button onClick={() => handleApproveCommunication(comm.id)} style={{ padding: '0.5rem 0.75rem', background: '#27AE60', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Check size={14} /></button>
                                <button onClick={() => handleCancelCommunication(comm.id)} style={{ padding: '0.5rem 0.75rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
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
          <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#F0F0F5' }}>{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Name *</label>
                <input type="text" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Type</label>
                <select value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="call">Call Script</option>
                </select>
              </div>
            </div>
            
            {templateForm.type === 'email' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Subject</label>
                <input type="text" value={templateForm.subject} onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
            )}
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Body</label>
              <textarea value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} rows={6} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Use {{firstName}}, {{lastName}}, {{company}} for personalization..." />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Category</label>
                <input type="text" value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} placeholder="e.g., Follow-up" style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Pipeline Stage</label>
                <select value={templateForm.stage} onChange={(e) => setTemplateForm({ ...templateForm, stage: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', boxSizing: 'border-box' }}>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Status</label>
                <select value={templateForm.status} onChange={(e) => setTemplateForm({ ...templateForm, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '2px solid #2A2A38', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: '#8888A0' }}>Cancel</button>
              <button onClick={handleSaveTemplate} disabled={saving || !templateForm.name} style={{ padding: '0.75rem 1.5rem', background: saving || !templateForm.name ? '#8888A0' : '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: saving || !templateForm.name ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Template'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Sequence Modal */}
      {showSequenceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#F0F0F5' }}>{editingSequence ? 'Edit Sequence' : 'New Sequence'}</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Name *</label>
              <input type="text" value={sequenceForm.name} onChange={(e) => setSequenceForm({ ...sequenceForm, name: e.target.value })} placeholder="e.g., New Lead Nurture" style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Description</label>
              <textarea value={sequenceForm.description} onChange={(e) => setSequenceForm({ ...sequenceForm, description: e.target.value })} rows={3} placeholder="Describe what this sequence does..." style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Status</label>
              <select value={sequenceForm.status} onChange={(e) => setSequenceForm({ ...sequenceForm, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '6px', boxSizing: 'border-box' }}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowSequenceModal(false); setEditingSequence(null); }} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '2px solid #2A2A38', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: '#8888A0' }}>Cancel</button>
              <button onClick={handleSaveSequence} disabled={saving || !sequenceForm.name} style={{ padding: '0.75rem 1.5rem', background: saving || !sequenceForm.name ? '#8888A0' : '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: saving || !sequenceForm.name ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Sequence'}</button>
            </div>
          </div>
        </div>
      )}
      {/* SEND EMAIL MODAL */}
      {showSendModal && sendingTemplate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1C1C26', borderRadius: '16px', padding: '2rem', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Upload size={20} /> Send Email</h2>
            <div style={{ background: '#09090F', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{sendingTemplate.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>{sendingTemplate.subject}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Select Recipient</label>
              <select value={selectedContactId} onChange={(e) => setSelectedContactId(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px' }}>
                <option value="">Choose a contact...</option>
                {(contacts || []).filter(c => c.email).map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                ))}
              </select>
            </div>
            {sendResult && (
              <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem', background: sendResult.success ? 'rgba(39,174,96,0.1)' : 'rgba(191,10,48,0.1)', color: sendResult.success ? '#27AE60' : '#00CCEE' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>{sendResult.success ? <Check size={16} /> : <X size={16} />} {sendResult.message}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setShowSendModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '2px solid #2A2A38', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={sendEmailToContact} disabled={!selectedContactId || sendingEmail} style={{ padding: '0.75rem 1.5rem', background: !selectedContactId || sendingEmail ? '#8888A0' : '#00CCEE', color: 'white', border: 'none', borderRadius: '6px', cursor: !selectedContactId || sendingEmail ? 'not-allowed' : 'pointer' }}>
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', width: '600px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#F0F0F5' }}>New Email</h2>
              <button onClick={() => setShowComposeModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSending(true);
              try {
                // Get selected signature body
                const selectedSignature = signatures.find(s => s.id === selectedSignatureId);
                const signatureText = selectedSignature ? `\n\n${selectedSignature.body}` : '';
                const fullBody = composeForm.body + signatureText;
                const fullHtmlBody = '<div style="font-family: Arial, sans-serif;">' + composeForm.body.replace(/\n/g, '<br>') + (selectedSignature ? '<br><br>' + selectedSignature.body.replace(/\n/g, '<br>') : '') + '</div>';

                const response = await fetch(`${API_URL}/email-messages/send`, {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({ to: composeForm.to, contactId: composeForm.contactId || undefined, subject: composeForm.subject, body: fullBody, htmlBody: fullHtmlBody })
                });
                if (response.ok) { setShowComposeModal(false); setComposeForm({ to: '', contactId: '', subject: '', body: '' }); fetchData(); }
                else { const err = await response.json(); alert('Failed: ' + (err.message || 'Unknown error')); }
              } catch (error) { alert('Failed to send email'); }
              finally { setSending(false); }
            }} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>To</label>
                <select value={composeForm.contactId} onChange={(e) => { const c = contacts.find(x => x.id === e.target.value); setComposeForm({ ...composeForm, contactId: e.target.value, to: c?.email || composeForm.to }); }} style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', marginBottom: '0.5rem' }}>
                  <option value="">Select a contact or enter email below</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>)}
                </select>
                <input type="email" value={composeForm.to} onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })} placeholder="Or enter email address" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Subject</label>
                <input type="text" value={composeForm.subject} onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Message</label>
                <textarea value={composeForm.body} onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })} required rows={10} style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: '500', color: '#F0F0F5' }}>Signature</label>
                  <button type="button" onClick={() => setShowSignatureModal(true)} style={{ background: 'none', border: 'none', color: '#00CCEE', cursor: 'pointer', fontSize: '0.85rem' }}>Manage Signatures</button>
                </div>
                <select value={selectedSignatureId} onChange={(e) => setSelectedSignatureId(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', background: '#13131A', color: '#F0F0F5' }}>
                  <option value="">No signature</option>
                  {signatures.map(s => <option key={s.id} value={s.id}>{s.name}{s.isDefault ? ' (Default)' : ''}</option>)}
                </select>
                {selectedSignatureId && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#13131A', borderRadius: '6px', fontSize: '0.85rem', color: '#8888A0', whiteSpace: 'pre-wrap' }}>
                    {signatures.find(s => s.id === selectedSignatureId)?.body}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowComposeModal(false)} style={{ padding: '0.75rem 1.5rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={sending} style={{ padding: '0.75rem 1.5rem', background: sending ? '#8888A0' : 'linear-gradient(135deg, #00CCEE 0%, #0099BB 100%)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: sending ? 'not-allowed' : 'pointer' }}>{sending ? 'Sending...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Upload size={14} /> Send Email</span>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signature Management Modal */}
      {showSignatureModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', width: '700px', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#F0F0F5' }}>Email Signatures</h2>
              <button onClick={() => { setShowSignatureModal(false); setEditingSignature(null); setSignatureForm({ name: '', body: '', isDefault: false }); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#F0F0F5' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {/* Signature List */}
              {!editingSignature && signatureForm.name === '' && (
                <>
                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#8888A0' }}>{signatures.length} signature{signatures.length !== 1 ? 's' : ''}</span>
                    <button onClick={() => setSignatureForm({ name: '', body: '', isDefault: signatures.length === 0 })} style={{ padding: '0.5rem 1rem', background: '#00CCEE', color: '#13131A', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>+ New Signature</button>
                  </div>
                  {signatures.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#8888A0' }}>
                      <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p>No signatures yet</p>
                      <p style={{ fontSize: '0.85rem' }}>Create your first email signature to auto-append to outgoing emails</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {signatures.map(sig => (
                        <div key={sig.id} style={{ background: '#13131A', borderRadius: '8px', padding: '1rem', border: sig.isDefault ? '2px solid #00CCEE' : '1px solid #2A2A38' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <span style={{ fontWeight: '600', color: '#F0F0F5' }}>{sig.name}</span>
                              {sig.isDefault && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#00CCEE', color: '#13131A', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>DEFAULT</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {!sig.isDefault && (
                                <button onClick={() => handleSetDefaultSignature(sig.id)} title="Set as default" style={{ padding: '0.35rem', background: 'transparent', border: '1px solid #2A2A38', borderRadius: '4px', cursor: 'pointer', color: '#8888A0' }}>
                                  <Check size={14} />
                                </button>
                              )}
                              <button onClick={() => { setEditingSignature(sig); setSignatureForm({ name: sig.name, body: sig.body, isDefault: sig.isDefault }); }} style={{ padding: '0.35rem', background: 'transparent', border: '1px solid #2A2A38', borderRadius: '4px', cursor: 'pointer', color: '#8888A0' }}>Edit</button>
                              <button onClick={() => handleDeleteSignature(sig.id)} style={{ padding: '0.35rem', background: 'transparent', border: '1px solid #2A2A38', borderRadius: '4px', cursor: 'pointer', color: '#00CCEE' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#8888A0', whiteSpace: 'pre-wrap', maxHeight: '80px', overflow: 'hidden' }}>{sig.body}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Create/Edit Signature Form */}
              {(editingSignature || signatureForm.name !== '' || signatures.length === 0 && signatureForm.body === '') && signatureForm.name !== '' && (
                <div>
                  <button onClick={() => { setEditingSignature(null); setSignatureForm({ name: '', body: '', isDefault: false }); }} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#00CCEE', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>← Back to list</button>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Signature Name</label>
                    <input type="text" value={signatureForm.name} onChange={(e) => setSignatureForm({ ...signatureForm, name: e.target.value })} placeholder="e.g., Jonathan White - Zander" style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', background: '#13131A', color: '#F0F0F5' }} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Signature Content</label>
                    <textarea value={signatureForm.body} onChange={(e) => setSignatureForm({ ...signatureForm, body: e.target.value })} placeholder="Best regards,&#10;Jonathan White&#10;Co-Founder & CEO&#10;jonathan@zanderos.com" rows={6} style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', background: '#13131A', color: '#F0F0F5', resize: 'vertical' }} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={signatureForm.isDefault} onChange={(e) => setSignatureForm({ ...signatureForm, isDefault: e.target.checked })} style={{ accentColor: '#00CCEE' }} />
                      <span style={{ color: '#F0F0F5' }}>Set as default signature</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => { setEditingSignature(null); setSignatureForm({ name: '', body: '', isDefault: false }); }} style={{ padding: '0.75rem 1.5rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', cursor: 'pointer', color: '#F0F0F5' }}>Cancel</button>
                    <button onClick={handleSaveSignature} disabled={savingSignature || !signatureForm.name || !signatureForm.body} style={{ padding: '0.75rem 1.5rem', background: savingSignature || !signatureForm.name || !signatureForm.body ? '#8888A0' : '#00CCEE', color: '#13131A', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: savingSignature || !signatureForm.name || !signatureForm.body ? 'not-allowed' : 'pointer' }}>
                      {savingSignature ? 'Saving...' : editingSignature ? 'Update Signature' : 'Create Signature'}
                    </button>
                  </div>
                </div>
              )}

              {/* Initial empty form state */}
              {!editingSignature && signatureForm.name === '' && signatures.length === 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Signature Name</label>
                    <input type="text" value={signatureForm.name} onChange={(e) => setSignatureForm({ ...signatureForm, name: e.target.value })} placeholder="e.g., Jonathan White - Zander" style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', background: '#13131A', color: '#F0F0F5' }} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Signature Content</label>
                    <textarea value={signatureForm.body} onChange={(e) => setSignatureForm({ ...signatureForm, body: e.target.value })} placeholder="Best regards,&#10;Jonathan White&#10;Co-Founder & CEO&#10;jonathan@zanderos.com" rows={6} style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', background: '#13131A', color: '#F0F0F5', resize: 'vertical' }} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={signatureForm.isDefault} onChange={(e) => setSignatureForm({ ...signatureForm, isDefault: e.target.checked })} style={{ accentColor: '#00CCEE' }} />
                      <span style={{ color: '#F0F0F5' }}>Set as default signature</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSaveSignature} disabled={savingSignature || !signatureForm.name || !signatureForm.body} style={{ padding: '0.75rem 1.5rem', background: savingSignature || !signatureForm.name || !signatureForm.body ? '#8888A0' : '#00CCEE', color: '#13131A', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: savingSignature || !signatureForm.name || !signatureForm.body ? 'not-allowed' : 'pointer' }}>
                      {savingSignature ? 'Saving...' : 'Create Signature'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SMS Compose Modal */}
      {showSmsCompose && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={20} /> New SMS</h2>
              <button onClick={() => setShowSmsCompose(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSendSms} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>To</label>
                <select 
                  value={smsForm.contactId} 
                  onChange={(e) => { 
                    const c = contacts.find(x => x.id === e.target.value); 
                    setSmsForm({ ...smsForm, contactId: e.target.value, to: (c as any)?.phone || smsForm.to }); 
                  }} 
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', marginBottom: '0.5rem' }}
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
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }} 
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: '500', color: '#F0F0F5' }}>Message</label>
                  <span style={{ fontSize: '0.75rem', color: smsForm.body.length > 160 ? '#00CCEE' : '#8888A0' }}>
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
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', resize: 'vertical' }} 
                />
                <p style={{ fontSize: '0.75rem', color: '#8888A0', marginTop: '0.5rem' }}>
                  SMS messages over 160 characters will be sent as multiple segments
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowSmsCompose(false)} style={{ padding: '0.75rem 1.5rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={sendingSms || !smsForm.to || !smsForm.body} style={{ padding: '0.75rem 1.5rem', background: sendingSms || !smsForm.to || !smsForm.body ? '#8888A0' : 'linear-gradient(135deg, #27AE60 0%, #219a52 100%)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: sendingSms || !smsForm.to || !smsForm.body ? 'not-allowed' : 'pointer' }}>
                  {sendingSms ? 'Sending...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><MessageSquare size={14} /> Send SMS</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Log Call Modal */}
      {showLogCall && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', width: '550px', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={20} /> Log Call</h2>
              <button onClick={() => setShowLogCall(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleLogCall} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Call Type *</label>
                  <select
                    value={callForm.type}
                    onChange={(e) => setCallForm({ ...callForm, type: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
                  >
                    <option value="manual_call">📞 Manual Call</option>
                    <option value="online_meeting">🎥 Online Meeting</option>
                    <option value="voicemail_drop">📱 Voicemail Drop</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Direction *</label>
                  <select
                    value={callForm.direction}
                    onChange={(e) => setCallForm({ ...callForm, direction: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
                  >
                    <option value="outbound">📤 Outbound</option>
                    <option value="inbound">📥 Inbound</option>
                  </select>
                </div>
              </div>
              
              {callForm.type === 'online_meeting' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Platform</label>
                  <select
                    value={callForm.platform}
                    onChange={(e) => setCallForm({ ...callForm, platform: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Contact</label>
                <select
                  value={callForm.contactId}
                  onChange={(e) => {
                    const c = contacts.find(x => x.id === e.target.value);
                    setCallForm({ ...callForm, contactId: e.target.value, toNumber: (c as any)?.phone || callForm.toNumber });
                  }}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', marginBottom: '0.5rem' }}
                >
                  <option value="">Select a contact or enter number below</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
                <input
                  type="tel"
                  value={callForm.toNumber}
                  onChange={(e) => setCallForm({ ...callForm, toNumber: e.target.value })}
                  placeholder="Phone number (optional)"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Duration (minutes)</label>
                  <input
                    type="number"
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                    placeholder="e.g., 15"
                    min="0"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Outcome</label>
                  <select
                    value={callForm.outcome}
                    onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Notes</label>
                <textarea
                  value={callForm.notes}
                  onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                  rows={4}
                  placeholder="Call summary, action items, follow-up needed..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowLogCall(false)} style={{ padding: '0.75rem 1.5rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={savingCall || !callForm.type} style={{ padding: '0.75rem 1.5rem', background: savingCall || !callForm.type ? '#8888A0' : 'linear-gradient(135deg, #9B59B6 0%, #8e44ad 100%)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: savingCall || !callForm.type ? 'not-allowed' : 'pointer' }}>
                  {savingCall ? 'Saving...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={14} /> Log Call</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleMeeting && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', width: '500px', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Video size={20} /> Schedule Assembly</h2>
              <button onClick={() => setShowScheduleMeeting(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}>×</button>
            </div>
            <form onSubmit={handleScheduleMeeting} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Platform *</label>
                <select
                  value={meetingForm.platform}
                  onChange={(e) => setMeetingForm({ ...meetingForm, platform: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
                >
                  <option value="zoom">📹 Zoom</option>
                  <option value="google_meet">🎦 Google Meet</option>
                  <option value="teams">👥 Microsoft Teams</option>
                  <option value="other">🔗 Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Meeting URL *</label>
                <input
                  type="url"
                  value={meetingForm.meetingUrl}
                  onChange={(e) => setMeetingForm({ ...meetingForm, meetingUrl: e.target.value })}
                  placeholder="https://zoom.us/j/123456789 or meet.google.com/abc-defg-hij"
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Scheduled Date & Time *</label>
                <input
                  type="datetime-local"
                  value={meetingForm.scheduledAt}
                  onChange={(e) => setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Contact (Optional)</label>
                <select
                  value={meetingForm.contactId}
                  onChange={(e) => setMeetingForm({ ...meetingForm, contactId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px' }}
                >
                  <option value="">-- Select Contact --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} - {c.email}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#F0F0F5' }}>Notes / Agenda</label>
                <textarea
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Meeting agenda, topics to discuss, preparation needed..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowScheduleMeeting(false)} style={{ padding: '0.75rem 1.5rem', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={savingMeeting} style={{ padding: '0.75rem 1.5rem', background: savingMeeting ? '#8888A0' : 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: savingMeeting ? 'not-allowed' : 'pointer' }}>
                  {savingMeeting ? 'Scheduling...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Video size={14} /> Schedule Assembly</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call Details Modal */}
      {showCallDetails && selectedCall && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #13131A 0%, #1C1C26 100%)', borderRadius: '12px 12px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={20} /> Call Details</h2>
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
                  <div style={{ fontSize: '0.7rem', color: '#8888A0', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Type</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>{selectedCall.type === 'online_meeting' ? <><Video size={14} /> Online Meeting</> : selectedCall.type === 'voicemail_drop' ? <><Voicemail size={14} /> Voicemail</> : <><Phone size={14} /> Phone Call</>}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#8888A0', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Duration</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedCall.duration ? Math.floor(selectedCall.duration / 60) + 'm ' + (selectedCall.duration % 60) + 's' : 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#8888A0', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: selectedCall.status === 'completed' ? '#27ae60' : selectedCall.status === 'scheduled' ? '#1976d2' : '#666' }}>{selectedCall.status || 'Unknown'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#8888A0', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Direction</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>{selectedCall.direction === 'inbound' ? <><Download size={14} /> Inbound</> : <><Upload size={14} /> Outbound</>}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#8888A0', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Outcome</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedCall.outcome || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#8888A0', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{new Date(selectedCall.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Notes */}
              {selectedCall.notes && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#F0F0F5', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><FileText size={14} /> Notes</h3>
                  <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.6' }}>{selectedCall.notes}</div>
                </div>
              )}

              {/* Audio Recording Player */}
              {selectedCall.recordingUrl && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#F0F0F5', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Headphones size={16} /> Call Recording
                    <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>AUDIO</span>
                  </h3>
                  <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: '12px' }}>
                    <audio
                      controls
                      src={selectedCall.recordingUrl}
                      style={{ width: '100%', height: '40px' }}
                      controlsList="nodownload"
                    >
                      Your browser does not support audio playback.
                    </audio>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                      <span>Duration: {selectedCall.duration ? Math.floor(selectedCall.duration / 60) + ':' + String(selectedCall.duration % 60).padStart(2, '0') : 'Unknown'}</span>
                      <a href={selectedCall.recordingUrl} download style={{ color: '#90caf9', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Download size={12} /> Download</a>
                    </div>
                    {/* Transcribe Button */}
                    <button
                      onClick={async () => {
                        setTranscribingAudio(true);
                        try {
                          const token = localStorage.getItem('zander_token');
                          const res = await fetch('https://api.zanderos.com/call-logs/' + selectedCall.id + '/transcribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setTranscriptText(data.transcription);
                            setSelectedCall({ ...selectedCall, transcription: data.transcription });
                            setCallLogs(callLogs.map(c => c.id === selectedCall.id ? { ...c, transcription: data.transcription } : c));
                            // Auto-chain to AI Summary generation
                            setGeneratingSummary(true);
                            try {
                              const summaryRes = await fetch('https://api.zanderos.com/call-logs/' + selectedCall.id + '/generate-summary', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                                body: JSON.stringify({ transcript: data.transcription })
                              });
                              if (summaryRes.ok) {
                                const summaryData = await summaryRes.json();
                                setSelectedCall(prev => prev ? { ...prev, transcription: data.transcription, aiSummary: summaryData.aiSummary } : null);
                                setCallLogs(prev => prev.map(c => c.id === selectedCall.id ? { ...c, transcription: data.transcription, aiSummary: summaryData.aiSummary } : c));
                              }
                            } catch (summaryErr) {
                              console.error('Auto-summary error:', summaryErr);
                            }
                            setGeneratingSummary(false);
                          } else {
                            const err = await res.text();
                            console.error('Transcribe error:', err);
                            alert('Failed to transcribe recording. Please try again.');
                          }
                        } catch (err) {
                          console.error('Transcribe error:', err);
                          alert('Error transcribing recording');
                        }
                        setTranscribingAudio(false);
                      }}
                      disabled={transcribingAudio}
                      style={{ width: '100%', marginTop: '0.75rem', padding: '0.6rem', background: transcribingAudio ? '#555' : 'linear-gradient(135deg, #00b894 0%, #00a085 100%)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', cursor: transcribingAudio ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      {transcribingAudio ? <><Mic size={14} /> Transcribing...</> : generatingSummary ? <><Bot size={14} /> Generating Summary...</> : <><Mic size={14} /> Transcribe & Summarize</>}
                    </button>
                  </div>
                </div>
              )}
              {/* Transcript Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#F0F0F5', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><FileText size={14} /> Transcript / Meeting Notes</h3>
                <textarea
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Paste your call transcript, Zoom transcript export, meeting notes, or key points here..."
                  style={{ width: '100%', minHeight: '150px', padding: '1rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.6', resize: 'vertical' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#8888A0', marginTop: '0.5rem' }}>
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
                    const res = await fetch('https://api.zanderos.com/call-logs/' + selectedCall.id + '/generate-summary', {
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
                {generatingSummary ? <><Bot size={14} /> Generating Summary...</> : <><Bot size={14} /> Generate AI Summary</>}
              </button>

              {/* AI Summary Display */}
              {selectedCall.aiSummary && (
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#F0F0F5', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>AI</span>
                    Summary
                  </h3>
                  <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {selectedCall.aiSummary}
                  </div>
                  {/* Share Summary Button */}
                  <button
                    onClick={() => setShowShareModal(true)}
                    style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Share2 size={14} /> Share Summary</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  if (confirm('Delete this call log?')) {
                    fetch(process.env.NEXT_PUBLIC_API_URL + '/call-logs/' + selectedCall.id, {
                      method: 'DELETE',
                      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('zander_token') }
                    }).then(() => {
                      setCallLogs(prev => prev.filter(c => c.id !== selectedCall.id));
                      setShowCallDetails(false);
                      setSelectedCall(null);
                    }).catch(err => console.error('Delete call error:', err));
                  }
                }}
                style={{ padding: '0.5rem 1.5rem', background: 'transparent', color: '#00CCEE', border: '1px solid #00CCEE', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
              >
                <Trash2 size={14} /> Delete
              </button>
              <button onClick={() => setShowCallDetails(false)} style={{ padding: '0.5rem 1.5rem', background: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Summary Modal */}
      {showShareModal && selectedCall && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Share2 size={20} /> Share Call Summary</h2>
              <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                {selectedCall.contact ? selectedCall.contact.firstName + ' ' + selectedCall.contact.lastName : 'Unknown Contact'} - {new Date(selectedCall.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#F0F0F5' }}>Recipients (comma-separated emails)</label>
                <input
                  type="text"
                  placeholder="john@company.com, jane@company.com"
                  value={sharingEmails.join(', ')}
                  onChange={(e) => setSharingEmails(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '6px', fontSize: '0.95rem' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#F0F0F5' }}>Quick Add</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedCall.contact?.email && (
                    <button onClick={() => setSharingEmails(prev => { const email = selectedCall.contact?.email; return email && !prev.includes(email) ? [...prev, email] : prev; })} style={{ padding: '0.4rem 0.8rem', background: '#e8f4fd', border: '1px solid #3498db', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', color: '#2980b9' }}>
                      + {selectedCall.contact.firstName} (Client)
                    </button>
                  )}
                  <button onClick={() => setSharingEmails(prev => prev.includes('jonathan@sixtyfourwest.com') ? prev : [...prev, 'jonathan@sixtyfourwest.com'])} style={{ padding: '0.4rem 0.8rem', background: '#e8f4fd', border: '1px solid #3498db', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', color: '#2980b9' }}>
                    + Jonathan (Team)
                  </button>
                  <button onClick={() => setSharingEmails(prev => prev.includes('dave@sixtyfourwest.com') ? prev : [...prev, 'dave@sixtyfourwest.com'])} style={{ padding: '0.4rem 0.8rem', background: '#e8f4fd', border: '1px solid #3498db', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', color: '#2980b9' }}>
                    + Dave (Team)
                  </button>
                </div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', maxHeight: '150px', overflow: 'auto', fontSize: '0.85rem', color: '#666' }}>
                <strong>Preview:</strong><br/>
                Subject: Call Summary - {selectedCall.contact ? selectedCall.contact.firstName + ' ' + selectedCall.contact.lastName : 'Unknown'}<br/><br/>
                {selectedCall.aiSummary ? selectedCall.aiSummary.substring(0, 200) + '...' : 'No summary available'}
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => { setShowShareModal(false); setSharingEmails([]); }} style={{ padding: '0.5rem 1.5rem', background: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (sharingEmails.length === 0) {
                    alert('Please add at least one recipient');
                    return;
                  }
                  setSendingSummary(true);
                  try {
                    const token = localStorage.getItem('zander_token');
                    const res = await fetch('https://api.zanderos.com/call-logs/' + selectedCall.id + '/share-summary', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                      body: JSON.stringify({ recipients: sharingEmails })
                    });
                    if (res.ok) {
                      alert('Summary shared successfully!');
                      setShowShareModal(false);
                      setSharingEmails([]);
                    } else {
                      alert('Failed to share summary');
                    }
                  } catch (err) {
                    console.error('Share error:', err);
                    alert('Error sharing summary');
                  }
                  setSendingSummary(false);
                }}
                disabled={sendingSummary || sharingEmails.length === 0}
                style={{ padding: '0.5rem 1.5rem', background: sendingSummary ? '#ccc' : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: sendingSummary ? 'not-allowed' : 'pointer', fontWeight: '600' }}
              >
                {sendingSummary ? 'Sending...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={14} /> Send Summary</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TREASURY MODAL */}
      {showTreasuryModal && (
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
            width: '90%',
            maxWidth: '900px',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #00CCEE 0%, #0099BB 100%)',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, color: '#F0F0F5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Landmark size={16} /> The Treasury
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#F0F0F5', opacity: 0.8, fontSize: '0.9rem' }}>
                  Pre-built campaign templates ready to customize
                </p>
              </div>
              <button
                onClick={() => setShowTreasuryModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#F0F0F5'
                }}
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #2A2A38', background: '#f8f9fa' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Category</label>
                  <select
                    value={treasuryFilter.category}
                    onChange={(e) => setTreasuryFilter({ ...treasuryFilter, category: e.target.value })}
                    style={{ padding: '0.5rem', border: '1px solid #2A2A38', borderRadius: '6px', minWidth: '150px' }}
                  >
                    <option value="">All Categories</option>
                    <option value="sales">Sales & Revenue</option>
                    <option value="operations">Operations</option>
                    <option value="finance">Finance</option>
                    <option value="hr">Team & HR</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Executive</label>
                  <select
                    value={treasuryFilter.executive}
                    onChange={(e) => setTreasuryFilter({ ...treasuryFilter, executive: e.target.value })}
                    style={{ padding: '0.5rem', border: '1px solid #2A2A38', borderRadius: '6px', minWidth: '120px' }}
                  >
                    <option value="">All</option>
                    <option value="CRO">CRO</option>
                    <option value="COO">COO</option>
                    <option value="CFO">CFO</option>
                    <option value="CMO">CMO</option>
                    <option value="CPO">CPO</option>
                    <option value="CIO">CIO</option>
                    <option value="EA">EA</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Industry</label>
                  <select
                    value={treasuryFilter.industry}
                    onChange={(e) => setTreasuryFilter({ ...treasuryFilter, industry: e.target.value })}
                    style={{ padding: '0.5rem', border: '1px solid #2A2A38', borderRadius: '6px', minWidth: '150px' }}
                  >
                    <option value="">All Industries</option>
                    <option value="cabinet_millwork">Cabinet & Millwork</option>
                    <option value="home_services">Home Services</option>
                    <option value="professional_services">Professional Services</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Channels</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['email', 'sms', 'phone'].map((ch) => (
                      <button
                        key={ch}
                        onClick={() => {
                          const channels = treasuryFilter.channels.includes(ch)
                            ? treasuryFilter.channels.filter(c => c !== ch)
                            : [...treasuryFilter.channels, ch];
                          setTreasuryFilter({ ...treasuryFilter, channels });
                        }}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: treasuryFilter.channels.includes(ch) ? '#13131A' : 'white',
                          color: treasuryFilter.channels.includes(ch) ? 'white' : '#13131A',
                          border: '1px solid #2A2A38',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>{ch === 'email' ? <Mail size={12} /> : ch === 'sms' ? <MessageSquare size={12} /> : <Phone size={12} />} {ch}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
              {treasuryLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#8888A0' }}>
                  Loading treasury items...
                </div>
              ) : treasuryItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ marginBottom: '1rem' }}><Landmark size={48} /></div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#F0F0F5' }}>No Templates Found</h3>
                  <p style={{ color: '#8888A0' }}>
                    {treasuryFilter.category || treasuryFilter.executive || treasuryFilter.industry || treasuryFilter.channels.length > 0
                      ? 'Try adjusting your filters to see more templates'
                      : 'Campaign templates will appear here as they are added'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {treasuryItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#1C1C26',
                        border: '2px solid #2A2A38',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00CCEE';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(240, 179, 35, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#2A2A38';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                        <h4 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem' }}>{item.name}</h4>
                        {item.executive && (
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            background: 'rgba(12, 35, 64, 0.1)',
                            color: '#F0F0F5',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: '600'
                          }}>
                            {item.executive}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p style={{ color: '#8888A0', fontSize: '0.85rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                          {item.description}
                        </p>
                      )}

                      {/* Channel badges */}
                      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {item.channels.map((ch) => (
                          <span
                            key={ch}
                            style={{
                              padding: '0.2rem 0.5rem',
                              background: ch === 'email' ? 'rgba(191, 10, 48, 0.1)' : ch === 'sms' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(12, 35, 64, 0.1)',
                              color: ch === 'email' ? '#00CCEE' : ch === 'sms' ? '#27AE60' : '#13131A',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              fontWeight: '600'
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>{ch === 'email' ? <Mail size={12} /> : ch === 'sms' ? <MessageSquare size={12} /> : <Phone size={12} />} {ch}</span>
                          </span>
                        ))}
                      </div>

                      {/* Meta info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #2A2A38' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          {item.stepCount && (
                            <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>{item.stepCount} steps</span>
                          )}
                          {item.duration && (
                            <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>{item.duration}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddFromTreasury(item)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#00CCEE',
                            color: '#F0F0F5',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
    </AuthGuard>
  );
}
