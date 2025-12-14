'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
import AuthGuard from '../components/AuthGuard';
import { logout } from '../utils/auth';

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: number;
  status: 'active' | 'draft';
  submissions: number;
}

interface FormSubmission {
  id: string;
  formName: string;
  contactName: string;
  contactEmail: string;
  dealName?: string;
  submittedAt: string;
  status: 'complete' | 'partial';
}

interface IndustryPack {
  id: string;
  name: string;
  description: string;
  forms: number;
  icon: string;
  status: 'available' | 'coming_soon';
}

// Sample data - generalized for any business
const formCategories = [
  {
    id: 'discovery',
    name: 'Discovery & Qualification',
    icon: '🔍',
    description: 'Initial client contact and project qualification forms',
    forms: [
      { id: '1', name: 'Discovery Call Script', description: 'Structured qualification process to identify qualified leads', fields: 12, status: 'active' as const, submissions: 24 },
      { id: '2', name: 'Lead Qualification Form', description: 'Quick assessment of lead quality and fit', fields: 8, status: 'active' as const, submissions: 45 },
    ]
  },
  {
    id: 'intake',
    name: 'Client Intake',
    icon: '📝',
    description: 'Comprehensive client onboarding and requirements gathering',
    forms: [
      { id: '3', name: 'Client Onboarding Survey', description: 'Detailed intake capturing project requirements and preferences', fields: 25, status: 'active' as const, submissions: 18 },
      { id: '4', name: 'Requirements Gathering', description: 'Technical and business requirements documentation', fields: 20, status: 'active' as const, submissions: 12 },
    ]
  },
  {
    id: 'proposals',
    name: 'Proposals & Quotes',
    icon: '💰',
    description: 'Project proposals, quotes, and service agreements',
    forms: [
      { id: '5', name: 'Project Proposal', description: 'Formal project proposal with scope and pricing', fields: 15, status: 'active' as const, submissions: 32 },
      { id: '6', name: 'Quote/Estimate', description: 'Itemized pricing estimate for services', fields: 10, status: 'active' as const, submissions: 28 },
      { id: '7', name: 'Service Agreement', description: 'Terms and conditions for engagement', fields: 8, status: 'active' as const, submissions: 22 },
    ]
  },
  {
    id: 'delivery',
    name: 'Project Delivery',
    icon: '📦',
    description: 'Project management and delivery tracking forms',
    forms: [
      { id: '8', name: 'Change Order', description: 'Document scope changes and approvals', fields: 12, status: 'active' as const, submissions: 8 },
      { id: '9', name: 'Progress Update', description: 'Project milestone and status updates', fields: 6, status: 'active' as const, submissions: 15 },
      { id: '10', name: 'Delivery Checklist', description: 'Final delivery verification checklist', fields: 20, status: 'active' as const, submissions: 10 },
    ]
  },
  {
    id: 'postsale',
    name: 'Post-Sale & Service',
    icon: '⭐',
    description: 'Customer satisfaction and ongoing service forms',
    forms: [
      { id: '11', name: 'Satisfaction Survey', description: 'Post-project client satisfaction feedback', fields: 10, status: 'active' as const, submissions: 14 },
      { id: '12', name: 'Service Request', description: 'Ongoing service and support requests', fields: 8, status: 'active' as const, submissions: 6 },
      { id: '13', name: 'Warranty Claim', description: 'Warranty service documentation', fields: 12, status: 'draft' as const, submissions: 0 },
    ]
  },
];

const sampleSubmissions: FormSubmission[] = [
  { id: '1', formName: 'Discovery Call Script', contactName: 'John Doe', contactEmail: 'john@example.com', dealName: 'Website Redesign', submittedAt: '2025-01-14T10:30:00', status: 'complete' },
  { id: '2', formName: 'Client Onboarding Survey', contactName: 'Jane Smith', contactEmail: 'jane@example.com', dealName: 'Marketing Campaign', submittedAt: '2025-01-14T09:15:00', status: 'complete' },
  { id: '3', formName: 'Project Proposal', contactName: 'Bob Wilson', contactEmail: 'bob@example.com', submittedAt: '2025-01-13T16:45:00', status: 'partial' },
  { id: '4', formName: 'Quote/Estimate', contactName: 'Sarah Johnson', contactEmail: 'sarah@example.com', dealName: 'Office Renovation', submittedAt: '2025-01-13T14:20:00', status: 'complete' },
];

