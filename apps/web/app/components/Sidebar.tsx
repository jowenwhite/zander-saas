'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import OnboardingChecklist from './OnboardingChecklist';

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
    { icon: '📊', label: 'Production', href: '/production' },
    { icon: '📁', label: 'Projects', href: '/projects' },
    { icon: '👥', label: 'People', href: '/people' },
    { icon: '📦', label: 'Products', href: '/products' },
  ];

  const processItems = [
    { icon: '📧', label: 'Communication', href: '/communication' },
    { icon: '📅', label: 'Schedule', href: '/schedule' },
    { icon: '📋', label: 'Forms', href: '/forms' },
    { icon: '🤖', label: 'Ask Jordan (CRO)', href: '/ai' },
  ];

  const linkStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    color: active ? 'var(--zander-red)' : 'var(--zander-navy)',
    background: active ? 'rgba(191,10,48,0.1)' : 'transparent',
    fontWeight: active ? '600' : '400',
    transition: 'all 0.2s ease'
  });

  const sectionHeaderStyle = {
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    color: 'var(--zander-gray)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '0.75rem',
    display: collapsed ? 'none' : 'block'
  };

  return (
    <aside style={{
      width: collapsed ? '64px' : '240px',
      background: 'white',
      borderRight: '2px solid var(--zander-border-gray)',
      height: 'calc(100vh - 64px)',
      position: 'fixed',
      top: '64px',
      left: 0,
      overflowY: 'auto',
      zIndex: 900,
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ padding: '1.5rem 1rem 1rem' }}>
          <div style={sectionHeaderStyle}>
            Sales & Revenue
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {salesRevenueItems.map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={linkStyle(isActive(item.href))}>
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
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
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Admin Section - SuperAdmin Only */}
        {isSuperAdmin && (
          <div style={{ padding: '1rem', borderTop: '2px solid var(--zander-border-gray)', marginTop: '1rem' }}>
            <div style={sectionHeaderStyle}>
              Admin
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li style={{ marginBottom: '0.25rem' }}>
                <a href="/admin/treasury" style={linkStyle(isActive('/admin/treasury'))}>
                  <span style={{ fontSize: '1.1rem' }}>🏛️</span>
                  {!collapsed && <span>Treasury Admin</span>}
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Onboarding Checklist or Show Button */}
      {!collapsed && (
        <div style={{ borderTop: '2px solid var(--zander-border-gray)' }}>
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
                color: 'var(--zander-gray)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(191,10,48,0.05)';
                e.currentTarget.style.color = 'var(--zander-red)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--zander-gray)';
              }}
            >
              <span>📋</span>
              <span>Show Getting Started</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}