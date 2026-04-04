'use client';
import { usePathname } from 'next/navigation';
import TenantSwitcher from '../../components/TenantSwitcher';
import { LayoutDashboard, FileText, FolderKanban, Users, Package, Mail, Calendar, CalendarDays, ClipboardList, Bot, Zap, Target, BarChart3, UserCircle, DollarSign, Palette, FileCode, LucideIcon } from 'lucide-react';

interface CMOSidebarProps {
  collapsed?: boolean;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export default function CMOSidebar({ collapsed = false }: CMOSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // CMO 5 Pillars Navigation
  // All routes use /cmo prefix to stay within CMO context

  const marketingItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/cmo' },
    { icon: FileText, label: 'Marketing Plan', href: '/cmo/plan' },
    { icon: FolderKanban, label: 'Projects', href: '/cmo/projects' },
    { icon: Users, label: 'People', href: '/cmo/people' },
    { icon: Package, label: 'Products', href: '/cmo/products' },
  ];

  const processItems: NavItem[] = [
    { icon: Mail, label: 'Communication', href: '/cmo/communication' },
    { icon: Calendar, label: 'Schedule', href: '/cmo/schedule' },
    { icon: CalendarDays, label: 'Marketing Calendar', href: '/cmo/calendar' },
    { icon: ClipboardList, label: 'Forms', href: '/cmo/forms' },
    { icon: Bot, label: 'Ask Don', href: '/cmo/ai' },
  ];

  const automationItems: NavItem[] = [
    { icon: Zap, label: 'Workflows', href: '/cmo/workflows' },
    { icon: Target, label: 'Funnels', href: '/cmo/funnels' },
  ];

  const insightsItems: NavItem[] = [
    { icon: BarChart3, label: 'Analytics', href: '/cmo/analytics' },
    { icon: UserCircle, label: 'Personas', href: '/cmo/personas' },
    { icon: DollarSign, label: 'Budget', href: '/cmo/budget' },
  ];

  const assetsItems: NavItem[] = [
    { icon: Palette, label: 'Brand Library', href: '/cmo/brand' },
    { icon: FileCode, label: 'Templates', href: '/cmo/templates' },
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

  const renderSection = (title: string, items: NavItem[]) => (
    <div style={{ padding: title === 'Marketing' ? '1.5rem 1rem 1rem' : '0 1rem 1rem' }}>
      <div style={sectionHeaderStyle}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.label} style={{ marginBottom: '0.25rem' }}>
              <a href={item.href} style={linkStyle(active)}>
                <item.icon size={20} strokeWidth={2} color={active ? '#F0F0F5' : '#8888A0'} />
                {!collapsed && <span>{item.label}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );

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
          padding: '28px 12px 20px 12px',
          borderBottom: '1px solid #2A2A38',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          <div style={{
            marginBottom: '12px'
          }}>
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
        </div>
      )}

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
