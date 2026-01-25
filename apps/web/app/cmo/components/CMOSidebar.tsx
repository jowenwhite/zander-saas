'use client';
import { usePathname } from 'next/navigation';

interface CMOSidebarProps {
  collapsed?: boolean;
}

export default function CMOSidebar({ collapsed = false }: CMOSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // CMO 5 Pillars Navigation
  // SHARED routes: /people, /projects, /products, /communication, /schedule, /forms
  // CMO-SPECIFIC routes: /cmo, /cmo/calendar, /cmo/workflows, /cmo/funnels, /cmo/templates, /cmo/brand, /cmo/ai, /cmo/personas, /cmo/analytics

  const marketingItems = [
    { icon: '📊', label: 'Dashboard', href: '/cmo' },
    { icon: '📁', label: 'Projects', href: '/projects' },
    { icon: '👥', label: 'People', href: '/people' },
    { icon: '📦', label: 'Products', href: '/products' },
  ];

  const processItems = [
    { icon: '📧', label: 'Communication', href: '/communication' },
    { icon: '📅', label: 'Schedule', href: '/schedule' },
    { icon: '🗓️', label: 'Marketing Calendar', href: '/cmo/calendar' },
    { icon: '📋', label: 'Forms', href: '/forms' },
    { icon: '🤖', label: 'Ask Don', href: '/cmo/ai' },
  ];

  const automationItems = [
    { icon: '⚡', label: 'Workflows', href: '/cmo/workflows' },
    { icon: '🎯', label: 'Funnels', href: '/cmo/funnels' },
  ];

  const insightsItems = [
    { icon: '📈', label: 'Analytics', href: '/cmo/analytics' },
    { icon: '🎭', label: 'Personas', href: '/cmo/personas' },
  ];

  const assetsItems = [
    { icon: '🎨', label: 'Brand Library', href: '/cmo/brand' },
    { icon: '📄', label: 'Templates', href: '/cmo/templates' },
  ];

  // CMO uses orange accent color
  const linkStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    color: active ? '#F57C00' : 'var(--zander-navy)',
    background: active ? 'rgba(245,124,0,0.1)' : 'transparent',
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
        {renderSection('Marketing', marketingItems)}
        {renderSection('Process', processItems)}
        {renderSection('Automation', automationItems)}
        {renderSection('Insights', insightsItems)}
        {renderSection('Assets', assetsItems)}
      </div>
    </aside>
  );
}
