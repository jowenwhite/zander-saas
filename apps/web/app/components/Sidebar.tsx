'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import OnboardingChecklist from './OnboardingChecklist';
import TenantSwitcher from './TenantSwitcher';
import { LayoutDashboard, FolderKanban, Users, Package, Mail, Calendar, ClipboardList, Bot, Landmark, Shield, ClipboardCheck, UserCircle2, ChevronLeft, ChevronRight, Lock, Clock, Megaphone, DollarSign, Settings, Users2, Server } from 'lucide-react';
import { useTier, SubscriptionTier } from '../contexts/TierContext';
import { EXECUTIVE_TIERS, hasExecutiveAccess, getRequiredTier, getTierConfig, isComingSoon } from '../../lib/tier-config';
import UpgradeModal from './UpgradeModal';
import ComingSoonModal from './ComingSoonModal';

const SIDEBAR_COLLAPSED_KEY = 'zander_sidebar_collapsed';

// All executives with their sidebar configuration
// Note: comingSoon status is determined by isComingSoon() from tier-config.ts
const EXECUTIVE_CONFIGS = [
  { id: 'pam', icon: UserCircle2, label: 'Pam', role: 'EA', fullTitle: 'Executive Assistant', href: '/ea', color: '#C2185B' },
  { id: 'jordan', icon: Bot, label: 'Jordan', role: 'CRO', fullTitle: 'Chief Revenue Officer', href: '/ai', color: '#00CCEE' },
  { id: 'don', icon: Megaphone, label: 'Don', role: 'CMO', fullTitle: 'Chief Marketing Officer', href: '/cmo', color: '#F57C00' },
  { id: 'ben', icon: DollarSign, label: 'Ben', role: 'CFO', fullTitle: 'Chief Financial Officer', href: '/cfo', color: '#2E7D32' },
  { id: 'miranda', icon: Settings, label: 'Miranda', role: 'COO', fullTitle: 'Chief Operations Officer', href: '/coo', color: '#5E35B1' },
  { id: 'ted', icon: Users2, label: 'Ted', role: 'CPO', fullTitle: 'Chief People Officer', href: '/cpo', color: '#0288D1' },
  { id: 'jarvis', icon: Server, label: 'Jarvis', role: 'CIO', fullTitle: 'Chief Information Officer', href: '/cio', color: '#455A64' },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { tier, loading: tierLoading } = useTier();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showOnboardingChecklist, setShowOnboardingChecklist] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Modal states
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState<typeof EXECUTIVE_CONFIGS[0] | null>(null);

  // Use controlled value if provided, otherwise use internal state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      const savedCollapsed = stored === 'true';
      setInternalCollapsed(savedCollapsed);
      onCollapsedChange?.(savedCollapsed);
    } else {
      // Default based on screen width
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1280;
      if (isTablet) {
        setInternalCollapsed(true);
        onCollapsedChange?.(true);
      }
    }
  }, [onCollapsedChange]);

  const toggleCollapsed = useCallback(() => {
    const newValue = !isCollapsed;
    setInternalCollapsed(newValue);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
    onCollapsedChange?.(newValue);
  }, [isCollapsed, onCollapsedChange]);

  useEffect(() => {
    const userStr = localStorage.getItem('zander_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsSuperAdmin(user.isSuperAdmin || false);
      } catch (e) {}
    }

    // Check if checklist was dismissed
    const dismissed = localStorage.getItem('zander_checklist_dismissed') === 'true';
    setChecklistDismissed(dismissed);

    // Check onboarding status
    const checkOnboarding = async () => {
      try {
        const token = localStorage.getItem('zander_token');
        if (!token) return;
        
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/users/onboarding/status', {
          headers: { Authorization: 'Bearer ' + token },
        });
        if (res.ok) {
          const data = await res.json();
          // Show checklist if onboarding wizard was completed and not dismissed
          if (data.onboardingCompleted && !dismissed) {
            setShowOnboardingChecklist(true);
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding:', error);
      }
    };
    checkOnboarding();
  }, []);

  const dismissChecklist = () => {
    setShowOnboardingChecklist(false);
    setChecklistDismissed(true);
    localStorage.setItem('zander_checklist_dismissed', 'true');
  };

  const showChecklist = () => {
    setShowOnboardingChecklist(true);
    setChecklistDismissed(false);
    localStorage.setItem('zander_checklist_dismissed', 'false');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const salesRevenueItems = [
    { icon: LayoutDashboard, label: 'Production', href: '/production' },
    { icon: FolderKanban, label: 'Projects', href: '/projects' },
    { icon: Users, label: 'People', href: '/people' },
    { icon: Package, label: 'Products', href: '/products' },
  ];

  const processItems = [
    { icon: Mail, label: 'Communication', href: '/communication' },
    { icon: Calendar, label: 'Schedule', href: '/schedule' },
    { icon: ClipboardList, label: 'Forms', href: '/forms' },
  ];

  // Determine executive access states
  const getExecutiveState = (exec: typeof EXECUTIVE_CONFIGS[0]): 'active' | 'locked' | 'coming_soon' => {
    // Check if coming soon (null tier in config = coming soon)
    if (isComingSoon(exec.id)) return 'coming_soon';
    if (!tier) return 'locked'; // Loading or not authenticated
    const effectiveTier = tier.effectiveTier;
    const hasAccess = hasExecutiveAccess(effectiveTier, exec.id);
    return hasAccess ? 'active' : 'locked';
  };

  const handleExecutiveClick = (exec: typeof EXECUTIVE_CONFIGS[0], state: 'active' | 'locked' | 'coming_soon') => {
    if (state === 'coming_soon') {
      setSelectedExecutive(exec);
      setComingSoonModalOpen(true);
    } else if (state === 'locked') {
      setSelectedExecutive(exec);
      setUpgradeModalOpen(true);
    }
    // For 'active', we just let the link navigate normally
  };

  const linkStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    color: active ? '#00CCEE' : '#F0F0F5',
    background: active ? 'rgba(0,204,238,0.1)' : 'transparent',
    fontWeight: active ? '600' : '400',
    transition: 'all 0.2s ease'
  });

  const sectionHeaderStyle = {
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    color: '#55556A',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '0.75rem',
    display: isCollapsed ? 'none' : 'block'
  };

  return (
    <aside style={{
      width: isCollapsed ? '64px' : '240px',
      background: '#09090F',
      borderRight: '2px solid #2A2A38',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      overflowY: 'auto',
      zIndex: 950,
      transition: 'width 200ms ease',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapsed}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute',
          top: '72px', // Below navbar (64px) + margin
          right: isCollapsed ? '50%' : '8px',
          transform: isCollapsed ? 'translateX(50%)' : 'none',
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: '#1C1C26',
          border: '1px solid #2A2A38',
          color: '#8888A0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 200ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2A2A38';
          e.currentTarget.style.color = '#00CCEE';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#1C1C26';
          e.currentTarget.style.color = '#8888A0';
        }}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo and Tenant Switcher */}
      <div style={{
        padding: isCollapsed ? '52px 8px 16px' : '52px 12px 20px 12px',
        borderBottom: '1px solid #2A2A38',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        transition: 'padding 200ms ease',
      }}>
        {isCollapsed ? (
          // Collapsed: Show Z icon only
          <a href="/" style={{ display: 'block', textDecoration: 'none' }} title="Zander">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00CCEE 0%, #0088AA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: '700',
            }}>
              Z
            </div>
          </a>
        ) : (
          <>
            <div style={{ marginBottom: '12px' }}>
              <a href="/" style={{ display: 'block', textDecoration: 'none' }}>
                <img
                  src="/images/zander-logo.svg"
                  alt="Zander"
                  style={{
                    width: '200px',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto'
                  }}
                />
              </a>
            </div>
            <TenantSwitcher />
          </>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ padding: '1.5rem 1rem 1rem' }}>
          <div style={sectionHeaderStyle}>
            Sales & Revenue
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {salesRevenueItems.map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a
                  href={item.href}
                  style={{
                    ...linkStyle(isActive(item.href)),
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} strokeWidth={2} style={{ color: 'inherit' }} />
                  {!isCollapsed && <span>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ padding: '0 1rem' }}>
          <div style={sectionHeaderStyle}>
            Process
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {processItems.map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a
                  href={item.href}
                  style={{
                    ...linkStyle(isActive(item.href)),
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} strokeWidth={2} style={{ color: 'inherit' }} />
                  {!isCollapsed && <span>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Team Section */}
        <div style={{ padding: '1rem 1rem 0' }}>
          <div style={sectionHeaderStyle}>
            AI Team
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {EXECUTIVE_CONFIGS.map((exec) => {
              const state = getExecutiveState(exec);
              const isLocked = state === 'locked';
              const isExecComingSoon = state === 'coming_soon';
              const isExecActive = isActive(exec.href);

              return (
                <li key={exec.id} style={{ marginBottom: '0.25rem' }}>
                  {state === 'active' ? (
                    <a
                      href={exec.href}
                      style={{
                        ...linkStyle(isExecActive),
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                      }}
                      title={isCollapsed ? `${exec.label} (${exec.role})` : undefined}
                    >
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: exec.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: 'white',
                        }}>
                          {exec.label[0]}
                        </div>
                      </div>
                      {!isCollapsed && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {exec.label}
                          <span style={{ fontSize: '0.7rem', color: '#8888A0' }}>({exec.role})</span>
                        </span>
                      )}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleExecutiveClick(exec, state)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isExecComingSoon ? '#55556A' : '#8888A0',
                        background: 'transparent',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        fontWeight: '400',
                        transition: 'all 0.2s ease',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        opacity: isExecComingSoon ? 0.6 : 0.8,
                      }}
                      title={isCollapsed ? `${exec.label} (${exec.role}) - ${isExecComingSoon ? 'Coming Q4 2026' : 'Upgrade Required'}` : undefined}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isExecComingSoon ? '#2A2A38' : exec.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: 'white',
                          opacity: isExecComingSoon ? 0.5 : 0.7,
                        }}>
                          {exec.label[0]}
                        </div>
                        {/* Lock or Clock overlay */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-4px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: '#09090F',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {isExecComingSoon ? (
                            <Clock size={10} style={{ color: '#55556A' }} />
                          ) : (
                            <Lock size={10} style={{ color: '#F0B429' }} />
                          )}
                        </div>
                      </div>
                      {!isCollapsed && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {exec.label}
                          <span style={{ fontSize: '0.7rem', color: '#55556A' }}>({exec.role})</span>
                        </span>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Admin Section - SuperAdmin Only */}
        {isSuperAdmin && (
          <div style={{ padding: '1rem', borderTop: '2px solid #2A2A38', marginTop: '1rem' }}>
            <div style={sectionHeaderStyle}>
              Admin
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li style={{ marginBottom: '0.25rem' }}>
                <a
                  href="/admin/treasury"
                  style={{
                    ...linkStyle(isActive('/admin/treasury')),
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                  }}
                  title={isCollapsed ? 'Treasury Admin' : undefined}
                >
                  <Landmark size={20} strokeWidth={2} style={{ color: 'inherit' }} />
                  {!isCollapsed && <span>Treasury Admin</span>}
                </a>
              </li>
              <li style={{ marginBottom: '0.25rem' }}>
                <a
                  href="/admin/support-admin"
                  style={{
                    ...linkStyle(isActive('/admin/support-admin')),
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                  }}
                  title={isCollapsed ? 'Support Admin' : undefined}
                >
                  <Shield size={20} strokeWidth={2} style={{ color: 'inherit' }} />
                  {!isCollapsed && <span>Support Admin</span>}
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Onboarding Checklist or Show Button */}
      {!isCollapsed && (
        <div style={{ borderTop: '2px solid #2A2A38' }}>
          {showOnboardingChecklist ? (
            <OnboardingChecklist onDismiss={dismissChecklist} />
          ) : checklistDismissed && (
            <button
              onClick={showChecklist}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'transparent',
                border: 'none',
                color: '#8888A0',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,204,238,0.05)';
                e.currentTarget.style.color = '#00CCEE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#8888A0';
              }}
            >
              <ClipboardCheck size={16} strokeWidth={2} />
              <span>Show Getting Started</span>
            </button>
          )}
        </div>
      )}

      {/* Upgrade Modal */}
      {upgradeModalOpen && selectedExecutive && (
        <UpgradeModal
          executive={selectedExecutive}
          currentTier={tier?.effectiveTier || 'FREE'}
          onClose={() => {
            setUpgradeModalOpen(false);
            setSelectedExecutive(null);
          }}
        />
      )}

      {/* Coming Soon Modal */}
      {comingSoonModalOpen && selectedExecutive && (
        <ComingSoonModal
          executive={selectedExecutive}
          onClose={() => {
            setComingSoonModalOpen(false);
            setSelectedExecutive(null);
          }}
        />
      )}
    </aside>
  );
}