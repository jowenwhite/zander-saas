'use client';

import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { logout } from '../utils/auth';

export default function SettingsPage() {
  const [activeModule, setActiveModule] = useState('cro');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [profile, setProfile] = useState({
    firstName: 'Jonathan',
    lastName: 'White',
    email: 'jonathan@64west.com',
    phone: '(555) 123-4567',
    timezone: 'America/New_York',
    theme: 'light',
    emailNotifications: true,
    dealAlerts: true,
    taskReminders: true,
    assemblyReminders: true,
    weeklyDigest: true
  });

  // Company State
  const [company, setCompany] = useState({
    name: '64 West Capital Partners',
    website: 'https://64west.com',
    email: 'info@64west.com',
    phone: '(555) 987-6543',
    address: '123 Main Street',
    city: 'Atlanta',
    state: 'GA',
    zip: '30301',
    industry: 'Business Consulting',
    fiscalYearStart: 'January',
    currency: 'USD',
    taxRate: '7.0'
  });

  // Team State
  const [team, setTeam] = useState<any[]>([
    { id: 1, name: 'Jonathan White', email: 'jonathan@64west.com', role: 'Owner', keystone: 'Pipeline Value', status: 'active', avatar: 'JW' },
    { id: 2, name: 'David Sheets', email: 'david@64west.com', role: 'Admin', keystone: 'Leads/Month', status: 'active', avatar: 'DS' },
    { id: 3, name: 'Sarah Johnson', email: 'sarah@64west.com', role: 'Manager', keystone: 'On-Time Delivery', status: 'active', avatar: 'SJ' },
    { id: 4, name: 'Mike Chen', email: 'mike@64west.com', role: 'Member', keystone: 'Tasks Completed', status: 'active', avatar: 'MC' },
    { id: 5, name: 'Emily Davis', email: 'emily@64west.com', role: 'Member', keystone: null, status: 'invited', avatar: 'ED' },
  ]);

  // Pipeline Stages State
  const [stages, setStages] = useState<any[]>([
    { id: 1, name: 'Prospect', probability: 10, color: '#6C757D' },
    { id: 2, name: 'Qualified', probability: 25, color: '#007BFF' },
    { id: 3, name: 'Proposal', probability: 50, color: '#F0B323' },
    { id: 4, name: 'Negotiation', probability: 75, color: '#17A2B8' },
    { id: 5, name: 'Closed Won', probability: 100, color: '#28A745' },
  ]);

  // Integrations State
  const integrations = {
    accounting: [
      { id: 'quickbooks', name: 'QuickBooks', description: 'Sync invoices, payments, and financial data', icon: '📗', status: 'available', connected: false },
      { id: 'xero', name: 'Xero', description: 'Connect your Xero account', icon: '📘', status: 'soon', connected: false },
      { id: 'freshbooks', name: 'FreshBooks', description: 'Import invoices and expenses', icon: '📙', status: 'soon', connected: false },
    ],
    email: [
      { id: 'gmail', name: 'Gmail / Google', description: 'Sync emails and calendar', icon: '📧', status: 'available', connected: true },
      { id: 'outlook', name: 'Microsoft Outlook', description: 'Connect Outlook/Office 365', icon: '📬', status: 'soon', connected: false },
      { id: 'resend', name: 'Resend', description: 'Transactional email sending', icon: '✉️', status: 'available', connected: true },
    ],
    crm: [
      { id: 'hubspot', name: 'HubSpot', description: 'Migrate from HubSpot CRM', icon: '🟠', status: 'soon', connected: false },
      { id: 'salesforce', name: 'Salesforce', description: 'Migrate from Salesforce', icon: '☁️', status: 'soon', connected: false },
      { id: 'pipedrive', name: 'Pipedrive', description: 'Import deals and contacts', icon: '🟢', status: 'soon', connected: false },
    ],
    productivity: [
      { id: 'slack', name: 'Slack', description: 'Get notifications in Slack', icon: '💬', status: 'soon', connected: false },
      { id: 'monday', name: 'Monday.com', description: 'Sync tasks and projects', icon: '📊', status: 'soon', connected: false },
      { id: 'notion', name: 'Notion', description: 'Connect your workspace', icon: '📝', status: 'soon', connected: false },
    ],
    calendar: [
      { id: 'gcal', name: 'Google Calendar', description: 'Sync meetings and events', icon: '📅', status: 'available', connected: true },
      { id: 'outlook_cal', name: 'Outlook Calendar', description: 'Connect Outlook calendar', icon: '🗓️', status: 'soon', connected: false },
      { id: 'calendly', name: 'Calendly', description: 'Scheduling integration', icon: '⏰', status: 'soon', connected: false },
    ],
    storage: [
      { id: 'gdrive', name: 'Google Drive', description: 'Store and access files', icon: '📁', status: 'available', connected: false },
      { id: 'dropbox', name: 'Dropbox', description: 'Connect Dropbox storage', icon: '📦', status: 'soon', connected: false },
      { id: 'onedrive', name: 'OneDrive', description: 'Microsoft cloud storage', icon: '☁️', status: 'soon', connected: false },
    ],
  };

  // Billing State
  const [billing] = useState({
    plan: 'Professional',
    price: '$99',
    interval: 'month',
    nextBilling: 'January 14, 2025',
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/26'
    },
    invoices: [
      { id: 'INV-001', date: 'Dec 14, 2024', amount: '$99.00', status: 'paid' },
      { id: 'INV-002', date: 'Nov 14, 2024', amount: '$99.00', status: 'paid' },
      { id: 'INV-003', date: 'Oct 14, 2024', amount: '$99.00', status: 'paid' },
    ]
  });


  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", firstName: "", lastName: "", role: "member" });

  // Fetch profile and company data on mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('zander_token');
      if (!token) return;

      try {
        // Fetch user profile
        const profileRes = await fetch('http://localhost:3001/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(prev => ({
            ...prev,
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
          }));
        }

        // Fetch tenant/company data
        const tenantRes = await fetch('http://localhost:3001/tenants/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (tenantRes.ok) {
          const tenantData = await tenantRes.json();
          setCompany(prev => ({
            ...prev,
            name: tenantData.companyName || '',
          }));
        }
        // Fetch team members
        const teamRes = await fetch('http://localhost:3001/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData.map((user: any) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member',
            phone: user.phone,
            status: 'active',
            avatar: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase(),
          })));
        }
        // Fetch pipeline stages
        const stagesRes = await fetch('http://localhost:3001/pipeline-stages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (stagesRes.ok) {
          const stagesData = await stagesRes.json();
          if (stagesData.length > 0) {
            setStages(stagesData.map((stage: any) => ({
              id: stage.id,
              name: stage.name,
              probability: stage.probability,
              color: stage.color,
              order: stage.order,
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save profile changes
  const saveProfile = async () => {
    setSaving(true);
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch('http://localhost:3001/auth/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
        })
      });
      if (res.ok) {
        alert('Profile saved successfully!');
      } else {
        alert('Error saving profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  // Save company changes
  const saveCompany = async () => {
    setSaving(true);
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch('http://localhost:3001/tenants/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyName: company.name,
        })
      });
      if (res.ok) {
        alert('Company settings saved successfully!');
      } else {
        alert('Error saving company settings');
      }
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Error saving company settings');
    } finally {
      setSaving(false);
    }
  };


  // Invite new team member
  const inviteUser = async () => {
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch('http://localhost:3001/users/invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteForm)
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(prev => [...prev, {
          id: data.user.id,
          name: `${data.user.firstName} ${data.user.lastName}`,
          email: data.user.email,
          role: data.user.role ? data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1) : 'Member',
          status: 'invited',
          avatar: `${data.user.firstName?.[0] || ''}${data.user.lastName?.[0] || ''}`.toUpperCase(),
        }]);
        setShowInviteModal(false);
        setInviteForm({ email: '', firstName: '', lastName: '', role: 'member' });
        alert('Invitation sent successfully!');
      } else {
        const err = await res.json();
        alert(err.message || 'Error sending invitation');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('Error sending invitation');
    } finally {
      setSaving(false);
    }
  };


  // Update pipeline stage
  const updateStage = async (stageId: string, updates: any) => {
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch(`http://localhost:3001/pipeline-stages/${stageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setStages(prev => prev.map(s => s.id === stageId ? { ...s, ...updated } : s));
      }
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'company', label: 'Company', icon: '🏢' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'pipeline', label: 'Pipeline', icon: '📊' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'data', label: 'Data', icon: '🗄️' },
  ];

  const getRoleStyle = (role: string) => {
    if (role === 'Owner') return { bg: 'rgba(191, 10, 48, 0.1)', color: '#BF0A30' };
    if (role === 'Admin') return { bg: 'rgba(12, 35, 64, 0.1)', color: '#0C2340' };
    if (role === 'Manager') return { bg: 'rgba(0, 123, 255, 0.1)', color: '#007BFF' };
    return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D' };
  };

  const getStatusStyle = (status: string) => {
    if (status === 'active') return { bg: 'rgba(40, 167, 69, 0.1)', color: '#28A745', label: 'Active' };
    if (status === 'invited') return { bg: 'rgba(240, 179, 35, 0.1)', color: '#B8860B', label: 'Invited' };
    return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D', label: status };
  };

  const renderProfileTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Personal Information</h3>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>First Name</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Last Name</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Timezone</label>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem', background: 'white' }}
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Password</label>
            <button style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Change Password</button>
          </div>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Notifications</h3>

          <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1.25rem' }}>
            {[
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
              { key: 'dealAlerts', label: 'Deal Alerts', description: 'Notify when deals are created, won, or lost' },
              { key: 'taskReminders', label: 'Task Reminders', description: 'Remind me of upcoming tasks' },
              { key: 'assemblyReminders', label: 'Assembly Reminders', description: 'Remind me before scheduled meetings' },
              { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary email' },
            ].map((item) => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--zander-border-gray)' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.15rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{item.description}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                  <input
                    type="checkbox"
                    checked={(profile as any)[item.key]}
                    onChange={(e) => setProfile({ ...profile, [item.key]: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: (profile as any)[item.key] ? 'var(--zander-red)' : '#ccc',
                    borderRadius: '28px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '20px',
                      width: '20px',
                      left: (profile as any)[item.key] ? '26px' : '4px',
                      bottom: '4px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>

          <button onClick={saveProfile} disabled={saving} style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );

  const renderCompanyTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Company Information</h3>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Company Name</label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Website</label>
            <input
              type="url"
              value={company.website}
              onChange={(e) => setCompany({ ...company, website: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Email</label>
            <input
              type="email"
              value={company.email}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Phone</label>
            <input
              type="tel"
              value={company.phone}
              onChange={(e) => setCompany({ ...company, phone: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Industry</label>
            <select
              value={company.industry}
              onChange={(e) => setCompany({ ...company, industry: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem', background: 'white' }}
            >
              <option value="Business Consulting">Business Consulting</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Construction">Construction</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Retail">Retail</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Company Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--zander-off-white)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--zander-border-gray)' }}>
                <span style={{ fontSize: '2rem' }}>🏢</span>
              </div>
              <button style={{ padding: '0.5rem 1rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Upload Logo</button>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Address & Preferences</h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Street Address</label>
            <input
              type="text"
              value={company.address}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>City</label>
              <input
                type="text"
                value={company.city}
                onChange={(e) => setCompany({ ...company, city: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>State</label>
              <input
                type="text"
                value={company.state}
                onChange={(e) => setCompany({ ...company, state: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>ZIP</label>
              <input
                type="text"
                value={company.zip}
                onChange={(e) => setCompany({ ...company, zip: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Fiscal Year Start</label>
            <select
              value={company.fiscalYearStart}
              onChange={(e) => setCompany({ ...company, fiscalYearStart: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem', background: 'white' }}
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Currency</label>
              <select
                value={company.currency}
                onChange={(e) => setCompany({ ...company, currency: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem', background: 'white' }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Tax Rate (%)</label>
              <input
                type="text"
                value={company.taxRate}
                onChange={(e) => setCompany({ ...company, taxRate: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
          </div>

          <button onClick={saveCompany} disabled={saving} style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Team Members</h3>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>{team.length} members</p>
        </div>
        <button style={{ padding: '0.75rem 1.5rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowInviteModal(true)}>+ Invite Member</button>
      </div>

      <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 100px', padding: '0.75rem 1rem', background: 'var(--zander-navy)', color: 'white', fontWeight: '600', fontSize: '0.8rem' }}>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Keystone</div>
          <div>Status</div>
          <div style={{ textAlign: 'center' }}>Actions</div>
        </div>
        {team.map((member) => {
          const roleStyle = getRoleStyle(member.role);
          const statusStyle = getStatusStyle(member.status);
          return (
            <div key={member.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr 100px', padding: '1rem', borderBottom: '1px solid var(--zander-border-gray)', alignItems: 'center', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.8rem' }}>{member.avatar}</div>
                <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{member.name}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--zander-gray)' }}>{member.email}</div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '12px', background: roleStyle.bg, color: roleStyle.color }}>{member.role}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--zander-gray)' }}>{member.keystone || '—'}</div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '12px', background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.label}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button style={{ padding: '0.35rem 0.75rem', background: 'white', color: 'var(--zander-navy)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Roles & Permissions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            { role: 'Owner', description: 'Full access to all settings, billing, and data', permissions: 'Everything' },
            { role: 'Admin', description: 'Manage team, settings, and all modules', permissions: 'All except billing' },
            { role: 'Manager', description: 'Manage their team and assigned modules', permissions: 'Team + assigned modules' },
            { role: 'Member', description: 'Access assigned modules and own data', permissions: 'Own data only' },
          ].map((item) => {
            const style = getRoleStyle(item.role);
            return (
              <div key={item.role} style={{ padding: '1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', borderTop: `3px solid ${style.color}` }}>
                <div style={{ fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>{item.role}</div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--zander-gray)', lineHeight: '1.4' }}>{item.description}</p>
                <div style={{ fontSize: '0.75rem', color: style.color, fontWeight: '600' }}>{item.permissions}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderPipelineTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Pipeline Stages</h3>
            <button style={{ padding: '0.5rem 1rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add Stage</button>
          </div>
          <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.85rem' }}>Drag to reorder stages. Deals will follow this sequence.</p>

          <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '0.5rem' }}>
            {stages.map((stage, index) => (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '0.5rem', border: '2px solid var(--zander-border-gray)' }}>
                <span style={{ cursor: 'grab', color: 'var(--zander-gray)' }}>⋮⋮</span>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: stage.color }} />
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => {
                      const newStages = [...stages];
                      newStages[index].name = e.target.value;
                      setStages(newStages);
                    }}
                    style={{ border: 'none', background: 'transparent', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '1rem', width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Probability:</span>
                  <input
                    type="number"
                    value={stage.probability}
                    onChange={(e) => {
                      const newStages = [...stages];
                      newStages[index].probability = parseInt(e.target.value) || 0;
                      setStages(newStages);
                    }}
                    style={{ width: '60px', padding: '0.35rem', border: '1px solid var(--zander-border-gray)', borderRadius: '4px', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>%</span>
                </div>
                <button style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--zander-gray)' }}>🗑️</button>
              </div>
            ))}
          </div>

          <button style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>Save Stages</button>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Deal Settings</h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Stale Deal Threshold (days)</label>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-gray)', fontSize: '0.8rem' }}>Flag deals with no activity after this many days</p>
            <input
              type="number"
              defaultValue={14}
              style={{ width: '100px', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Win Reasons</label>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-gray)', fontSize: '0.8rem' }}>Track why deals are won</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Price', 'Quality', 'Relationship', 'Timing', 'Features', 'Referral'].map((reason) => (
                <span key={reason} style={{ padding: '0.35rem 0.75rem', background: 'rgba(40, 167, 69, 0.1)', color: '#28A745', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600' }}>{reason} ×</span>
              ))}
              <button style={{ padding: '0.35rem 0.75rem', background: 'white', color: 'var(--zander-navy)', border: '1px dashed var(--zander-border-gray)', borderRadius: '15px', fontSize: '0.8rem', cursor: 'pointer' }}>+ Add</button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Loss Reasons</label>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-gray)', fontSize: '0.8rem' }}>Track why deals are lost</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Price Too High', 'Lost to Competitor', 'No Budget', 'Timing', 'No Response', 'Went Another Direction'].map((reason) => (
                <span key={reason} style={{ padding: '0.35rem 0.75rem', background: 'rgba(220, 53, 69, 0.1)', color: '#DC3545', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600' }}>{reason} ×</span>
              ))}
              <button style={{ padding: '0.35rem 0.75rem', background: 'white', color: 'var(--zander-navy)', border: '1px dashed var(--zander-border-gray)', borderRadius: '15px', fontSize: '0.8rem', cursor: 'pointer' }}>+ Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div>
      {Object.entries(integrations).map(([category, items]) => (
        <div key={category} style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem', textTransform: 'capitalize' }}>
            {category === 'crm' ? 'CRM & Sales' : category === 'email' ? 'Email & Communication' : category}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {items.map((integration) => (
              <div key={integration.id} style={{ padding: '1.25rem', background: 'white', borderRadius: '10px', border: '2px solid var(--zander-border-gray)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--zander-off-white)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{integration.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{integration.name}</span>
                    {integration.status === 'soon' && (
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(240, 179, 35, 0.2)', color: '#B8860B' }}>SOON</span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--zander-gray)', lineHeight: '1.4' }}>{integration.description}</p>
                  {integration.connected ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28A745' }} />
                      <span style={{ fontSize: '0.8rem', color: '#28A745', fontWeight: '600' }}>Connected</span>
                      <button style={{ marginLeft: 'auto', padding: '0.35rem 0.75rem', background: 'white', color: 'var(--zander-gray)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>Disconnect</button>
                    </div>
                  ) : integration.status === 'available' ? (
                    <button style={{ padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Connect</button>
                  ) : (
                    <button disabled style={{ padding: '0.5rem 1rem', background: 'var(--zander-off-white)', color: 'var(--zander-gray)', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'not-allowed' }}>Coming Soon</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderBillingTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Current Plan</h3>
          
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '12px', color: 'white', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>Current Plan</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{billing.plan}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{billing.price}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>per {billing.interval}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Next billing date: {billing.nextBilling}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button style={{ padding: '0.75rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Change Plan</button>
            <button style={{ padding: '0.75rem', background: 'white', color: '#DC3545', border: '2px solid #DC3545', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel Subscription</button>
          </div>

          <h3 style={{ margin: '2rem 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Payment Method</h3>
          
          <div style={{ padding: '1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '32px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--zander-border-gray)' }}>
              <span style={{ fontWeight: '700', color: '#1A1F71' }}>VISA</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>•••• •••• •••• {billing.paymentMethod.last4}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Expires {billing.paymentMethod.expiry}</div>
            </div>
            <button style={{ padding: '0.5rem 1rem', background: 'white', color: 'var(--zander-navy)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>Update</button>
          </div>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Billing History</h3>
          
          <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '0.75rem 1rem', background: 'var(--zander-navy)', color: 'white', fontWeight: '600', fontSize: '0.8rem' }}>
              <div>Invoice</div>
              <div>Date</div>
              <div>Amount</div>
              <div style={{ textAlign: 'center' }}>Status</div>
            </div>
            {billing.invoices.map((invoice) => (
              <div key={invoice.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '1rem', borderBottom: '1px solid var(--zander-border-gray)', alignItems: 'center', background: 'white' }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{invoice.id}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--zander-gray)' }}>{invoice.date}</div>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{invoice.amount}</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(40, 167, 69, 0.1)', color: '#28A745', textTransform: 'uppercase' }}>{invoice.status}</span>
                </div>
              </div>
            ))}
          </div>

          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'white', color: 'var(--zander-navy)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>Download All Invoices</button>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Export Data</h3>
          
          <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>Download all your data in a portable format. This includes contacts, deals, communications, and settings.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{ padding: '0.75rem 1.5rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Export as CSV</button>
              <button style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Export as JSON</button>
            </div>
          </div>

          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Data Retention</h3>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Keep deleted items for</label>
            <select style={{ width: '200px', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem', background: 'white' }}>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
              <option value="forever">Forever</option>
            </select>
          </div>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Audit Log</h3>
          
          <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            {[
              { action: 'Deal updated', user: 'Jonathan White', target: 'Johnson Kitchen Remodel', time: '2 hours ago' },
              { action: 'Contact created', user: 'David Sheets', target: 'Mike Anderson', time: '5 hours ago' },
              { action: 'Stage changed', user: 'Jonathan White', target: 'Smith Bathroom', time: '1 day ago' },
              { action: 'User invited', user: 'Jonathan White', target: 'emily@64west.com', time: '2 days ago' },
              { action: 'Settings updated', user: 'Jonathan White', target: 'Company Info', time: '3 days ago' },
            ].map((log, i) => (
              <div key={i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--zander-border-gray)', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{log.action}</span>
                    <span style={{ color: 'var(--zander-gray)' }}> — {log.target}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{log.time}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>by {log.user}</div>
              </div>
            ))}
          </div>

          <button style={{ padding: '0.5rem 1rem', background: 'white', color: 'var(--zander-navy)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>View Full Audit Log</button>

          <h3 style={{ margin: '2rem 0 1rem 0', color: '#DC3545', fontSize: '1.1rem' }}>Danger Zone</h3>
          
          <div style={{ padding: '1.5rem', background: 'rgba(220, 53, 69, 0.05)', borderRadius: '10px', border: '2px solid rgba(220, 53, 69, 0.2)' }}>
            <div style={{ fontWeight: '600', color: '#DC3545', marginBottom: '0.5rem' }}>Delete Account</div>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button style={{ padding: '0.75rem 1.5rem', background: '#DC3545', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Delete My Account</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <NavBar activeModule="cro" />

        <Sidebar collapsed={sidebarCollapsed} />

        <main style={{ marginLeft: sidebarCollapsed ? '64px' : '240px', marginTop: '64px', padding: '2rem', transition: 'margin-left 0.3s ease' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.75rem' }}>JW</div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>Jonathan White</h1>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>jonathan@64west.com</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>Owner</span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>64 West Capital Partners</span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>• Member since December 2024</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', border: '2px solid var(--zander-border-gray)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '2px solid var(--zander-border-gray)' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: activeTab === tab.id ? 'var(--zander-off-white)' : 'white',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid var(--zander-red)' : '3px solid transparent',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: activeTab === tab.id ? 'var(--zander-navy)' : 'var(--zander-gray)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'company' && renderCompanyTab()}
              {activeTab === 'team' && renderTeamTab()}
              {activeTab === 'pipeline' && renderPipelineTab()}
              {activeTab === 'integrations' && renderIntegrationsTab()}
              {activeTab === 'billing' && renderBillingTab()}
              {activeTab === 'data' && renderDataTab()}
            </div>
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.3rem' }}>Invite Team Member</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>First Name *</label>
              <input type="text" value={inviteForm.firstName} onChange={(e) => setInviteForm({...inviteForm, firstName: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Last Name *</label>
              <input type="text" value={inviteForm.lastName} onChange={(e) => setInviteForm({...inviteForm, lastName: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Email *</label>
              <input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Role</label>
              <select value={inviteForm.role} onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}>
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInviteModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={inviteUser} disabled={saving} style={{ padding: '0.75rem 1.5rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>{saving ? 'Sending...' : 'Send Invite'}</button>
            </div>
          </div>
        </div>
      )}
        </AuthGuard>
  );
}
