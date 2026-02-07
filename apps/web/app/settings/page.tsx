'use client';

import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { logout } from '../utils/auth';

// Helper functions for month conversion
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const getMonthName = (monthNum: number): string => MONTHS[monthNum - 1] || 'January';
const getMonthNumber = (monthName: string): number => MONTHS.indexOf(monthName) + 1 || 1;

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

  // User state (for API calls)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

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
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [syncingGmail, setSyncingGmail] = useState(false);
  
  // Outlook/Microsoft state
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [outlookEmail, setOutlookEmail] = useState<string | null>(null);
  const [syncingOutlook, setSyncingOutlook] = useState(false);

  // Check Gmail connection status on load
  useEffect(() => {
    const checkGmailStatus = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`https://api.zanderos.com/gmail/status?userId=${user.id}`);
        const data = await res.json();
        setGmailConnected(data.connected);
        setGmailEmail(data.email);
      } catch (error) {
        console.error('Failed to check Gmail status:', error);
      }
    };
    checkGmailStatus();
    
    // Check Outlook status
    const checkOutlookStatus = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`https://api.zanderos.com/auth/microsoft/status?userId=${user.id}`);
        const data = await res.json();
        setOutlookConnected(data.connected);
        setOutlookEmail(data.email);
      } catch (error) {
        console.error('Failed to check Outlook status:', error);
      }
    };
    checkOutlookStatus();
  }, [user?.id]);

  const handleConnectGmail = () => {
    if (!user?.id) return;
    window.location.href = `https://api.zanderos.com/auth/google?state=${user.id}`;
  };

  const handleDisconnectGmail = async () => {
    if (!user?.id) return;
    window.location.href = `https://api.zanderos.com/auth/google/disconnect?userId=${user.id}`;
  };

  const handleSyncGmail = async () => {
    if (!user?.id) return;
    setSyncingGmail(true);
    try {
      const res = await fetch(`https://api.zanderos.com/gmail/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, maxResults: 50 }),
      });
      const data = await res.json();
      if (data.success) {
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (error) {
      alert('Sync failed');
    } finally {
      setSyncingGmail(false);
    }
  };

  // Outlook/Microsoft handlers
  const handleConnectOutlook = () => {
    if (!user?.id) return;
    window.location.href = `https://api.zanderos.com/auth/microsoft?state=${user.id}`;
  };

  const handleDisconnectOutlook = async () => {
    if (!user?.id) return;
    window.location.href = `https://api.zanderos.com/auth/microsoft/disconnect?userId=${user.id}`;
  };
  const handleSyncOutlook = async () => {
    if (!user?.id) return;
    setSyncingOutlook(true);
    try {
      const res = await fetch('https://api.zanderos.com/outlook/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, maxResults: 50 }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Synced ${data.synced} Outlook emails`);
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (error) {
      alert('Sync failed');
    } finally {
      setSyncingOutlook(false);
    }
  };

  const integrations = {
    accounting: [
      { id: 'quickbooks', name: 'QuickBooks', description: 'Sync invoices, payments, and financial data', icon: '📗', status: 'available', connected: false },
      { id: 'xero', name: 'Xero', description: 'Connect your Xero account', icon: '📘', status: 'soon', connected: false },
      { id: 'freshbooks', name: 'FreshBooks', description: 'Import invoices and expenses', icon: '📙', status: 'soon', connected: false },
    ],
    email: [
      { id: 'gmail', name: 'Gmail / Google', description: gmailEmail ? `Connected: ${gmailEmail}` : 'Sync emails, contacts, and calendar', icon: '📧', status: 'available', connected: gmailConnected },
      { id: 'outlook', name: 'Microsoft Outlook', description: outlookEmail ? `Connected: ${outlookEmail}` : 'Connect Outlook/Office 365', icon: '📬', status: 'available', connected: outlookConnected },
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
      { id: 'gcal', name: 'Google Calendar', description: 'Sync meetings and events', icon: '📅', status: 'available', connected: gmailConnected },
      { id: 'outlook_cal', name: 'Outlook Calendar', description: 'Connect Outlook calendar', icon: '🗓️', status: 'soon', connected: false },
      { id: 'calendly', name: 'Calendly', description: 'Scheduling integration', icon: '⏰', status: 'soon', connected: false },
    ],
    storage: [
      { id: 'gdrive', name: 'Google Drive', description: 'Store and access files', icon: '📁', status: 'available', connected: gmailConnected },
      { id: 'dropbox', name: 'Dropbox', description: 'Connect Dropbox storage', icon: '📦', status: 'soon', connected: false },
      { id: 'onedrive', name: 'OneDrive', description: 'Microsoft cloud storage', icon: '☁️', status: 'soon', connected: false },
    ],
  };

  // Billing State
  const [billing, setBilling] = useState<any>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('month');

  // Data Retention State
  const [dataRetention, setDataRetention] = useState('90');

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');

  // Terms & Conditions State
  const [termsData, setTermsData] = useState<{
    userVersion: string | null;
    userAcceptedAt: string | null;
    currentVersion: string | null;
    currentContent: string | null;
    currentEffectiveDate: string | null;
    needsAcceptance: boolean;
  }>({
    userVersion: null,
    userAcceptedAt: null,
    currentVersion: null,
    currentContent: null,
    currentEffectiveDate: null,
    needsAcceptance: false
  });
  const [termsLoading, setTermsLoading] = useState(true);

  // Fetch billing data and prices
  useEffect(() => {
    const fetchBillingData = async () => {
      const token = localStorage.getItem('zander_token');
      setBillingLoading(true);
      try {
        // Fetch prices (public endpoint)
        const pricesRes = await fetch('https://api.zanderos.com/billing/prices');
        const pricesData = await pricesRes.json();
        setPrices(Array.isArray(pricesData) ? pricesData : []);

        // Fetch current subscription (authenticated)
        if (token) {
          const subRes = await fetch('https://api.zanderos.com/billing/subscription', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (subRes.ok) {
            const subData = await subRes.json();
            setBilling(subData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch billing data:', error);
      } finally {
        setBillingLoading(false);
      }
    };
    fetchBillingData();
  }, []);

  const handleCheckout = async (priceId: string) => {
    const token = localStorage.getItem('zander_token');
    setUpgradeLoading(true);
    try {
      const res = await fetch('https://api.zanderos.com/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priceId, cohort: 'public' })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleManageBilling = async () => {
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch('https://api.zanderos.com/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) return;
    const token = localStorage.getItem('zander_token');
    try {
      await fetch('https://api.zanderos.com/billing/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ immediate: false })
      });
      alert('Subscription cancelled. You will retain access until the end of your billing period.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
  };

  const getPricesByTier = (tier: string) => {
    return prices.filter(p => p.metadata?.tier === tier);
  };


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
        const profileRes = await fetch('https://api.zanderos.com/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser({ id: profileData.id, email: profileData.email });
          setProfile(prev => ({
            ...prev,
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            timezone: profileData.timezone || 'America/New_York',
            emailNotifications: profileData.emailNotifications ?? true,
            dealAlerts: profileData.dealAlerts ?? true,
            taskReminders: profileData.taskReminders ?? true,
            assemblyReminders: profileData.assemblyReminders ?? true,
            weeklyDigest: profileData.weeklyDigest ?? true,
          }));
          setTwoFactorEnabled(profileData.twoFactorEnabled ?? false);

          // Set terms data from profile
          setTermsData(prev => ({
            ...prev,
            userVersion: profileData.termsVersion || null,
            userAcceptedAt: profileData.termsAcceptedAt || null,
          }));
        }

        // Fetch current terms version
        try {
          const termsRes = await fetch('https://api.zanderos.com/legal/terms');
          if (termsRes.ok) {
            const termsVersionData = await termsRes.json();
            setTermsData(prev => ({
              ...prev,
              currentVersion: termsVersionData.version || null,
              currentContent: termsVersionData.content || null,
              currentEffectiveDate: termsVersionData.effectiveDate || null,
              needsAcceptance: termsVersionData.version && (!prev.userVersion || prev.userVersion !== termsVersionData.version)
            }));
          }
        } catch (termsError) {
          console.error('Failed to fetch terms:', termsError);
        }
        setTermsLoading(false);

        // Fetch tenant/company data
        const tenantRes = await fetch('https://api.zanderos.com/tenants/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (tenantRes.ok) {
          const tenantData = await tenantRes.json();
          setCompany(prev => ({
            ...prev,
            name: tenantData.companyName || '',
            website: tenantData.website || '',
            email: tenantData.email || '',
            phone: tenantData.phone || '',
            address: tenantData.address || '',
            city: tenantData.city || '',
            state: tenantData.state || '',
            zip: tenantData.zip || '',
            industry: tenantData.industry || 'Business Consulting',
            fiscalYearStart: tenantData.fiscalYearStart ? getMonthName(tenantData.fiscalYearStart) : 'January',
            currency: tenantData.currency || 'USD',
            taxRate: tenantData.taxRate?.toString() || '0',
          }));
        }
        // Fetch team members
        const teamRes = await fetch('https://api.zanderos.com/users', {
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
        const stagesRes = await fetch('https://api.zanderos.com/pipeline-stages', {
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
      const res = await fetch('https://api.zanderos.com/auth/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          timezone: profile.timezone,
          emailNotifications: profile.emailNotifications,
          dealAlerts: profile.dealAlerts,
          taskReminders: profile.taskReminders,
          assemblyReminders: profile.assemblyReminders,
          weeklyDigest: profile.weeklyDigest,
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
      const res = await fetch('https://api.zanderos.com/tenants/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyName: company.name,
          website: company.website,
          email: company.email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          zip: company.zip,
          industry: company.industry,
          fiscalYearStart: getMonthNumber(company.fiscalYearStart),
          currency: company.currency,
          taxRate: parseFloat(company.taxRate) || 0,
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

  // 2FA Setup - Start
  const setup2FA = async () => {
    setTwoFactorLoading(true);
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch('https://api.zanderos.com/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTwoFactorSetupData({ secret: data.secret, qrCodeUrl: data.qrCodeUrl });
      } else {
        const err = await res.json();
        alert(err.message || 'Error setting up 2FA');
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      alert('Error setting up 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // 2FA Verify and Enable
  const verify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      alert('Please enter a 6-digit code');
      return;
    }
    setTwoFactorLoading(true);
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch('https://api.zanderos.com/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: twoFactorCode })
      });
      if (res.ok) {
        setTwoFactorEnabled(true);
        setTwoFactorSetupData(null);
        setTwoFactorCode('');
        alert('Two-factor authentication has been enabled!');
      } else {
        const err = await res.json();
        alert(err.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      alert('Error verifying 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // 2FA Disable
  const disable2FA = async () => {
    if (!disable2FAPassword) {
      alert('Please enter your password');
      return;
    }
    setTwoFactorLoading(true);
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch('https://api.zanderos.com/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: disable2FAPassword })
      });
      if (res.ok) {
        setTwoFactorEnabled(false);
        setShowDisable2FAModal(false);
        setDisable2FAPassword('');
        alert('Two-factor authentication has been disabled');
      } else {
        const err = await res.json();
        alert(err.message || 'Error disabling 2FA');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      alert('Error disabling 2FA');
    } finally {
      setTwoFactorLoading(false);
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
      const res = await fetch('https://api.zanderos.com/users/invite', {
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



  // Add new pipeline stage
  const addStage = async () => {
    const token = localStorage.getItem('zander_token');
    const newOrder = stages.length;
    try {
      const res = await fetch('https://api.zanderos.com/pipeline-stages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'New Stage',
          order: newOrder,
          probability: 0,
          color: '#6C757D'
        })
      });
      if (res.ok) {
        const newStage = await res.json();
        setStages(prev => [...prev, newStage]);
      }
    } catch (error) {
      console.error('Error adding stage:', error);
    }
  };

  // Delete pipeline stage
  const deleteStage = async (stageId: string) => {
    if (!confirm('Are you sure you want to delete this stage?')) return;
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch(`https://api.zanderos.com/pipeline-stages/${stageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStages(prev => prev.filter(s => s.id !== stageId));
      }
    } catch (error) {
      console.error('Error deleting stage:', error);
    }
  };

  // Save all stages
  const saveAllStages = async () => {
    setSaving(true);
    const token = localStorage.getItem('zander_token');
    try {
      await Promise.all(stages.map(stage =>
        fetch(`https://api.zanderos.com/pipeline-stages/${stage.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: stage.name,
            probability: stage.probability,
            color: stage.color
          })
        })
      ));
      alert('Pipeline stages saved successfully!');
    } catch (error) {
      console.error('Error saving stages:', error);
      alert('Error saving stages');
    } finally {
      setSaving(false);
    }
  };

  // Update pipeline stage
  const updateStage = async (stageId: string, updates: any) => {
    const token = localStorage.getItem('zander_token');
    try {
      const res = await fetch(`https://api.zanderos.com/pipeline-stages/${stageId}`, {
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
    { id: 'pipeline', label: 'Projects', icon: '📊' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'legal', label: 'Legal', icon: '📜' },
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
            <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Project Stages</h3>
            <button style={{ padding: '0.5rem 1rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }} onClick={addStage}>+ Add Stage</button>
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
                <button style={{ padding: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--zander-gray)' }} onClick={() => deleteStage(stage.id)}>🗑️</button>
              </div>
            ))}
          </div>

          <button style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }} onClick={saveAllStages} disabled={saving}>{saving ? "Saving..." : "Save Stages"}</button>
        </div>

        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Project Settings</h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Stale Project Threshold (days)</label>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-gray)', fontSize: '0.8rem' }}>Flag projects with no activity after this many days</p>
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
            {category === 'crm' ? 'CRM & Sales' : category === 'email' ? 'Email & Communication' : category === 'calendar' ? 'Calendar & Scheduling' : category === 'storage' ? 'Cloud Storage' : category}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {items.map((integration) => (
              <div key={integration.id} style={{ padding: '1.25rem', background: 'white', borderRadius: '10px', border: integration.connected ? '2px solid #28A745' : '2px solid var(--zander-border-gray)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', background: integration.connected ? 'rgba(40, 167, 69, 0.1)' : 'var(--zander-off-white)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{integration.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{integration.name}</span>
                    {integration.status === 'soon' && (
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(240, 179, 35, 0.2)', color: '#B8860B' }}>SOON</span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--zander-gray)', lineHeight: '1.4' }}>{integration.description}</p>
                  {integration.connected ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28A745' }} />
                      <span style={{ fontSize: '0.8rem', color: '#28A745', fontWeight: '600' }}>Connected</span>
                      {(integration.id === 'gmail' || integration.id === 'outlook') && (
                        <button onClick={integration.id === 'gmail' ? handleSyncGmail : handleSyncOutlook} disabled={integration.id === 'gmail' ? syncingGmail : syncingOutlook} style={{ padding: '0.35rem 0.75rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: (integration.id === 'gmail' ? syncingGmail : syncingOutlook) ? 'wait' : 'pointer', marginLeft: '0.5rem' }}>
                          {(integration.id === 'gmail' ? syncingGmail : syncingOutlook) ? 'Syncing...' : 'Sync Now'}
                        </button>
                      )}
                      {(integration.id === 'gmail' || integration.id === 'gcal' || integration.id === 'gdrive' || integration.id === 'outlook') && (
                        <button onClick={integration.id === 'outlook' ? handleDisconnectOutlook : handleDisconnectGmail} style={{ marginLeft: 'auto', padding: '0.35rem 0.75rem', background: 'white', color: 'var(--zander-gray)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>Disconnect</button>
                      )}
                    </div>
                  ) : integration.status === 'available' ? (
                    <button 
                      onClick={integration.id === 'outlook' ? handleConnectOutlook : (integration.id === 'gmail' || integration.id === 'gcal' || integration.id === 'gdrive') ? handleConnectGmail : undefined}
                      style={{ padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Connect
                    </button>
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

  const renderBillingTab = () => {
    if (billingLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div style={{ color: 'var(--zander-gray)' }}>Loading billing information...</div>
          </div>
        </div>
      );
    }

    const tiers = [
      { id: 'starter', name: 'Starter', description: '1 AI Executive', executives: 1, teamMembers: 3, storage: '5GB' },
      { id: 'professional', name: 'Professional', description: '3 AI Executives', executives: 3, teamMembers: 10, storage: '25GB', popular: true },
      { id: 'business', name: 'Business', description: 'All 7 AI Executives', executives: 7, teamMembers: 25, storage: '100GB' },
      { id: 'enterprise', name: 'Enterprise', description: 'White Glove Service', executives: 7, teamMembers: 'Custom', storage: 'Unlimited', customFeatures: ['White Label Branding', 'Custom Software by Project'] }
    ];

    return (
      <div>
        {/* Current Subscription */}
        {billing ? (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Current Subscription</h3>
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '12px', color: 'white', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>Current Plan</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{billing.items?.[0]?.productName || 'Free'}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
                    Status: <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      background: billing.status === 'active' ? 'rgba(40, 167, 69, 0.3)' : billing.status === 'trialing' ? 'rgba(240, 179, 35, 0.3)' : 'rgba(220, 53, 69, 0.3)',
                      textTransform: 'capitalize'
                    }}>{billing.status}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700' }}>{billing.items?.[0]?.amount ? formatPrice(billing.items[0].amount) : '$0'}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>per {billing.items?.[0]?.interval || 'month'}</div>
                </div>
              </div>
              {billing.trialEnd && new Date(billing.trialEnd) > new Date() && (
                <div style={{ fontSize: '0.85rem', opacity: 0.9, background: 'rgba(240, 179, 35, 0.2)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
                  ⏰ Trial ends: {new Date(billing.trialEnd).toLocaleDateString()}
                </div>
              )}
              {billing.cancelAtPeriodEnd && (
                <div style={{ fontSize: '0.85rem', opacity: 0.9, background: 'rgba(220, 53, 69, 0.2)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
                  ⚠️ Cancels at period end: {new Date(billing.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                Next billing: {new Date(billing.currentPeriodEnd).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleManageBilling}
                style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                💳 Manage Payment Method
              </button>
              {!billing.cancelAtPeriodEnd && (
                <button 
                  onClick={handleCancelSubscription}
                  style={{ padding: '0.75rem 1.5rem', background: 'white', color: '#DC3545', border: '2px solid #DC3545', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--zander-off-white)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🚀</div>
            <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>No Active Subscription</div>
            <div style={{ color: 'var(--zander-gray)', fontSize: '0.9rem' }}>Choose a plan below to get started with Zander</div>
          </div>
        )}

        {/* Billing Interval Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', background: 'var(--zander-off-white)', borderRadius: '8px', padding: '4px' }}>
            <button
              onClick={() => setSelectedInterval('month')}
              style={{
                padding: '0.5rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                background: selectedInterval === 'month' ? 'white' : 'transparent',
                color: selectedInterval === 'month' ? 'var(--zander-navy)' : 'var(--zander-gray)',
                boxShadow: selectedInterval === 'month' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedInterval('year')}
              style={{
                padding: '0.5rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                background: selectedInterval === 'year' ? 'white' : 'transparent',
                color: selectedInterval === 'year' ? 'var(--zander-navy)' : 'var(--zander-gray)',
                boxShadow: selectedInterval === 'year' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Annual <span style={{ fontSize: '0.75rem', color: '#28A745', marginLeft: '0.25rem' }}>Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {tiers.map((tier) => {
            const tierPrices = prices.filter(p => p.metadata?.tier === tier.id);
            const price = tierPrices.find(p => p.interval === selectedInterval) || tierPrices.find(p => p.interval === 'month');
            const isCurrentPlan = billing?.items?.[0]?.productName?.toLowerCase().includes(tier.id);

            return (
              <div
                key={tier.id}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  borderRadius: '12px',
                  border: tier.popular ? '2px solid var(--zander-red)' : '2px solid var(--zander-border-gray)',
                  position: 'relative',
                  boxShadow: tier.popular ? '0 4px 12px rgba(191, 10, 48, 0.15)' : 'none'
                }}
              >
                {tier.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--zander-red)',
                    color: 'white',
                    padding: '0.25rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    Most Popular
                  </div>
                )}
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{tier.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--zander-gray)' }}>{tier.description}</div>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  {price ? (
                    <>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--zander-red)' }}>
                        {formatPrice(price.interval === 'year' ? price.amount / 12 : price.amount)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--zander-gray)' }}>
                        per month{price.interval === 'year' && ' (billed annually)'}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>Contact Us</div>
                  )}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#28A745' }}>✓</span>
                    <span>{tier.executives} AI Executive{tier.executives > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#28A745' }}>✓</span>
                    <span>{tier.teamMembers} Team Members</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#28A745' }}>✓</span>
                    <span>{tier.storage} Storage</span>
                  </div>
                  {tier.customFeatures && tier.customFeatures.map((feature: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#28A745' }}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {isCurrentPlan ? (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--zander-off-white)',
                      color: 'var(--zander-gray)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'not-allowed'
                    }}
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => price && handleCheckout(price.id)}
                    disabled={upgradeLoading || !price}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: tier.popular ? 'var(--zander-red)' : 'white',
                      color: tier.popular ? 'white' : 'var(--zander-navy)',
                      border: tier.popular ? 'none' : '2px solid var(--zander-navy)',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: upgradeLoading ? 'wait' : 'pointer',
                      opacity: upgradeLoading ? 0.7 : 1
                    }}
                  >
                    {upgradeLoading ? 'Processing...' : billing ? 'Upgrade' : 'Start 14-Day Trial'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Export data as CSV
  const exportCSV = async () => {
    const token = localStorage.getItem('zander_token');
    try {
      const [contactsRes, dealsRes] = await Promise.all([
        fetch('https://api.zanderos.com/contacts/export', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://api.zanderos.com/deals/export', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      const contactsData = await contactsRes.json();
      const contacts = Array.isArray(contactsData) ? contactsData : (contactsData.data || []);
      const dealsData = await dealsRes.json();
      const deals = Array.isArray(dealsData) ? dealsData : (dealsData.data || []);
      
      // Create CSV for contacts
      const contactsCsv = [
        ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Created'],
        ...contacts.map((c: any) => [c.firstName, c.lastName, c.email, c.phone || '', c.company || '', c.createdAt])
      ].map(row => row.join(',')).join('\n');
      
      // Create CSV for deals
      const dealsCsv = [
        ['Title', 'Value', 'Stage', 'Contact', 'Created'],
        ...deals.map((d: any) => [d.title, d.value, d.stage, d.contact?.firstName || '', d.createdAt])
      ].map(row => row.join(',')).join('\n');
      
      // Download contacts CSV
      const contactsBlob = new Blob([contactsCsv], { type: 'text/csv' });
      const contactsUrl = URL.createObjectURL(contactsBlob);
      const contactsLink = document.createElement('a');
      contactsLink.href = contactsUrl;
      contactsLink.download = 'contacts_export.csv';
      contactsLink.click();
      
      // Download deals CSV
      const dealsBlob = new Blob([dealsCsv], { type: 'text/csv' });
      const dealsUrl = URL.createObjectURL(dealsBlob);
      const dealsLink = document.createElement('a');
      dealsLink.href = dealsUrl;
      dealsLink.download = 'deals_export.csv';
      dealsLink.click();
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
    }
  };

  // Export data as JSON
  const exportJSON = async () => {
    const token = localStorage.getItem('zander_token');
    try {
      const [contactsRes, dealsRes, usersRes, stagesRes] = await Promise.all([
        fetch('https://api.zanderos.com/contacts/export', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://api.zanderos.com/deals/export', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://api.zanderos.com/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://api.zanderos.com/pipeline-stages', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const data = {
        exportDate: new Date().toISOString(),
        contacts: await contactsRes.json().then(d => Array.isArray(d) ? d : (d.data || [])),
        deals: await dealsRes.json().then(d => Array.isArray(d) ? d : (d.data || [])),
        team: await usersRes.json(),
        pipelineStages: await stagesRes.json()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'zander_export.json';
      link.click();
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
    }
  };

  const renderSecurityTab = () => (
    <div>
      <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Two-Factor Authentication</h3>

      <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: twoFactorEnabled ? 'rgba(40, 167, 69, 0.1)' : 'rgba(108, 117, 125, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            {twoFactorEnabled ? '🔒' : '🔓'}
          </div>
          <div>
            <div style={{ fontWeight: '600', color: 'var(--zander-navy)', fontSize: '1rem' }}>
              {twoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}
            </div>
            <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>
              {twoFactorEnabled
                ? 'Your account is protected with two-factor authentication'
                : 'Add an extra layer of security to your account'}
            </div>
          </div>
        </div>

        {!twoFactorEnabled && !twoFactorSetupData && (
          <button
            onClick={setup2FA}
            disabled={twoFactorLoading}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--zander-navy)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: twoFactorLoading ? 'wait' : 'pointer',
              opacity: twoFactorLoading ? 0.7 : 1
            }}
          >
            {twoFactorLoading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
          </button>
        )}

        {twoFactorSetupData && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontWeight: '600' }}>
                Step 1: Scan this QR code with your authenticator app
              </p>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.875rem' }}>
                Use Google Authenticator, Authy, or any TOTP-compatible app
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <img src={twoFactorSetupData.qrCodeUrl} alt="2FA QR Code" style={{ width: '200px', height: '200px' }} />
              </div>
              <div style={{ background: 'var(--zander-off-white)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                  Or enter this code manually:
                </p>
                <code style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--zander-navy)', letterSpacing: '2px' }}>
                  {twoFactorSetupData.secret}
                </code>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontWeight: '600' }}>
                Step 2: Enter the 6-digit code from your app
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{
                    width: '150px',
                    padding: '0.75rem',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '8px',
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    fontWeight: '600'
                  }}
                />
                <button
                  onClick={verify2FA}
                  disabled={twoFactorLoading || twoFactorCode.length !== 6}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: twoFactorCode.length === 6 ? '#28A745' : 'var(--zander-border-gray)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: twoFactorCode.length === 6 ? 'pointer' : 'not-allowed'
                  }}
                >
                  {twoFactorLoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button
                  onClick={() => { setTwoFactorSetupData(null); setTwoFactorCode(''); }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: 'var(--zander-gray)',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {twoFactorEnabled && (
          <button
            onClick={() => setShowDisable2FAModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: 'var(--zander-red)',
              border: '2px solid var(--zander-red)',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Disable Two-Factor Authentication
          </button>
        )}
      </div>

      <h3 style={{ margin: '2rem 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Password</h3>
      <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1.5rem' }}>
        <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>
          Keep your account secure by using a strong, unique password.
        </p>
        <button
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: 'var(--zander-navy)',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Change Password
        </button>
      </div>
    </div>
  );

  const renderLegalTab = () => {
    const formatDate = (dateString: string | null) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleAcceptTerms = async () => {
      if (!termsData.currentVersion) return;

      const token = localStorage.getItem('zander_token');
      try {
        const res = await fetch('https://api.zanderos.com/legal/terms/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ version: termsData.currentVersion })
        });

        if (res.ok) {
          setTermsData(prev => ({
            ...prev,
            userVersion: prev.currentVersion,
            userAcceptedAt: new Date().toISOString(),
            needsAcceptance: false
          }));
        }
      } catch (error) {
        console.error('Failed to accept terms:', error);
      }
    };

    return (
      <div>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Terms of Service</h3>

        {termsLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--zander-gray)' }}>
            Loading...
          </div>
        ) : (
          <>
            <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: termsData.needsAcceptance ? 'rgba(240, 179, 35, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {termsData.needsAcceptance ? '⚠️' : '✓'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'var(--zander-navy)', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    {termsData.userVersion
                      ? termsData.needsAcceptance
                        ? 'Updated Terms Available'
                        : 'Terms Accepted'
                      : 'Terms Not Yet Accepted'}
                  </div>
                  <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {termsData.userVersion && (
                      <div>
                        <span style={{ fontWeight: '500' }}>Your accepted version:</span> {termsData.userVersion}
                        <br />
                        <span style={{ fontWeight: '500' }}>Accepted on:</span> {formatDate(termsData.userAcceptedAt)}
                      </div>
                    )}
                    {termsData.currentVersion && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ fontWeight: '500' }}>Current version:</span> {termsData.currentVersion}
                        {termsData.currentEffectiveDate && (
                          <>
                            <br />
                            <span style={{ fontWeight: '500' }}>Effective:</span> {formatDate(termsData.currentEffectiveDate)}
                          </>
                        )}
                      </div>
                    )}
                    {!termsData.currentVersion && (
                      <div>No terms have been published yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {termsData.needsAcceptance && termsData.currentVersion && (
              <div style={{
                background: 'rgba(240, 179, 35, 0.1)',
                border: '2px solid rgba(240, 179, 35, 0.3)',
                borderRadius: '10px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>
                  Action Required
                </div>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>
                  Please review and accept the updated Terms of Service to continue using Zander.
                </p>
                <button
                  onClick={handleAcceptTerms}
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
                  Accept Terms of Service
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <a
                href="/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'white',
                  color: 'var(--zander-navy)',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                View Full Terms
              </a>
            </div>
          </>
        )}

        <h3 style={{ margin: '2rem 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Privacy Policy</h3>
        <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>
            Learn about how we collect, use, and protect your data.
          </p>
          <a
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: 'var(--zander-navy)',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            View Privacy Policy
          </a>
        </div>
      </div>
    );
  };

  const renderDataTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Export Data</h3>
          
          <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>Download all your data in a portable format. This includes contacts, deals, communications, and settings.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{ padding: '0.75rem 1.5rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }} onClick={exportCSV}>Export as CSV</button>
              <button style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Export as JSON</button>
            </div>
          </div>

          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>Data Retention</h3>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Keep deleted items for</label>
            <select
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              style={{ width: '200px', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem', background: 'white' }}
            >
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
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.75rem' }}>{profile.firstName?.[0] || ''}{profile.lastName?.[0] || ''}</div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>{profile.firstName} {profile.lastName}</h1>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>{profile.email}</p>
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
              {activeTab === 'security' && renderSecurityTab()}
              {activeTab === 'legal' && renderLegalTab()}
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

      {/* Disable 2FA Modal */}
      {showDisable2FAModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)', fontSize: '1.3rem' }}>Disable Two-Factor Authentication</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>
              This will make your account less secure. Enter your password to confirm.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>Password</label>
              <input
                type="password"
                value={disable2FAPassword}
                onChange={(e) => setDisable2FAPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowDisable2FAModal(false); setDisable2FAPassword(''); }}
                style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={disable2FA}
                disabled={twoFactorLoading || !disable2FAPassword}
                style={{ padding: '0.75rem 1.5rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: (!disable2FAPassword || twoFactorLoading) ? 0.7 : 1 }}
              >
                {twoFactorLoading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
        </AuthGuard>
  );
}
