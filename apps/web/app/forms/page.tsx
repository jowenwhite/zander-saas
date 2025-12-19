'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';

interface Form {
  id: string;
  name: string;
  description: string;
  fields: any[];
  settings: any;
  status: 'active' | 'draft';
  category?: string;
  createdAt: string;
  updatedAt: string;
  _count: { submissions: number };
}

interface FormSubmission {
  id: string;
  formId: string;
  data: any;
  contactId?: string;
  createdAt: string;
  contact?: { firstName: string; lastName: string; email: string };
}

interface FormTemplate {
  name: string;
  description: string;
  category: string;
  fields: number;
  status: 'active' | 'draft';
}

interface IndustryPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'available' | 'coming_soon';
  forms: FormTemplate[];
}

const industryPacks: IndustryPack[] = [
  { 
    id: 'trades', 
    name: 'Trades & Contractors', 
    description: 'Construction, renovation, cabinet makers, and skilled trades', 
    icon: '🔨', 
    status: 'available',
    forms: [
      // Discovery & Qualification
      { name: 'Discovery Call Script', description: 'Structured qualification process to identify qualified leads', category: 'Discovery & Qualification', fields: 12, status: 'active' },
      { name: 'Lead Qualification Form', description: 'Quick assessment of lead quality and fit', category: 'Discovery & Qualification', fields: 8, status: 'active' },
      // Client Intake
      { name: 'Client Onboarding Survey', description: 'Detailed intake capturing project requirements and preferences', category: 'Client Intake', fields: 25, status: 'active' },
      { name: 'Requirements Gathering', description: 'Technical and business requirements documentation', category: 'Client Intake', fields: 20, status: 'active' },
      // Proposals & Quotes
      { name: 'Project Proposal', description: 'Formal project proposal with scope and pricing', category: 'Proposals & Quotes', fields: 15, status: 'active' },
      { name: 'Quote/Estimate', description: 'Itemized pricing estimate for services', category: 'Proposals & Quotes', fields: 10, status: 'active' },
      { name: 'Service Agreement', description: 'Terms and conditions for engagement', category: 'Proposals & Quotes', fields: 8, status: 'active' },
      // Project Delivery
      { name: 'Change Order', description: 'Document scope changes and approvals', category: 'Project Delivery', fields: 12, status: 'active' },
      { name: 'Progress Update', description: 'Project milestone and status updates', category: 'Project Delivery', fields: 6, status: 'active' },
      { name: 'Delivery Checklist', description: 'Final delivery verification checklist', category: 'Project Delivery', fields: 20, status: 'active' },
      // Post-Sale & Service
      { name: 'Satisfaction Survey', description: 'Post-project client satisfaction feedback', category: 'Post-Sale & Service', fields: 10, status: 'active' },
      { name: 'Service Request', description: 'Ongoing service and support requests', category: 'Post-Sale & Service', fields: 8, status: 'active' },
      { name: 'Warranty Claim', description: 'Warranty service documentation', category: 'Post-Sale & Service', fields: 12, status: 'draft' },
    ]
  },
  {
    id: 'professional',
    name: 'Professional Services',
    description: 'Consulting, coaching, accounting, legal, and professional service providers',
    icon: '💼',
    status: 'available',
    forms: [
      // Discovery & Qualification
      { name: 'Discovery Call Script', description: 'Structured conversation guide for initial prospect calls', category: 'Discovery & Qualification', fields: 15, status: 'active' },
      { name: 'Prospect Qualification', description: 'Assess prospect fit, budget, timeline, and decision-making authority', category: 'Discovery & Qualification', fields: 12, status: 'active' },
      { name: 'Needs Assessment', description: 'Comprehensive analysis of client challenges and desired outcomes', category: 'Discovery & Qualification', fields: 18, status: 'active' },
      // Client Intake
      { name: 'Client Onboarding Form', description: 'Essential client information, contacts, and billing details', category: 'Client Intake', fields: 22, status: 'active' },
      { name: 'Project Scope Worksheet', description: 'Define deliverables, milestones, and success criteria', category: 'Client Intake', fields: 16, status: 'active' },
      { name: 'Stakeholder Map', description: 'Identify key decision makers, influencers, and project contacts', category: 'Client Intake', fields: 10, status: 'active' },
      // Proposals & Agreements
      { name: 'Service Proposal', description: 'Professional proposal with scope, approach, timeline, and investment', category: 'Proposals & Quotes', fields: 20, status: 'active' },
      { name: 'Statement of Work', description: 'Detailed SOW with deliverables, responsibilities, and terms', category: 'Proposals & Quotes', fields: 18, status: 'active' },
      { name: 'Engagement Agreement', description: 'Master services agreement with terms and conditions', category: 'Proposals & Quotes', fields: 14, status: 'active' },
      // Project Delivery
      { name: 'Project Status Update', description: 'Weekly or monthly progress report template', category: 'Project Delivery', fields: 10, status: 'active' },
      { name: 'Meeting Notes and Actions', description: 'Capture meeting outcomes, decisions, and action items', category: 'Project Delivery', fields: 8, status: 'active' },
      { name: 'Change Request', description: 'Document scope changes with impact assessment and approval', category: 'Project Delivery', fields: 12, status: 'active' },
      // Post-Engagement
      { name: 'Client Satisfaction Survey', description: 'Measure NPS, satisfaction, and gather testimonials', category: 'Post-Sale & Service', fields: 12, status: 'active' },
      { name: 'Referral Request', description: 'Structured ask for referrals and introductions', category: 'Post-Sale & Service', fields: 6, status: 'active' },
    ]
  },
  {
    id: 'agency',
    name: 'Agency Pack',
    description: 'Marketing, creative, and digital agencies',
    icon: '🎨',
    status: 'available',
    forms: [
      { name: 'Creative Brief', description: 'Project creative direction and requirements', category: 'Client Intake', fields: 20, status: 'active' },
      { name: 'Campaign Intake', description: 'Marketing campaign requirements gathering', category: 'Client Intake', fields: 16, status: 'active' },
      { name: 'Brand Questionnaire', description: 'Brand identity and guidelines discovery', category: 'Discovery & Qualification', fields: 25, status: 'active' },
      { name: 'Revision Request', description: 'Client revision and feedback submission', category: 'Project Delivery', fields: 8, status: 'active' },
      { name: 'Project Approval', description: 'Final deliverable sign-off', category: 'Project Delivery', fields: 6, status: 'active' },
    ]
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    description: 'Agents, brokers, and property management',
    icon: '🏠',
    status: 'coming_soon',
    forms: []
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical practices and wellness providers',
    icon: '🏥',
    status: 'coming_soon',
    forms: []
  },
];

