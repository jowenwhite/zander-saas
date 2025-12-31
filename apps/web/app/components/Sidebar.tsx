'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
interface SidebarProps {
  collapsed?: boolean;
}
export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('zander_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsSuperAdmin(user.isSuperAdmin || false);
      } catch (e) {}
    }
  }, []);
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
      transition: 'width 0.3s ease'
    }}>
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
    </aside>
  );
}