const industryPacks: IndustryPack[] = [
  { id: 'professional', name: 'Professional Services', description: 'Consulting, coaching, and professional service providers', forms: 12, icon: '💼', status: 'available' },
  { id: 'agency', name: 'Agency Pack', description: 'Marketing, creative, and digital agencies', forms: 14, icon: '🎨', status: 'available' },
  { id: 'trades', name: 'Trades & Contractors', description: 'Construction, renovation, and skilled trades', forms: 16, icon: '🔨', status: 'available' },
  { id: 'realestate', name: 'Real Estate', description: 'Agents, brokers, and property management', forms: 10, icon: '🏠', status: 'coming_soon' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical practices and wellness providers', forms: 15, icon: '🏥', status: 'coming_soon' },
];

export default function FormsPage() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('cro');
  const [activeTab, setActiveTab] = useState<'library' | 'submissions' | 'packs'>('library');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('discovery');

  const totalForms = formCategories.reduce((sum, cat) => sum + cat.forms.length, 0);
  const totalSubmissions = formCategories.reduce((sum, cat) => sum + cat.forms.reduce((s, f) => s + f.submissions, 0), 0);
  const activeForms = formCategories.reduce((sum, cat) => sum + cat.forms.filter(f => f.status === 'active').length, 0);

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
                Access business forms and view completed submissions
              </p>
            </div>
            <button
              onClick={() => alert('Form Builder coming soon!\n\nDrag-and-drop form creation with:\n• Custom fields\n• Conditional logic\n• Auto-save\n• Email integration')}
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

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div
            onClick={() => setActiveTab('library')}
            style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '12px',
              padding: '2rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--zander-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>➕</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>Complete New Forms</h3>
            <p style={{ margin: 0, color: 'var(--zander-gray)', fontSize: '0.9rem' }}>
              Access all {totalForms} business process forms including Discovery Call Script, Client Onboarding Survey, and more
            </p>
            <div style={{ marginTop: '1rem', color: 'var(--zander-red)', fontWeight: '600' }}>
              Open Forms Library →
            </div>
          </div>

          <div
            onClick={() => setActiveTab('submissions')}
            style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '12px',
              padding: '2rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--zander-navy)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>📥</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>View Submissions</h3>
            <p style={{ margin: 0, color: 'var(--zander-gray)', fontSize: '0.9rem' }}>
              Access archived form submissions including Discovery Calls and Client Onboarding Surveys with export options
            </p>
            <div style={{ marginTop: '1rem', color: 'var(--zander-red)', fontWeight: '600' }}>
              Open Archive →
            </div>
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
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-red)' }}>{totalForms}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Total Forms</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#27AE60' }}>{activeForms}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Active Forms</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{totalSubmissions}</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Total Submissions</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-gold)' }}>100%</div>
              <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Auto-Save Enabled</div>
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
                {formCategories.map((category) => (
                  <div key={category.id} style={{ marginBottom: '1rem' }}>
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: expandedCategory === category.id ? 'var(--zander-off-white)' : 'white',
                        border: '2px solid var(--zander-border-gray)',
                        borderRadius: expandedCategory === category.id ? '8px 8px 0 0' : '8px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/headquarters" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>🏛️ HQ</a>
                        <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--zander-navy)', fontSize: '1rem' }}>{category.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{category.description}</div>
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
                          {category.forms.length} forms
                        </span>
                        <span style={{ color: 'var(--zander-gray)', transform: expandedCategory === category.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                      </div>
                    </button>

                    {expandedCategory === category.id && (
                      <div style={{
                        border: '2px solid var(--zander-border-gray)',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        overflow: 'hidden'
                      }}>
                        {category.forms.map((form, index) => (
                          <div
                            key={form.id}
                            onClick={() => alert(`Open form: ${form.name}\n\nForm viewer/editor coming soon!`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '1rem 1.25rem',
                              background: index % 2 === 0 ? 'white' : 'var(--zander-off-white)',
                              cursor: 'pointer',
                              borderBottom: index < category.forms.length - 1 ? '1px solid var(--zander-border-gray)' : 'none'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: '500', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{form.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{form.description}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{form.fields} fields</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{form.submissions} submitted</span>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                background: form.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                                color: form.status === 'active' ? '#27AE60' : 'var(--zander-gray)',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                {form.status}
                              </span>
                              <button style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--zander-gold)',
                                color: 'var(--zander-navy)',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}>
                                Open Form
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

            {/* SUBMISSIONS TAB */}
            {activeTab === 'submissions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Recent Submissions</h3>
                  <button style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--zander-navy)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    Export All →
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--zander-navy)', color: 'white' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Client Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Form</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Deal</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Submitted</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleSubmissions.map((submission, index) => (
                      <tr key={submission.id} style={{ background: index % 2 === 0 ? 'white' : 'var(--zander-off-white)', borderBottom: '1px solid var(--zander-border-gray)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '500', color: 'var(--zander-navy)' }}>{submission.contactName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{submission.contactEmail}</div>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--zander-navy)' }}>{submission.formName}</td>
                        <td style={{ padding: '1rem', color: 'var(--zander-gray)' }}>{submission.dealName || '—'}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--zander-gray)' }}>{formatDate(submission.submittedAt)}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: submission.status === 'complete' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(240, 179, 35, 0.1)',
                            color: submission.status === 'complete' ? '#27AE60' : '#B8860B',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {submission.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => alert(`View submission from ${submission.contactName}`)}
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
                    Pre-built form collections tailored for specific industries. Each pack includes all forms needed for a complete client lifecycle.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {industryPacks.map((pack) => (
                    <div
                      key={pack.id}
                      onClick={() => {
                        if (pack.status === 'coming_soon') {
                          alert(`${pack.name} pack coming soon!`);
                        } else {
                          alert(`Activate ${pack.name} pack?\n\nThis will add ${pack.forms} industry-specific forms to your library.`);
                        }
                      }}
                      style={{
                        background: 'white',
                        border: '2px solid var(--zander-border-gray)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        opacity: pack.status === 'coming_soon' ? 0.7 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{pack.icon}</span>
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
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)' }}>{pack.name}</h4>
                      <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.85rem' }}>{pack.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{pack.forms} forms included</span>
                        {pack.status === 'available' && (
                          <span style={{ color: 'var(--zander-red)', fontWeight: '600', fontSize: '0.8rem' }}>Activate →</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'rgba(240, 179, 35, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: 'var(--zander-navy)'
                }}>
                  💡 <strong>Note:</strong> Full Forms Library with all industry packs will be available at launch. Drag-and-drop Form Builder coming soon!
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
