'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import OnboardingChecklist from './OnboardingChecklist';
import TenantSwitcher from './TenantSwitcher';
import { LayoutDashboard, FolderKanban, Users, Package, Mail, Calendar, ClipboardList, Bot, Landmark, Shield, ClipboardCheck } from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showOnboardingChecklist, setShowOnboardingChecklist] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);

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
    { icon: Bot, label: 'Ask Jordan (CRO)', href: '/ai' },
  ];

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
    display: collapsed ? 'none' : 'block'
  };

  return (
    <aside style={{
      width: collapsed ? '64px' : '240px',
      background: '#09090F',
      borderRight: '2px solid #2A2A38',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      overflowY: 'auto',
      zIndex: 950,
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo and Tenant Switcher */}
      {!collapsed && (
        <div style={{
          padding: '20px 16px 16px 16px',
          borderBottom: '1px solid #2A2A38'
        }}>
          <div style={{
            marginBottom: '12px'
          }}>
            <a href="/" style={{ display: 'block', textDecoration: 'none' }}>
              <img
                src="/images/zander-logo.svg"
                alt="Zander"
                style={{
                  width: '160px',
                  height: 'auto',
                  display: 'block',
                  maxWidth: '100%'
                }}
              />
            </a>
          </div>
          <TenantSwitcher />
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ padding: '1.5rem 1rem 1rem' }}>
          <div style={sectionHeaderStyle}>
            Sales & Revenue
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {salesRevenueItems.map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={linkStyle(isActive(item.href))}>
                  <item.icon size={20} strokeWidth={2} />
                  {!collapsed && <span>{item.label}</span>}
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
                <a href={item.href} style={linkStyle(isActive(item.href))}>
                  <item.icon size={20} strokeWidth={2} />
                  {!collapsed && <span>{item.label}</span>}
                </a>
              </li>
            ))}
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
                <a href="/admin/treasury" style={linkStyle(isActive('/admin/treasury'))}>
                  <Landmark size={20} strokeWidth={2} />
                  {!collapsed && <span>Treasury Admin</span>}
                </a>
              </li>
              <li style={{ marginBottom: '0.25rem' }}>
                <a href="/admin/support-admin" style={linkStyle(isActive('/admin/support-admin'))}>
                  <Shield size={20} strokeWidth={2} />
                  {!collapsed && <span>Support Admin</span>}
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Onboarding Checklist or Show Button */}
      {!collapsed && (
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
    </aside>
  );
}