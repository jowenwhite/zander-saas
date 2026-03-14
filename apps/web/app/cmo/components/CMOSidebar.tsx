'use client';
import { usePathname } from 'next/navigation';

interface CMOSidebarProps {
  collapsed?: boolean;
}

export default function CMOSidebar({ collapsed = false }: CMOSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // CMO 5 Pillars Navigation
  // All routes use /cmo prefix to stay within CMO context

  const marketingItems = [
    { icon: '📊', label: 'Dashboard', href: '/cmo' },
    { icon: '📝', label: 'Marketing Plan', href: '/cmo/plan' },
    { icon: '📁', label: 'Projects', href: '/cmo/projects' },
    { icon: '👥', label: 'People', href: '/cmo/people' },
    { icon: '📦', label: 'Products', href: '/cmo/products' },
  ];

  const processItems = [
    { icon: '📧', label: 'Communication', href: '/cmo/communication' },
    { icon: '📅', label: 'Schedule', href: '/cmo/schedule' },
    { icon: '🗓️', label: 'Marketing Calendar', href: '/cmo/calendar' },
    { icon: '📋', label: 'Forms', href: '/cmo/forms' },
    { icon: '🤖', label: 'Ask Don', href: '/cmo/ai' },
  ];

  const automationItems = [
    { icon: '⚡', label: 'Workflows', href: '/cmo/workflows' },
    { icon: '🎯', label: 'Funnels', href: '/cmo/funnels' },
  ];

  const insightsItems = [
    { icon: '📈', label: 'Analytics', href: '/cmo/analytics' },
    { icon: '🎭', label: 'Personas', href: '/cmo/personas' },
    { icon: '💰', label: 'Budget', href: '/cmo/budget' },
  ];

  const assetsItems = [
    { icon: '🎨', label: 'Brand Library', href: '/cmo/brand' },
    { icon: '📄', label: 'Templates', href: '/cmo/templates' },
  ];

  // CMO uses cyan accent color on dark theme
  const linkStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    color: active ? '#F0F0F5' : '#8888A0',
    background: active ? 'rgba(0, 204, 238, 0.1)' : 'transparent',
    borderLeft: active ? '2px solid #00CCEE' : '2px solid transparent',
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

  const renderSection = (title: string, items: { icon: string; label: string; href: string }[]) => (
    <div style={{ padding: title === 'Marketing' ? '1.5rem 1rem 1rem' : '0 1rem 1rem' }}>
      <div style={sectionHeaderStyle}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => (
          <li key={item.label} style={{ marginBottom: '0.25rem' }}>
            <a href={item.href} style={linkStyle(isActive(item.href))}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <aside style={{
      width: collapsed ? '64px' : '240px',
      background: '#13131A',
      borderRight: '2px solid #2A2A38',
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
        {renderSection('Marketing', marketingItems)}
        {renderSection('Process', processItems)}
        {renderSection('Automation', automationItems)}
        {renderSection('Insights', insightsItems)}
        {renderSection('Assets', assetsItems)}
      </div>
    </aside>
  );
}
