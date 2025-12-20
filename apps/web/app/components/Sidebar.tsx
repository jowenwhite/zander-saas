'use client';

import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const salesRevenueItems = [
    { icon: '📊', label: 'Dashboard', href: '/' },
    { icon: '📈', label: 'Pipeline', href: '/pipeline' },
    { icon: '👥', label: 'Contacts', href: '/contacts' },
    { icon: '📉', label: 'Analytics', href: '/analytics' },
  ];

  const toolsItems = [
    { icon: '📧', label: 'Communications', href: '/communications' },
    { icon: '📋', label: 'Forms', href: '/forms' },
    { icon: '🤖', label: 'AI Assistant', href: '/ai' },
  ];

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
        <div style={{ 
          fontSize: '0.75rem', 
          fontWeight: '600', 
          color: 'var(--zander-gray)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '0.75rem',
          display: collapsed ? 'none' : 'block'
        }}>
          Sales & Revenue
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {salesRevenueItems.map((item) => (
            <li key={item.label} style={{ marginBottom: '0.25rem' }}>
              <a 
                href={item.href} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem', 
                  borderRadius: '8px', 
                  textDecoration: 'none', 
                  color: isActive(item.href) ? 'var(--zander-red)' : 'var(--zander-navy)', 
                  background: isActive(item.href) ? 'rgba(191,10,48,0.1)' : 'transparent', 
                  fontWeight: isActive(item.href) ? '600' : '400',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ padding: '0 1rem' }}>
        <div style={{ 
          fontSize: '0.75rem', 
          fontWeight: '600', 
          color: 'var(--zander-gray)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '0.75rem',
          display: collapsed ? 'none' : 'block'
        }}>
          Tools
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {toolsItems.map((item) => (
            <li key={item.label} style={{ marginBottom: '0.25rem' }}>
              <a 
                href={item.href} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem', 
                  borderRadius: '8px', 
                  textDecoration: 'none', 
                  color: isActive(item.href) ? 'var(--zander-red)' : 'var(--zander-navy)', 
                  background: isActive(item.href) ? 'rgba(191,10,48,0.1)' : 'transparent', 
                  fontWeight: isActive(item.href) ? '600' : '400',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
