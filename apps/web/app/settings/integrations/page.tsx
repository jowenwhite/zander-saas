'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';
import AuthGuard from '../../components/AuthGuard';
import {
  ArrowLeft,
  Link2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface Integration {
  provider: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  connected: boolean;
  status: string;
  connectedAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
  connectPath?: string;
  disconnectPath?: string;
  comingSoon?: boolean;
  isSystemManaged?: boolean;
}

interface IntegrationsResponse {
  integrations: Integration[];
  summary: {
    total: number;
    connected: number;
    comingSoon: number;
  };
}

// Platform-specific icons (SVG)
const PlatformIcon = ({ icon, size = 32 }: { icon: string; size?: number }) => {
  const icons: Record<string, React.ReactNode> = {
    analytics: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#F9AB00" strokeWidth="2" />
        <path d="M2 17l10 5 10-5" stroke="#F9AB00" strokeWidth="2" />
        <path d="M2 12l10 5 10-5" stroke="#F9AB00" strokeWidth="2" />
      </svg>
    ),
    meta: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#0081FB" />
        <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white" />
      </svg>
    ),
    linkedin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    twitter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#000000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    canva: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#00C4CC" />
        <path d="M12 6c3.314 0 6 2.686 6 6s-2.686 6-6 6-6-2.686-6-6 2.686-6 6-6z" fill="white" />
        <circle cx="12" cy="12" r="3" fill="#7D2AE7" />
      </svg>
    ),
    resend: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#000000" />
        <path d="M22 6l-10 7L2 6" stroke="white" strokeWidth="2" />
      </svg>
    ),
  };

  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icons[icon] || <Link2 size={size} />}</div>;
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    active: { bg: 'rgba(40, 167, 69, 0.15)', color: '#28A745', icon: <CheckCircle2 size={12} />, label: 'Connected' },
    disconnected: { bg: 'rgba(136, 136, 160, 0.15)', color: '#8888A0', icon: <XCircle size={12} />, label: 'Not Connected' },
    expired: { bg: 'rgba(255, 193, 7, 0.15)', color: '#FFC107', icon: <AlertCircle size={12} />, label: 'Expired' },
    error: { bg: 'rgba(220, 53, 69, 0.15)', color: '#DC3545', icon: <AlertCircle size={12} />, label: 'Error' },
    coming_soon: { bg: 'rgba(0, 204, 238, 0.15)', color: '#00CCEE', icon: <Clock size={12} />, label: 'Coming Soon' },
  };

  const config = configs[status] || configs.disconnected;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.6rem',
        borderRadius: '20px',
        background: config.bg,
        color: config.color,
        fontSize: '0.75rem',
        fontWeight: '600',
      }}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

function IntegrationsContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      if (!token) return;

      const res = await fetch(`${apiUrl}/integrations/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: IntegrationsResponse = await res.json();
        setIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integration: Integration) => {
    if (!integration.connectPath) return;

    setActionLoading(integration.provider);
    try {
      const token = localStorage.getItem('zander_token');
      if (!token) return;

      const res = await fetch(`${apiUrl}${integration.connectPath}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data.authUrl) {
        // OAuth flow - redirect to auth URL
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!integration.disconnectPath) return;

    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      return;
    }

    setActionLoading(integration.provider);
    try {
      const token = localStorage.getItem('zander_token');
      if (!token) return;

      const res = await fetch(`${apiUrl}${integration.disconnectPath}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Refresh integrations list
        await fetchIntegrations();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group integrations by category
  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      const category = integration.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(integration);
      return acc;
    },
    {} as Record<string, Integration[]>
  );

  const categoryLabels: Record<string, string> = {
    analytics: 'Analytics & Tracking',
    social: 'Social Media',
    email: 'Email Marketing',
    design: 'Design Tools',
    other: 'Other',
  };

  const categoryOrder = ['analytics', 'social', 'email', 'design', 'other'];

  return (
    <div style={{ minHeight: '100vh', background: '#09090F' }}>
      <NavBar activeModule="cro" />

      <div style={{ display: 'flex', paddingTop: '60px' }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <main
          style={{
            flex: 1,
            marginLeft: sidebarCollapsed ? '72px' : '200px',
            transition: 'margin-left 0.3s ease',
            padding: '2rem',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <Link
              href="/settings?tab=integrations"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#8888A0',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginBottom: '1rem',
              }}
            >
              <ArrowLeft size={16} />
              Back to Settings
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1
                  style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#F0F0F5',
                    margin: 0,
                    marginBottom: '0.5rem',
                  }}
                >
                  Platform Integrations
                </h1>
                <p style={{ color: '#8888A0', margin: 0 }}>
                  Connect your marketing platforms to power AI analytics and content distribution
                </p>
              </div>

              <button
                onClick={() => fetchIntegrations()}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: '#1C1C26',
                  color: '#F0F0F5',
                  border: '2px solid #2A2A38',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                padding: '1.25rem',
                background: '#1C1C26',
                borderRadius: '12px',
                border: '2px solid #2A2A38',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#00CCEE' }}>
                {integrations.filter((i) => i.connected).length}
              </div>
              <div style={{ color: '#8888A0', fontSize: '0.9rem' }}>Connected</div>
            </div>
            <div
              style={{
                padding: '1.25rem',
                background: '#1C1C26',
                borderRadius: '12px',
                border: '2px solid #2A2A38',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8888A0' }}>
                {integrations.filter((i) => !i.connected && i.status !== 'coming_soon').length}
              </div>
              <div style={{ color: '#8888A0', fontSize: '0.9rem' }}>Available</div>
            </div>
            <div
              style={{
                padding: '1.25rem',
                background: '#1C1C26',
                borderRadius: '12px',
                border: '2px solid #2A2A38',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0B323' }}>
                {integrations.filter((i) => i.status === 'coming_soon').length}
              </div>
              <div style={{ color: '#8888A0', fontSize: '0.9rem' }}>Coming Soon</div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4rem',
              }}
            >
              <div style={{ color: '#8888A0' }}>Loading integrations...</div>
            </div>
          )}

          {/* Integration Cards by Category */}
          {!loading &&
            categoryOrder.map((category) => {
              const items = groupedIntegrations[category];
              if (!items?.length) return null;

              return (
                <div key={category} style={{ marginBottom: '2rem' }}>
                  <h2
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#F0F0F5',
                      margin: '0 0 1rem 0',
                    }}
                  >
                    {categoryLabels[category] || category}
                  </h2>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {items.map((integration) => (
                      <div
                        key={integration.provider}
                        style={{
                          padding: '1.5rem',
                          background: '#1C1C26',
                          borderRadius: '12px',
                          border: integration.connected
                            ? '2px solid #28A745'
                            : integration.status === 'coming_soon'
                              ? '2px solid #2A2A38'
                              : '2px solid #2A2A38',
                          opacity: integration.status === 'coming_soon' ? 0.7 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          {/* Icon */}
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              background: integration.connected ? 'rgba(40, 167, 69, 0.1)' : '#09090F',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <PlatformIcon icon={integration.icon} size={28} />
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.5rem',
                              }}
                            >
                              <span style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '1rem' }}>
                                {integration.name}
                              </span>
                              <StatusBadge status={integration.status} />
                            </div>

                            <p
                              style={{
                                margin: '0 0 1rem 0',
                                color: '#8888A0',
                                fontSize: '0.85rem',
                                lineHeight: '1.5',
                              }}
                            >
                              {integration.description}
                            </p>

                            {/* Connection Details */}
                            {integration.connected && integration.connectedAt && (
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: '#8888A0',
                                  marginBottom: '1rem',
                                }}
                              >
                                Connected {formatDate(integration.connectedAt)}
                                {integration.metadata?.propertyName && (
                                  <span style={{ display: 'block', marginTop: '0.25rem' }}>
                                    Property: {integration.metadata.propertyName}
                                  </span>
                                )}
                                {integration.metadata?.pageName && (
                                  <span style={{ display: 'block', marginTop: '0.25rem' }}>
                                    Page: {integration.metadata.pageName}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* System Managed Note */}
                            {integration.isSystemManaged && (
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: '#8888A0',
                                  marginBottom: '1rem',
                                  fontStyle: 'italic',
                                }}
                              >
                                System-managed integration (always active)
                              </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {integration.status === 'coming_soon' ? (
                                <button
                                  disabled
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: '#09090F',
                                    color: '#8888A0',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: 'not-allowed',
                                  }}
                                >
                                  Coming Soon
                                </button>
                              ) : integration.isSystemManaged ? (
                                <button
                                  disabled
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(40, 167, 69, 0.1)',
                                    color: '#28A745',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: 'default',
                                  }}
                                >
                                  Always Active
                                </button>
                              ) : integration.connected ? (
                                <>
                                  <button
                                    onClick={() => handleDisconnect(integration)}
                                    disabled={actionLoading === integration.provider}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      background: '#1C1C26',
                                      color: '#8888A0',
                                      border: '1px solid #2A2A38',
                                      borderRadius: '6px',
                                      fontSize: '0.85rem',
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {actionLoading === integration.provider ? 'Disconnecting...' : 'Disconnect'}
                                  </button>
                                  {integration.status === 'expired' && (
                                    <button
                                      onClick={() => handleConnect(integration)}
                                      disabled={actionLoading === integration.provider}
                                      style={{
                                        padding: '0.5rem 1rem',
                                        background: '#F0B323',
                                        color: '#09090F',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Reconnect
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => handleConnect(integration)}
                                  disabled={actionLoading === integration.provider}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: '#00CCEE',
                                    color: '#09090F',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {actionLoading === integration.provider ? 'Connecting...' : 'Connect'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </main>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <AuthGuard>
      <IntegrationsContent />
    </AuthGuard>
  );
}