export default function FormsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'library' | 'submissions' | 'packs'>('library');
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', description: '', status: 'draft', category: '' });
  const [saving, setSaving] = useState(false);
  const [activatingPack, setActivatingPack] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const API_URL = 'https://api.zander.mcfapp.com';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('zander_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/forms`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch forms');
      const data = await response.json();
      setForms(data);
      setError(null);
    } catch (err) {
      setError('Failed to load forms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchAllSubmissions();
    }
  }, [activeTab, forms]);

  const fetchAllSubmissions = async () => {
    if (forms.length === 0) return;
    try {
      setSubmissionsLoading(true);
      const allSubmissions: any[] = [];
      for (const form of forms) {
        const response = await fetch(`${API_URL}/forms/${form.id}/submissions`, {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          allSubmissions.push(...data.map((s: any) => ({ ...s, formName: form.name })));
        }
      }
      setSubmissions(allSubmissions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!newForm.name.trim()) return;
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/forms`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newForm.name,
          description: newForm.description,
          fields: [],
          settings: { category: newForm.category },
          status: newForm.status
        })
      });
      if (!response.ok) throw new Error('Failed to create form');
      const created = await response.json();
      setForms([...forms, { ...created, _count: { submissions: 0 } }]);
      setShowCreateModal(false);
      setNewForm({ name: '', description: '', status: 'draft', category: '' });
    } catch (err) {
      alert('Failed to create form');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    try {
      const response = await fetch(`${API_URL}/forms/${formId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete form');
      setForms(forms.filter(f => f.id !== formId));
    } catch (err) {
      alert('Failed to delete form');
    }
  };

  const handleToggleStatus = async (form: Form) => {
    const newStatus = form.status === 'active' ? 'draft' : 'active';
    try {
      const response = await fetch(`${API_URL}/forms/${form.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update form');
      setForms(forms.map(f => f.id === form.id ? { ...f, status: newStatus } : f));
    } catch (err) {
      alert('Failed to update form status');
    }
  };

  const handleActivatePack = async (pack: IndustryPack) => {
    if (pack.status === 'coming_soon') {
      alert(`${pack.name} pack coming soon!`);
      return;
    }
    
    const existingNames = forms.map(f => f.name.toLowerCase());
    const newForms = pack.forms.filter(f => !existingNames.includes(f.name.toLowerCase()));
    
    if (newForms.length === 0) {
      alert(`All forms from ${pack.name} pack are already in your library!`);
      return;
    }
    
    if (!confirm(`Add ${newForms.length} forms from ${pack.name} pack to your library?\n\n${newForms.map(f => '• ' + f.name).join('\n')}`)) {
      return;
    }
    
    setActivatingPack(pack.id);
    
    try {
      const createdForms: Form[] = [];
      for (const template of newForms) {
        const response = await fetch(`${API_URL}/forms`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: template.name,
            description: template.description,
            fields: Array(template.fields).fill(null).map((_, i) => ({ id: `field_${i}`, type: 'text', label: `Field ${i + 1}` })),
            settings: { category: template.category, pack: pack.id },
            status: template.status
          })
        });
        if (response.ok) {
          const created = await response.json();
          createdForms.push({ ...created, _count: { submissions: 0 } });
        }
      }
      setForms([...forms, ...createdForms]);
      alert(`Successfully added ${createdForms.length} forms from ${pack.name} pack!`);
      setActiveTab('library');
    } catch (err) {
      alert('Failed to activate pack. Some forms may have been created.');
    } finally {
      setActivatingPack(null);
    }
  };

  // Group forms by category
  const groupedForms = forms.reduce((acc, form) => {
    const category = form.settings?.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(form);
    return acc;
  }, {} as Record<string, Form[]>);

  const categoryOrder = ['Discovery & Qualification', 'Client Intake', 'Proposals & Quotes', 'Project Delivery', 'Post-Sale & Service', 'Uncategorized'];
  const sortedCategories = Object.keys(groupedForms).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const categoryIcons: Record<string, string> = {
    'Discovery & Qualification': '🔍',
    'Client Intake': '📝',
    'Proposals & Quotes': '💰',
    'Project Delivery': '📦',
    'Post-Sale & Service': '⭐',
    'Uncategorized': '📋'
  };

  const totalForms = forms.length;
  const activeForms = forms.filter(f => f.status === 'active').length;
  const totalSubmissions = forms.reduce((sum, f) => sum + (f._count?.submissions || 0), 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--zander-navy)',
                  background: 'transparent'
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
              { icon: '📧', label: 'Email Automation', href: '/automation' },
              { icon: '📋', label: 'Forms', href: '/forms', active: true },
              { icon: '🤖', label: 'AI Assistant', href: '/ai' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: item.active ? 'var(--zander-red)' : 'var(--zander-navy)',
                  background: item.active ? 'rgba(191, 10, 48, 0.1)' : 'transparent',
                  fontWeight: item.active ? '600' : '400'
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
                Forms Management
              </h1>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Create, manage, and track form submissions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--zander-gold)',
                color: 'var(--zander-navy)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              + Create Form
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={{
          background: 'white',
          border: '2px solid var(--zander-border-gray)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)' }}>Forms Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-red)' }}>{loading ? '...' : totalForms}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Total Forms</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#27AE60' }}>{loading ? '...' : activeForms}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Active Forms</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{loading ? '...' : totalSubmissions}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Total Submissions</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-gold)' }}>{sortedCategories.length}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Categories</div>
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
          {/* Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--zander-border-gray)' }}>
            {[
              { id: 'library', label: 'Forms Library', icon: '📚' },
              { id: 'submissions', label: 'Submissions', icon: '📥' },
              { id: 'packs', label: 'Industry Packs', icon: '📦' },
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
            {/* FORMS LIBRARY TAB */}
            {activeTab === 'library' && (
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>
                    Loading forms...
                  </div>
                ) : error ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-red)' }}>
                    {error}
                    <button onClick={fetchForms} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      Retry
                    </button>
                  </div>
                ) : forms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>No Forms Yet</h3>
                    <p style={{ color: 'var(--zander-gray)', marginBottom: '1rem' }}>Get started by activating an Industry Pack or creating a custom form</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => setActiveTab('packs')}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'var(--zander-navy)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Browse Industry Packs
                      </button>
                      <button
                        onClick={() => setShowCreateModal(true)}
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
                        + Create Custom Form
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {sortedCategories.map((category) => (
                      <div key={category} style={{ marginBottom: '1rem' }}>
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.25rem',
                            background: expandedCategory === category ? 'var(--zander-off-white)' : 'white',
                            border: '2px solid var(--zander-border-gray)',
                            borderRadius: expandedCategory === category ? '8px 8px 0 0' : '8px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{categoryIcons[category] || '📋'}</span>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--zander-navy)', fontSize: '1rem' }}>{category}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>
                                {groupedForms[category].length} form{groupedForms[category].length !== 1 ? 's' : ''} • {groupedForms[category].reduce((s, f) => s + (f._count?.submissions || 0), 0)} submissions
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: 'rgba(191, 10, 48, 0.1)',
                              color: 'var(--zander-red)',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {groupedForms[category].length} forms
                            </span>
                            <span style={{ color: 'var(--zander-gray)', transform: expandedCategory === category ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                          </div>
                        </button>
                        {expandedCategory === category && (
                          <div style={{
                            border: '2px solid var(--zander-border-gray)',
                            borderTop: 'none',
                            borderRadius: '0 0 8px 8px',
                            overflow: 'hidden'
                          }}>
                            {groupedForms[category].map((form, index) => (
                              <div
                                key={form.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '1rem 1.25rem',
                                  background: index % 2 === 0 ? 'white' : 'var(--zander-off-white)',
                                  borderBottom: index < groupedForms[category].length - 1 ? '1px solid var(--zander-border-gray)' : 'none'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: '500', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{form.name}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{form.description || 'No description'}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{form.fields?.length || 0} fields</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{form._count?.submissions || 0} submitted</span>
                                  <span
                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(form); }}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: form.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                                      color: form.status === 'active' ? '#27AE60' : 'var(--zander-gray)',
                                      borderRadius: '4px',
                                      fontSize: '0.65rem',
                                      fontWeight: '600',
                                      textTransform: 'uppercase',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {form.status}
                                  </span>
                                  <button
                                    onClick={() => alert(`Form Builder coming soon!\n\nEdit form: ${form.name}`)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      background: 'var(--zander-gold)',
                                      color: 'var(--zander-navy)',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontWeight: '600',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Open Form
                                  </button>
                                  <button
                                    onClick={() => handleDeleteForm(form.id)}
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      background: 'transparent',
                                      color: 'var(--zander-red)',
                                      border: '1px solid var(--zander-red)',
                                      borderRadius: '6px',
                                      fontWeight: '600',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    🗑
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUBMISSIONS TAB */}
            {activeTab === 'submissions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Recent Submissions</h3>
                  <button
                    onClick={() => alert('Export functionality coming soon!')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--zander-navy)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Export All →
                  </button>
                </div>
                {submissionsLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--zander-gray)' }}>
                    Loading submissions...
                  </div>
                ) : submissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>No Submissions Yet</h3>
                    <p style={{ color: 'var(--zander-gray)' }}>Form submissions will appear here</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--zander-navy)', color: 'white' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Form</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Submitted</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Data Preview</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission: any, index) => (
                        <tr key={submission.id} style={{ background: index % 2 === 0 ? 'white' : 'var(--zander-off-white)', borderBottom: '1px solid var(--zander-border-gray)' }}>
                          <td style={{ padding: '1rem', color: 'var(--zander-navy)', fontWeight: '500' }}>{submission.formName || 'Unknown Form'}</td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--zander-gray)' }}>{formatDate(submission.createdAt)}</td>
                          <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--zander-gray)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {JSON.stringify(submission.data).substring(0, 50)}...
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => alert(`Submission Data:\n\n${JSON.stringify(submission.data, null, 2)}`)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--zander-navy)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              👁 View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* INDUSTRY PACKS TAB */}
            {activeTab === 'packs' && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  color: 'white',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Industry Form Packs</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                    Pre-built form collections tailored for specific industries. Click "Activate" to add all forms from a pack to your library.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {industryPacks.map((pack) => (
                    <div
                      key={pack.id}
                      style={{
                        background: 'white',
                        border: '2px solid var(--zander-border-gray)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        opacity: pack.status === 'coming_soon' ? 0.7 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>{pack.icon}</span>
                        {pack.status === 'coming_soon' && (
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(240, 179, 35, 0.2)',
                            color: '#B8860B',
                            borderRadius: '4px',
                            fontSize: '0.6rem',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                          }}>Coming Soon</span>
                        )}
                      </div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)', fontSize: '1.2rem' }}>{pack.name}</h4>
                      <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>{pack.description}</p>
                      
                      {pack.forms.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>
                            Included Forms:
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)', maxHeight: '100px', overflow: 'auto' }}>
                            {pack.forms.slice(0, 5).map((f, i) => (
                              <div key={i} style={{ padding: '0.25rem 0' }}>• {f.name}</div>
                            ))}
                            {pack.forms.length > 5 && (
                              <div style={{ padding: '0.25rem 0', fontStyle: 'italic' }}>+ {pack.forms.length - 5} more...</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--zander-border-gray)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', fontWeight: '600' }}>
                          {pack.forms.length} forms
                        </span>
                        <button
                          onClick={() => handleActivatePack(pack)}
                          disabled={activatingPack === pack.id || pack.status === 'coming_soon'}
                          style={{
                            padding: '0.5rem 1.25rem',
                            background: pack.status === 'coming_soon' ? 'var(--zander-gray)' : activatingPack === pack.id ? 'var(--zander-gray)' : 'var(--zander-red)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: pack.status === 'coming_soon' || activatingPack === pack.id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {activatingPack === pack.id ? 'Adding...' : pack.status === 'coming_soon' ? 'Coming Soon' : 'Activate Pack →'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Form Modal */}
      {showCreateModal && (
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
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)' }}>Create New Form</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                Form Name *
              </label>
              <input
                type="text"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="e.g., Client Intake Form"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                Category
              </label>
              <select
                value={newForm.category}
                onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select Category</option>
                <option value="Discovery & Qualification">Discovery & Qualification</option>
                <option value="Client Intake">Client Intake</option>
                <option value="Proposals & Quotes">Proposals & Quotes</option>
                <option value="Project Delivery">Project Delivery</option>
                <option value="Post-Sale & Service">Post-Sale & Service</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                Description
              </label>
              <textarea
                value={newForm.description}
                onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                placeholder="Brief description of what this form collects..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                Status
              </label>
              <select
                value={newForm.status}
                onChange={(e) => setNewForm({ ...newForm, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: 'var(--zander-gray)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateForm}
                disabled={saving || !newForm.name.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: saving || !newForm.name.trim() ? 'var(--zander-gray)' : 'var(--zander-red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: saving || !newForm.name.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Creating...' : 'Create Form'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
