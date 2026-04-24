'use client';
import { useState, useEffect, CSSProperties, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CMOLayout, Card, LoadingSpinner } from '../components';

// GA4 Interfaces
interface GAStatus {
  connected: boolean;
  propertyId?: string;
  propertyName?: string;
  connectedAt?: string;
}

interface GAProperty {
  propertyId: string;
  displayName: string;
  accountId: string;
}

interface GAWebTrafficData {
  activeUsers: { today: number; period: number };
  sessions: number;
  pageViews: number;
  newVsReturning: { new: number; returning: number };
  topPages: Array<{ path: string; views: number; avgTimeOnPage: number }>;
  trafficSources: Array<{ source: string; medium: string; sessions: number }>;
}

// Meta Interfaces
interface MetaStatus {
  connected: boolean;
  pageId?: string;
  pageName?: string;
  instagramConnected?: boolean;
  instagramUsername?: string;
  connectedAt?: string;
  expiresAt?: string;
}

interface MetaPage {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramAccountId?: string;
  instagramUsername?: string;
}

interface MetaEngagementData {
  pageLikes: number;
  pageFollowers: number;
  postReach: { period7d: number; period30d: number };
  engagementRate: number;
  topPosts: Array<{
    id: string;
    message: string;
    createdTime: string;
    reach: number;
    engagement: number;
    type: 'facebook' | 'instagram';
  }>;
}

interface EmailAnalyticsData {
  summary: {
    totalSent: number;
    delivered: number;
    opened: number;
    bounced: number;
    complained: number;
    delayed: number;
    deliveryRate: number;
    openRate: number;
    bounceRate: number;
    complaintRate: number;
  };
  trend: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    bounced: number;
    openRate: number;
  }>;
  topEmails: Array<{
    subject: string;
    sent: number;
    delivered: number;
    opened: number;
    openRate: number;
  }>;
  hasData: boolean;
}

interface CampaignMetrics {
  id: string;
  name: string;
  status: string;
  businessUnit: string | null;
  enrollments: number;
  sent: number | null;
  openRate: number | null;
  clickRate: number | null;
  conversionRate: number | null;
}

interface FunnelMetrics {
  id: string;
  name: string;
  status: string;
  totalVisits: number;
  totalConversions: number;
  conversionRate: number;
  stages: {
    name: string;
    entryCount: number;
    exitCount: number;
    dropoffRate: number;
  }[];
}

interface AnalyticsData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalContacts: number;
    contactsThisMonth: number;
    emailsSent: number;
    emailsOpened: number;
    avgOpenRate: number | null;
    avgClickRate: number | null;
    totalSocialPosts: number;
    totalConversions: number;
  };
  campaigns: CampaignMetrics[];
  funnels: FunnelMetrics[];
  emailPerformance: {
    period: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
  hasData: {
    campaigns: boolean;
    contacts: boolean;
    emails: boolean;
    funnels: boolean;
    socialPosts: boolean;
  };
}

function CMOAnalyticsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Google Analytics state
  const [gaStatus, setGaStatus] = useState<GAStatus>({ connected: false });
  const [gaProperties, setGaProperties] = useState<GAProperty[]>([]);
  const [gaWebTraffic, setGaWebTraffic] = useState<GAWebTrafficData | null>(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [gaMessage, setGaMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Meta state
  const [metaStatus, setMetaStatus] = useState<MetaStatus>({ connected: false });
  const [metaPages, setMetaPages] = useState<MetaPage[]>([]);
  const [metaEngagement, setMetaEngagement] = useState<MetaEngagementData | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [metaMessage, setMetaMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email analytics state
  const [emailAnalytics, setEmailAnalytics] = useState<EmailAnalyticsData | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Check GA and Meta status on mount and handle OAuth callbacks
  useEffect(() => {
    checkGAStatus();
    checkMetaStatus();

    // Handle GA OAuth callback params
    const gaParam = searchParams.get('ga');
    const gaError = searchParams.get('ga_error');

    if (gaParam === 'connected') {
      setGaMessage({ type: 'success', text: 'Google Analytics connected successfully!' });
      window.history.replaceState({}, '', '/cmo/analytics');
    } else if (gaParam === 'select_property') {
      setShowPropertySelector(true);
      fetchGAProperties();
      window.history.replaceState({}, '', '/cmo/analytics');
    } else if (gaError) {
      setGaMessage({ type: 'error', text: `Connection failed: ${gaError}` });
      window.history.replaceState({}, '', '/cmo/analytics');
    }

    // Handle Meta OAuth callback params
    const metaParam = searchParams.get('meta');
    const metaError = searchParams.get('meta_error');

    if (metaParam === 'connected') {
      setMetaMessage({ type: 'success', text: 'Meta Suite connected successfully!' });
      window.history.replaceState({}, '', '/cmo/analytics');
    } else if (metaParam === 'select_page') {
      setShowPageSelector(true);
      fetchMetaPages();
      window.history.replaceState({}, '', '/cmo/analytics');
    } else if (metaError) {
      setMetaMessage({ type: 'error', text: `Connection failed: ${metaError}` });
      window.history.replaceState({}, '', '/cmo/analytics');
    }
  }, [searchParams]);

  // Fetch GA web traffic when connected and date range changes
  useEffect(() => {
    if (gaStatus.connected && gaStatus.propertyId) {
      fetchGAWebTraffic();
    }
  }, [gaStatus.connected, gaStatus.propertyId, dateRange]);

  // Fetch Meta engagement when connected and date range changes
  useEffect(() => {
    if (metaStatus.connected && metaStatus.pageId) {
      fetchMetaEngagement();
    }
  }, [metaStatus.connected, metaStatus.pageId, dateRange]);

  useEffect(() => {
    fetchAnalytics();
    fetchEmailAnalytics();
  }, [dateRange]);

  const checkGAStatus = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/google-analytics/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const status = await response.json();
        setGaStatus(status);
      }
    } catch (error) {
      console.error('Failed to check GA status:', error);
    }
  };

  const fetchGAProperties = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/google-analytics/properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGaProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Failed to fetch GA properties:', error);
    }
  };

  const fetchGAWebTraffic = async () => {
    try {
      setGaLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/google-analytics/data?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const trafficData = await response.json();
        setGaWebTraffic(trafficData);
      }
    } catch (error) {
      console.error('Failed to fetch GA web traffic:', error);
    } finally {
      setGaLoading(false);
    }
  };

  const handleGAConnect = async () => {
    try {
      setGaLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/google-analytics/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Failed to initiate GA connect:', error);
      setGaMessage({ type: 'error', text: 'Failed to connect. Please try again.' });
    } finally {
      setGaLoading(false);
    }
  };

  const handleGADisconnect = async () => {
    if (!confirm('Disconnect Google Analytics? Web traffic data will no longer be displayed.')) return;
    try {
      setGaLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      await fetch(`${apiUrl}/integrations/google-analytics/disconnect`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setGaStatus({ connected: false });
      setGaWebTraffic(null);
      setGaMessage({ type: 'success', text: 'Google Analytics disconnected' });
    } catch (error) {
      console.error('Failed to disconnect GA:', error);
    } finally {
      setGaLoading(false);
    }
  };

  const handleSelectProperty = async (property: GAProperty) => {
    try {
      setGaLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/google-analytics/select-property`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.propertyId,
          propertyName: property.displayName,
          accountId: property.accountId,
        }),
      });
      if (response.ok) {
        setGaStatus({
          connected: true,
          propertyId: property.propertyId,
          propertyName: property.displayName,
        });
        setShowPropertySelector(false);
        setGaMessage({ type: 'success', text: `Connected to ${property.displayName}` });
      }
    } catch (error) {
      console.error('Failed to select property:', error);
    } finally {
      setGaLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/analytics/overview?dateRange=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        console.error('Failed to fetch analytics:', response.status);
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailAnalytics = async () => {
    try {
      setEmailLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/analytics/email?dateRange=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const emailData = await response.json();
        setEmailAnalytics(emailData);
      } else {
        console.error('Failed to fetch email analytics:', response.status);
        setEmailAnalytics(null);
      }
    } catch (error) {
      console.error('Error fetching email analytics:', error);
      setEmailAnalytics(null);
    } finally {
      setEmailLoading(false);
    }
  };

  // Meta handler functions
  const checkMetaStatus = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/meta/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const status = await response.json();
        setMetaStatus(status);
      }
    } catch (error) {
      console.error('Failed to check Meta status:', error);
    }
  };

  const fetchMetaPages = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/meta/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMetaPages(data.pages || []);
      }
    } catch (error) {
      console.error('Failed to fetch Meta pages:', error);
    }
  };

  const fetchMetaEngagement = async () => {
    try {
      setMetaLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/meta/data?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const engagementData = await response.json();
        setMetaEngagement(engagementData);
      }
    } catch (error) {
      console.error('Failed to fetch Meta engagement:', error);
    } finally {
      setMetaLoading(false);
    }
  };

  const handleMetaConnect = async () => {
    try {
      setMetaLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/meta/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Failed to initiate Meta connect:', error);
      setMetaMessage({ type: 'error', text: 'Failed to connect. Please try again.' });
    } finally {
      setMetaLoading(false);
    }
  };

  const handleMetaDisconnect = async () => {
    if (!confirm('Disconnect Meta Suite? Social engagement data will no longer be displayed.')) return;
    try {
      setMetaLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      await fetch(`${apiUrl}/integrations/meta/disconnect`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMetaStatus({ connected: false });
      setMetaEngagement(null);
      setMetaMessage({ type: 'success', text: 'Meta Suite disconnected' });
    } catch (error) {
      console.error('Failed to disconnect Meta:', error);
    } finally {
      setMetaLoading(false);
    }
  };

  const handleSelectPage = async (page: MetaPage) => {
    try {
      setMetaLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/integrations/meta/select-page`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: page.pageId,
          pageName: page.pageName,
          pageAccessToken: page.pageAccessToken,
          instagramAccountId: page.instagramAccountId,
          instagramUsername: page.instagramUsername,
        }),
      });
      if (response.ok) {
        setMetaStatus({
          connected: true,
          pageId: page.pageId,
          pageName: page.pageName,
          instagramConnected: !!page.instagramAccountId,
          instagramUsername: page.instagramUsername,
        });
        setShowPageSelector(false);
        setMetaMessage({ type: 'success', text: `Connected to ${page.pageName}` });
      }
    } catch (error) {
      console.error('Failed to select page:', error);
    } finally {
      setMetaLoading(false);
    }
  };

  if (loading) {
    return (
      <CMOLayout>
        <div style={loadingContainerStyle}>
          <LoadingSpinner />
        </div>
      </CMOLayout>
    );
  }

  if (!data) {
    return (
      <CMOLayout>
        <Card>
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>
            Failed to load analytics data. Please try again.
          </div>
        </Card>
      </CMOLayout>
    );
  }

  const hasAnyData = data.hasData.campaigns || data.hasData.contacts || data.hasData.emails || data.hasData.funnels;

  return (
    <CMOLayout>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Marketing Analytics</h1>
          <p style={subtitleStyle}>Track campaign performance, funnel metrics, and email engagement</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid',
                borderColor: dateRange === range ? '#F57C00' : '#2A2A38',
                borderRadius: '8px',
                background: dateRange === range ? 'rgba(245, 124, 0, 0.1)' : '#1C1C26',
                color: dateRange === range ? '#F57C00' : '#8888A0',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* GA Message Toast */}
      {gaMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            background: gaMessage.type === 'success' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
            border: `1px solid ${gaMessage.type === 'success' ? '#27AE60' : '#E74C3C'}`,
            color: gaMessage.type === 'success' ? '#27AE60' : '#E74C3C',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{gaMessage.text}</span>
          <button
            onClick={() => setGaMessage(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Meta Message Toast */}
      {metaMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            background: metaMessage.type === 'success' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
            border: `1px solid ${metaMessage.type === 'success' ? '#27AE60' : '#E74C3C'}`,
            color: metaMessage.type === 'success' ? '#27AE60' : '#E74C3C',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{metaMessage.text}</span>
          <button
            onClick={() => setMetaMessage(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Marketing Integrations Section */}
      <div style={{ marginBottom: '1.5rem' }}>
      <Card>
        <div style={cardHeaderStyle}>
          <h3 style={cardTitleStyle}>Marketing Integrations</h3>
        </div>
        <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Google Analytics */}
          <div style={integrationCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ ...integrationIconStyle, background: 'rgba(245, 124, 0, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#F57C00">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '0.9rem' }}>Google Analytics</div>
                <div style={{ fontSize: '0.75rem', color: gaStatus.connected ? '#27AE60' : '#8888A0' }}>
                  {gaStatus.connected ? gaStatus.propertyName || 'Connected' : 'Not connected'}
                </div>
              </div>
            </div>
            {gaStatus.connected ? (
              <button
                onClick={handleGADisconnect}
                disabled={gaLoading}
                style={{
                  ...integrationButtonStyle,
                  background: 'transparent',
                  border: '1px solid #E74C3C',
                  color: '#E74C3C',
                }}
              >
                {gaLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            ) : (
              <button
                onClick={handleGAConnect}
                disabled={gaLoading}
                style={integrationButtonStyle}
              >
                {gaLoading ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>

          {/* Email (Resend) - Always connected */}
          <div style={integrationCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ ...integrationIconStyle, background: 'rgba(52, 152, 219, 0.1)' }}>
                <span style={{ fontSize: '1.25rem' }}>📧</span>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '0.9rem' }}>Email (Resend)</div>
                <div style={{ fontSize: '0.75rem', color: '#27AE60' }}>Platform connected</div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8888A0', textAlign: 'center' }}>
              Managed by platform
            </div>
          </div>

          {/* Meta Suite */}
          <div style={integrationCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ ...integrationIconStyle, background: 'rgba(24, 119, 242, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '0.9rem' }}>Meta Suite</div>
                <div style={{ fontSize: '0.75rem', color: metaStatus.connected ? '#27AE60' : '#8888A0' }}>
                  {metaStatus.connected
                    ? metaStatus.instagramConnected
                      ? `${metaStatus.pageName} + IG`
                      : metaStatus.pageName || 'Connected'
                    : 'Not connected'}
                </div>
              </div>
            </div>
            {metaStatus.connected ? (
              <button
                onClick={handleMetaDisconnect}
                disabled={metaLoading}
                style={{
                  ...integrationButtonStyle,
                  background: 'transparent',
                  border: '1px solid #E74C3C',
                  color: '#E74C3C',
                }}
              >
                {metaLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            ) : (
              <button
                onClick={handleMetaConnect}
                disabled={metaLoading}
                style={{ ...integrationButtonStyle, background: '#1877F2' }}
              >
                {metaLoading ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>

          {/* LinkedIn - Coming Soon */}
          <div style={{ ...integrationCardStyle, opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ ...integrationIconStyle, background: 'rgba(136, 136, 160, 0.1)' }}>
                <span style={{ fontSize: '1.25rem' }}>💼</span>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '0.9rem' }}>LinkedIn</div>
                <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>Coming soon</div>
              </div>
            </div>
            <div style={{ ...comingSoonBadgeStyle }}>Coming Soon</div>
          </div>

          {/* Twitter/X - Coming Soon */}
          <div style={{ ...integrationCardStyle, opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ ...integrationIconStyle, background: 'rgba(136, 136, 160, 0.1)' }}>
                <span style={{ fontSize: '1.25rem' }}>𝕏</span>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '0.9rem' }}>Twitter / X</div>
                <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>Coming soon</div>
              </div>
            </div>
            <div style={{ ...comingSoonBadgeStyle }}>Coming Soon</div>
          </div>

          {/* Canva - Coming Soon */}
          <div style={{ ...integrationCardStyle, opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ ...integrationIconStyle, background: 'rgba(136, 136, 160, 0.1)' }}>
                <span style={{ fontSize: '1.25rem' }}>🎨</span>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '0.9rem' }}>Canva</div>
                <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>Coming soon</div>
              </div>
            </div>
            <div style={{ ...comingSoonBadgeStyle }}>Coming Soon</div>
          </div>
        </div>
      </Card>
      </div>

      {/* Property Selector Modal */}
      {showPropertySelector && gaProperties.length > 0 && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ margin: '0 0 1rem', color: '#F0F0F5' }}>Select a GA4 Property</h3>
            <p style={{ margin: '0 0 1rem', color: '#8888A0', fontSize: '0.875rem' }}>
              Multiple properties found. Please select which one to use:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {gaProperties.map((prop) => (
                <button
                  key={prop.propertyId}
                  onClick={() => handleSelectProperty(prop)}
                  style={{
                    padding: '1rem',
                    background: '#1C1C26',
                    border: '1px solid #2A2A38',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#F0F0F5',
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{prop.displayName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>ID: {prop.propertyId}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPropertySelector(false)}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #2A2A38', borderRadius: '6px', color: '#8888A0', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Page Selector Modal (Meta) */}
      {showPageSelector && metaPages.length > 0 && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ margin: '0 0 1rem', color: '#F0F0F5' }}>Select a Facebook Page</h3>
            <p style={{ margin: '0 0 1rem', color: '#8888A0', fontSize: '0.875rem' }}>
              Multiple pages found. Please select which one to use:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {metaPages.map((page) => (
                <button
                  key={page.pageId}
                  onClick={() => handleSelectPage(page)}
                  style={{
                    padding: '1rem',
                    background: '#1C1C26',
                    border: '1px solid #2A2A38',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#F0F0F5',
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{page.pageName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                    {page.instagramUsername ? `+ Instagram: @${page.instagramUsername}` : 'No Instagram connected'}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPageSelector(false)}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #2A2A38', borderRadius: '6px', color: '#8888A0', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Overview KPIs */}
      <div style={kpiGridStyle}>
        <KPICard
          label="Total Campaigns"
          value={data.overview.totalCampaigns}
          subValue={`${data.overview.activeCampaigns} active`}
          icon="📊"
          color="#F57C00"
        />
        <KPICard
          label="Emails Sent"
          value={data.overview.emailsSent}
          subValue={data.overview.avgOpenRate !== null ? `${data.overview.avgOpenRate.toFixed(1)}% open rate` : 'No tracking data yet'}
          icon="📧"
          color="#3498DB"
        />
        <KPICard
          label="Total Contacts"
          value={data.overview.totalContacts}
          subValue={`+${data.overview.contactsThisMonth} this month`}
          icon="👥"
          color="#27AE60"
        />
        <KPICard
          label="Conversions"
          value={data.overview.totalConversions}
          subValue={data.overview.avgClickRate !== null ? `${data.overview.avgClickRate.toFixed(1)}% click rate` : 'Funnel conversions'}
          icon="🎯"
          color="#9B59B6"
        />
      </div>

      {/* Web Traffic Section - only shown when GA is connected */}
      {gaStatus.connected && (
        <div style={{ marginBottom: '1.5rem' }}>
        <Card>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={cardTitleStyle}>Web Traffic</h3>
              {gaStatus.propertyName && (
                <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                  {gaStatus.propertyName}
                </span>
              )}
            </div>
          </div>
          {gaLoading && !gaWebTraffic ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <LoadingSpinner />
              <p style={{ color: '#8888A0', marginTop: '1rem' }}>Loading web traffic data...</p>
            </div>
          ) : gaWebTraffic ? (
            <div style={{ padding: '1rem' }}>
              {/* Traffic KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={trafficKpiStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>Active Users Today</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5' }}>
                    {formatNumber(gaWebTraffic.activeUsers.today)}
                  </div>
                </div>
                <div style={trafficKpiStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>Total Sessions</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5' }}>
                    {formatNumber(gaWebTraffic.sessions)}
                  </div>
                </div>
                <div style={trafficKpiStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>Page Views</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5' }}>
                    {formatNumber(gaWebTraffic.pageViews)}
                  </div>
                </div>
                <div style={trafficKpiStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>New vs Returning</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#F0F0F5' }}>
                    <span style={{ color: '#27AE60' }}>{formatNumber(gaWebTraffic.newVsReturning.new)}</span>
                    <span style={{ color: '#8888A0' }}> / </span>
                    <span style={{ color: '#3498DB' }}>{formatNumber(gaWebTraffic.newVsReturning.returning)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Top Pages */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#F0F0F5' }}>
                    Top Pages
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {gaWebTraffic.topPages.slice(0, 5).map((page, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem 0.75rem',
                          background: '#1C1C26',
                          borderRadius: '6px',
                        }}
                      >
                        <span style={{ fontSize: '0.875rem', color: '#F0F0F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                          {page.path}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#F57C00' }}>
                          {formatNumber(page.views)}
                        </span>
                      </div>
                    ))}
                    {gaWebTraffic.topPages.length === 0 && (
                      <div style={{ color: '#8888A0', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>
                        No page data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Traffic Sources */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#F0F0F5' }}>
                    Traffic Sources
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {gaWebTraffic.trafficSources.slice(0, 5).map((source, idx) => {
                      const maxSessions = Math.max(...gaWebTraffic.trafficSources.map((s) => s.sessions), 1);
                      const percentage = (source.sessions / maxSessions) * 100;
                      return (
                        <div key={idx} style={{ padding: '0.5rem 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.875rem', color: '#F0F0F5' }}>
                              {source.source} / {source.medium}
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#3498DB' }}>
                              {formatNumber(source.sessions)}
                            </span>
                          </div>
                          <div style={{ height: '6px', background: '#2A2A38', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${percentage}%`,
                                background: 'linear-gradient(90deg, #3498DB, #27AE60)',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {gaWebTraffic.trafficSources.length === 0 && (
                      <div style={{ color: '#8888A0', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>
                        No traffic source data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>
              <p>Unable to load web traffic data. Please try again.</p>
            </div>
          )}
        </Card>
        </div>
      )}

      {/* Email Performance Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Card>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📧</span>
              <div>
                <h3 style={{ ...cardTitleStyle, margin: 0 }}>Email Performance</h3>
                <p style={{ color: '#8888A0', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                  Delivery, open rates, and engagement metrics
                </p>
              </div>
            </div>
          </div>

          {emailLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <p>Loading email performance data...</p>
            </div>
          ) : emailAnalytics?.hasData ? (
            <div>
              {/* Email KPIs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                padding: '1.5rem',
                borderBottom: '1px solid #2A2A38'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total Sent</div>
                  <div style={{ color: '#F0F0F5', fontSize: '1.75rem', fontWeight: '700' }}>
                    {formatNumber(emailAnalytics.summary.totalSent)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Delivered</div>
                  <div style={{ color: '#27AE60', fontSize: '1.75rem', fontWeight: '700' }}>
                    {emailAnalytics.summary.deliveryRate}%
                  </div>
                  <div style={{ color: '#8888A0', fontSize: '0.65rem' }}>
                    {formatNumber(emailAnalytics.summary.delivered)} emails
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Opened</div>
                  <div style={{ color: '#3498DB', fontSize: '1.75rem', fontWeight: '700' }}>
                    {emailAnalytics.summary.openRate}%
                  </div>
                  <div style={{ color: '#8888A0', fontSize: '0.65rem' }}>
                    {formatNumber(emailAnalytics.summary.opened)} opens
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Bounced</div>
                  <div style={{ color: emailAnalytics.summary.bounceRate > 5 ? '#E74C3C' : '#F57C00', fontSize: '1.75rem', fontWeight: '700' }}>
                    {emailAnalytics.summary.bounceRate}%
                  </div>
                  <div style={{ color: '#8888A0', fontSize: '0.65rem' }}>
                    {formatNumber(emailAnalytics.summary.bounced)} bounced
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Complaints</div>
                  <div style={{ color: emailAnalytics.summary.complaintRate > 0.1 ? '#E74C3C' : '#8888A0', fontSize: '1.75rem', fontWeight: '700' }}>
                    {emailAnalytics.summary.complaintRate}%
                  </div>
                  <div style={{ color: '#8888A0', fontSize: '0.65rem' }}>
                    {formatNumber(emailAnalytics.summary.complained)} spam reports
                  </div>
                </div>
              </div>

              {/* Trend Chart and Top Emails */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.5rem' }}>
                {/* Daily Trend */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#F0F0F5' }}>
                    Daily Trend
                  </h4>
                  {emailAnalytics.trend.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {emailAnalytics.trend.slice(-7).map((day) => {
                        const maxSent = Math.max(...emailAnalytics.trend.map(t => t.sent), 1);
                        const percentage = (day.sent / maxSent) * 100;
                        return (
                          <div key={day.date} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#8888A0', width: '60px', flexShrink: 0 }}>
                              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <div style={{ flex: 1, height: '20px', background: '#1C1C26', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                              <div
                                style={{
                                  width: `${(day.delivered / day.sent) * percentage}%`,
                                  height: '100%',
                                  background: '#27AE60',
                                }}
                                title={`Delivered: ${day.delivered}`}
                              />
                              <div
                                style={{
                                  width: `${(day.opened / day.sent) * percentage}%`,
                                  height: '100%',
                                  background: '#3498DB',
                                  marginLeft: '-1px',
                                }}
                                title={`Opened: ${day.opened}`}
                              />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#F0F0F5', width: '35px', textAlign: 'right' }}>
                              {day.sent}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: '#8888A0', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>
                      No trend data available
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: '#27AE60', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ width: '8px', height: '8px', background: '#27AE60', borderRadius: '2px' }} /> Delivered
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#3498DB', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ width: '8px', height: '8px', background: '#3498DB', borderRadius: '2px' }} /> Opened
                    </span>
                  </div>
                </div>

                {/* Top Performing Emails */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#F0F0F5' }}>
                    Top Performing Emails
                  </h4>
                  {emailAnalytics.topEmails.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {emailAnalytics.topEmails.slice(0, 5).map((email, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 0.75rem',
                            background: '#1C1C26',
                            borderRadius: '6px',
                          }}
                        >
                          <span style={{
                            fontSize: '0.8rem',
                            color: '#F0F0F5',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '60%'
                          }}>
                            {email.subject}
                          </span>
                          <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                              {email.sent} sent
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#3498DB' }}>
                              {email.openRate}% open
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#8888A0', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>
                      Send at least 3 emails with the same subject to see performance data
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ color: '#F0F0F5', margin: '0 0 0.5rem', fontSize: '1.125rem' }}>
                No Email Data Yet
              </h3>
              <p style={{ color: '#8888A0', margin: '0 0 1rem', fontSize: '0.875rem', maxWidth: '350px', marginLeft: 'auto', marginRight: 'auto' }}>
                Send emails through campaigns or templates to see delivery and engagement metrics here.
              </p>
              <a
                href="/cmo/templates"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: 'rgba(52, 152, 219, 0.15)',
                  color: '#3498DB',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}
              >
                Create Email Template
              </a>
            </div>
          )}
        </Card>
      </div>

      {/* Social Engagement Section - Meta Suite */}
      {metaStatus.connected && (
        <div style={{ marginTop: '2rem' }}>
        <Card>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📱</span>
              <div>
                <h3 style={{ ...cardTitleStyle, margin: 0 }}>Social Engagement</h3>
                <p style={{ color: '#8888A0', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                  {metaStatus.pageName}
                  {metaStatus.instagramConnected && ` • @${metaStatus.instagramUsername}`}
                </p>
              </div>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
              style={{
                background: '#2A2A3E',
                border: '1px solid #3A3A4E',
                borderRadius: '6px',
                color: '#F0F0F5',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {metaLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <p>Loading social engagement data...</p>
            </div>
          ) : metaEngagement ? (
            <div>
              {/* Engagement KPIs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                padding: '1.5rem',
                borderBottom: '1px solid #3A3A4E'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Page Likes</div>
                  <div style={{ color: '#F0F0F5', fontSize: '1.75rem', fontWeight: '700' }}>
                    {metaEngagement.pageLikes.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Followers</div>
                  <div style={{ color: '#F0F0F5', fontSize: '1.75rem', fontWeight: '700' }}>
                    {metaEngagement.pageFollowers.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Post Reach (7d)</div>
                  <div style={{ color: '#F0F0F5', fontSize: '1.75rem', fontWeight: '700' }}>
                    {metaEngagement.postReach.period7d.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Post Reach (30d)</div>
                  <div style={{ color: '#F0F0F5', fontSize: '1.75rem', fontWeight: '700' }}>
                    {metaEngagement.postReach.period30d.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Engagement Rate</div>
                  <div style={{ color: '#27AE60', fontSize: '1.75rem', fontWeight: '700' }}>
                    {metaEngagement.engagementRate.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Top Posts */}
              <div style={{ padding: '1.5rem' }}>
                <h4 style={{ color: '#F0F0F5', fontSize: '1rem', margin: '0 0 1rem', fontWeight: '600' }}>
                  Top Recent Posts
                </h4>
                {metaEngagement.topPosts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {metaEngagement.topPosts.slice(0, 5).map((post) => (
                      <div
                        key={post.id}
                        style={{
                          background: '#2A2A3E',
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '4px',
                              background: post.type === 'instagram' ? '#E1306C' : '#1877F2',
                              color: 'white'
                            }}>
                              {post.type === 'instagram' ? 'IG' : 'FB'}
                            </span>
                            <span style={{ color: '#8888A0', fontSize: '0.75rem' }}>
                              {new Date(post.createdTime).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{
                            color: '#F0F0F5',
                            fontSize: '0.875rem',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {post.message || '(No caption)'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#8888A0', fontSize: '0.625rem', textTransform: 'uppercase' }}>Reach</div>
                            <div style={{ color: '#3498DB', fontSize: '1rem', fontWeight: '600' }}>
                              {post.reach.toLocaleString()}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#8888A0', fontSize: '0.625rem', textTransform: 'uppercase' }}>Engagement</div>
                            <div style={{ color: '#27AE60', fontSize: '1rem', fontWeight: '600' }}>
                              {post.engagement.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#8888A0', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                    No posts found in this time period
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>
              <p>Unable to load social engagement data. Please try again.</p>
            </div>
          )}
        </Card>
        </div>
      )}

      {/* Social Engagement Empty State - when Meta not connected */}
      {!metaStatus.connected && gaStatus.connected && (
        <div style={{ marginTop: '2rem' }}>
        <Card>
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
            <h3 style={{ color: '#F0F0F5', margin: '0 0 0.5rem', fontSize: '1.25rem' }}>
              Social Engagement
            </h3>
            <p style={{ color: '#8888A0', margin: '0 0 1.5rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              Connect Meta Suite to see your Facebook &amp; Instagram engagement metrics, including page likes, followers, post reach, and top performing content.
            </p>
            <button
              onClick={handleMetaConnect}
              disabled={metaLoading}
              style={{
                background: 'linear-gradient(135deg, #1877F2, #E1306C)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: metaLoading ? 'not-allowed' : 'pointer',
                opacity: metaLoading ? 0.7 : 1,
              }}
            >
              {metaLoading ? 'Connecting...' : 'Connect Meta Suite'}
            </button>
          </div>
        </Card>
        </div>
      )}

      {/* Getting Started Guide - shown when no data */}
      {!hasAnyData && (
        <Card>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
            <h2 style={{ color: '#F0F0F5', margin: '0 0 0.5rem', fontSize: '1.25rem' }}>
              Welcome to Marketing Analytics
            </h2>
            <p style={{ color: '#8888A0', margin: '0 0 1.5rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
              Start building your marketing engine to see real analytics here. Create campaigns, add contacts, and send emails to track your performance.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/cmo/campaigns" style={ctaButtonStyle}>
                Create Campaign
              </a>
              <a href="/crm/contacts" style={secondaryButtonStyle}>
                Add Contacts
              </a>
              <a href="/cmo/funnels" style={secondaryButtonStyle}>
                Build Funnel
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div style={contentGridStyle}>
        {/* Campaign Performance */}
        <Card>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Campaign Performance</h3>
          </div>
          {data.campaigns.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No campaigns yet"
              description="Create your first campaign to start tracking performance metrics."
              actionLabel="Create Campaign"
              actionHref="/cmo/campaigns"
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Campaign</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Enrollments</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '600', color: '#F0F0F5' }}>
                            {campaign.name}
                          </span>
                          {campaign.businessUnit && (
                            <span style={businessUnitBadgeStyle}>
                              {campaign.businessUnit}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {campaign.enrollments}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: campaign.status === 'active' ? 'rgba(39, 174, 96, 0.15)' : 'rgba(136, 136, 160, 0.15)',
                          color: campaign.status === 'active' ? '#27AE60' : '#8888A0',
                        }}>
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Email Performance Chart */}
        <Card>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Email Performance</h3>
          </div>
          {data.emailPerformance.length === 0 ? (
            <EmptyState
              icon="📧"
              title="No email data yet"
              description="Send emails through campaigns to see performance metrics here."
              actionLabel="Go to Campaigns"
              actionHref="/cmo/campaigns"
            />
          ) : (
            <div style={{ padding: '1rem' }}>
              {data.emailPerformance.map((week, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#F0F0F5' }}>
                      {week.period}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                      {week.sent} sent
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', height: '24px' }}>
                    <div
                      style={{
                        flex: week.opened || 1,
                        background: '#3498DB',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                      }}
                      title={`Opened: ${week.opened}`}
                    >
                      {week.opened > 100 && `${((week.opened / week.sent) * 100).toFixed(0)}%`}
                    </div>
                    {week.clicked > 0 && (
                      <div
                        style={{
                          flex: week.clicked,
                          background: '#27AE60',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                        }}
                        title={`Clicked: ${week.clicked}`}
                      >
                        {week.clicked > 50 && `${((week.clicked / week.sent) * 100).toFixed(0)}%`}
                      </div>
                    )}
                    <div
                      style={{
                        flex: Math.max(week.sent - week.opened, 1),
                        background: 'var(--zander-border-gray)',
                        borderRadius: '4px',
                      }}
                      title={`Not opened: ${week.sent - week.opened}`}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#3498DB' }}>Opened: {week.opened}</span>
                    {week.clicked > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#27AE60' }}>Clicked: {week.clicked}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Funnel Analytics */}
      <div style={{ marginTop: '1.5rem' }}>
        <Card>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Funnel Performance</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {data.funnels.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="No funnels created"
                description="Create marketing funnels to track visitor journeys and conversions."
                actionLabel="Create Funnel"
                actionHref="/cmo/funnels"
              />
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {data.funnels.map((funnel) => (
                  <div key={funnel.id} style={funnelCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#F0F0F5' }}>
                          {funnel.name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                          {funnel.stages.length} stages
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: funnel.conversionRate > 0 ? '#27AE60' : '#8888A0' }}>
                          {funnel.conversionRate.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                          conversion rate
                        </div>
                      </div>
                    </div>

                    {/* Funnel Visualization */}
                    {funnel.stages.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {funnel.stages.map((stage, i) => (
                          <div key={i} style={{ flex: 1, position: 'relative' }}>
                            <div
                              style={{
                                background: `hsl(${200 - i * 30}, 70%, ${50 + i * 5}%)`,
                                padding: '0.75rem 0.5rem',
                                borderRadius: '4px',
                                textAlign: 'center',
                                clipPath: i < funnel.stages.length - 1
                                  ? 'polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)'
                                  : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                                marginRight: i < funnel.stages.length - 1 ? '-8px' : 0,
                              }}
                            >
                              <div style={{ fontSize: '0.65rem', color: 'white', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {stage.name}
                              </div>
                              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white' }}>
                                {formatNumber(stage.entryCount)}
                              </div>
                            </div>
                            {i < funnel.stages.length - 1 && stage.dropoffRate > 0 && (
                              <div style={{
                                position: 'absolute',
                                bottom: '-18px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '0.6rem',
                                color: '#E74C3C',
                                whiteSpace: 'nowrap',
                              }}>
                                -{stage.dropoffRate.toFixed(0)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem', color: '#8888A0', fontSize: '0.875rem' }}>
                        No stages configured. Edit this funnel to add stages.
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #2A2A38' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>Total Visits</span>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#F0F0F5' }}>
                          {formatNumber(funnel.totalVisits)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>Conversions</span>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: funnel.totalConversions > 0 ? '#27AE60' : '#8888A0' }}>
                          {formatNumber(funnel.totalConversions)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </CMOLayout>
  );
}

// Empty State Component
function EmptyState({ icon, title, description, actionLabel, actionHref }: {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{icon}</div>
      <h4 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem', fontWeight: '600' }}>
        {title}
      </h4>
      <p style={{ margin: 0, color: '#8888A0', fontSize: '0.875rem', maxWidth: '280px' }}>
        {description}
      </p>
      <a
        href={actionHref}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(245, 124, 0, 0.15)',
          color: '#F57C00',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: '600',
        }}
      >
        {actionLabel}
      </a>
    </div>
  );
}

// KPI Card Component
function KPICard({ label, value, subValue, icon, color }: {
  label: string;
  value: string | number;
  subValue: string;
  icon: string;
  color: string;
}) {
  return (
    <div style={kpiCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5' }}>
            {typeof value === 'number' ? formatNumber(value) : value}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8888A0', marginTop: '0.25rem' }}>
            {subValue}
          </div>
        </div>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Utility function
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

// Styles
const loadingContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

const titleStyle: CSSProperties = {
  fontSize: '2rem',
  fontWeight: '700',
  color: '#F0F0F5',
  margin: 0,
  marginBottom: '0.25rem',
};

const subtitleStyle: CSSProperties = {
  color: '#8888A0',
  margin: 0,
};

const kpiGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const kpiCardStyle: CSSProperties = {
  background: '#1C1C26',
  borderRadius: '12px',
  border: '1px solid #2A2A38',
  padding: '1.25rem',
};

const contentGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr',
  gap: '1.5rem',
};

const cardHeaderStyle: CSSProperties = {
  padding: '1rem 1.25rem',
  borderBottom: '1px solid #2A2A38',
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '600',
  color: '#F0F0F5',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: '#8888A0',
  textTransform: 'uppercase',
  borderBottom: '1px solid #2A2A38',
};

const tdStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  color: '#F0F0F5',
  borderBottom: '1px solid #2A2A38',
};

const businessUnitBadgeStyle: CSSProperties = {
  padding: '0.125rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.65rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  background: 'rgba(245, 124, 0, 0.1)',
  color: '#F57C00',
};

const funnelCardStyle: CSSProperties = {
  background: '#1C1C26',
  borderRadius: '8px',
  padding: '1.25rem',
};

const ctaButtonStyle: CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: '#F57C00',
  color: 'white',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '0.875rem',
};

const secondaryButtonStyle: CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: 'transparent',
  color: '#F0F0F5',
  border: '2px solid #2A2A38',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '0.875rem',
};

// Integration Card Styles
const integrationCardStyle: CSSProperties = {
  background: '#1C1C26',
  borderRadius: '8px',
  border: '1px solid #2A2A38',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
};

const integrationIconStyle: CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const integrationButtonStyle: CSSProperties = {
  padding: '0.5rem 1rem',
  background: '#F57C00',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '0.8rem',
  cursor: 'pointer',
  width: '100%',
};

const comingSoonBadgeStyle: CSSProperties = {
  padding: '0.5rem 1rem',
  background: 'rgba(136, 136, 160, 0.1)',
  color: '#8888A0',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: '600',
  textAlign: 'center',
};

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: CSSProperties = {
  background: '#09090F',
  borderRadius: '12px',
  border: '1px solid #2A2A38',
  padding: '1.5rem',
  maxWidth: '400px',
  width: '90%',
};

const trafficKpiStyle: CSSProperties = {
  background: '#1C1C26',
  borderRadius: '8px',
  padding: '1rem',
  textAlign: 'center',
};

// Wrapper component with Suspense boundary for useSearchParams
export default function CMOAnalyticsPage() {
  return (
    <Suspense fallback={
      <CMOLayout>
        <div style={loadingContainerStyle}>
          <LoadingSpinner />
        </div>
      </CMOLayout>
    }>
      <CMOAnalyticsContent />
    </Suspense>
  );
}
