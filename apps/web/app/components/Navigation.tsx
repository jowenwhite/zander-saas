'use client';

import { useState } from 'react';
import { logout, getUser } from '../utils/auth';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  activePage: 'dashboard' | 'pipeline' | 'contacts' | 'analytics';
}

export default function Navigation({ activePage }: NavigationProps) {
  const [activeModule, setActiveModule] = useState('cro');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = getUser();

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Jonathan White';
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'JW';

  return (
    <>
      {/* Top Navigation */}
      <nav style={{
        background: 'white',
        borderBottom: '2px solid var(--zander-border-gray)',
        padding: '0 1.5rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)', letterSpacing: '-0.5px' }}>ZANDER</span>
        </a>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['CRO', 'CFO', 'COO', 'CMO', 'CPO', 'CIO', 'EA'].map((module) => (
            <button
              key={module}
              onClick={() => setActiveModule(module.toLowerCase())}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: activeModule === module.toLowerCase() 
                  ? module === 'CRO' ? 'var(--zander-red)' 
                  : module === 'CFO' ? '#27AE60'
                  : module === 'COO' ? '#3498DB'
                  : 'var(--zander-navy)'
                  : 'transparent',
                color: activeModule === module.toLowerCase() ? 'white' : 'var(--zander-gray)',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              {module}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'background 0.2s ease'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>{userInitials}</div>
            <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{userName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>▼</span>
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '200px',
              overflow: 'hidden',
              zIndex: 1001
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--zander-border-gray)' }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{userName}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>{user?.email || 'user@example.com'}</div>
              </div>
              <a href="#" style={{
                display: 'block',
                padding: '0.75rem 1rem',
                color: 'var(--zander-navy)',
                textDecoration: 'none',
                transition: 'background 0.2s ease'
              }}>
                ⚙️ Settings
              </a>
              <a href="#" style={{
                display: 'block',
                padding: '0.75rem 1rem',
                color: 'var(--zander-navy)',
                textDecoration: 'none',
                transition: 'background 0.2s ease'
              }}>
                👤 Profile
              </a>
              <div style={{ borderTop: '1px solid var(--zander-border-gray)' }}>
                <button
                  onClick={logout}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--zander-red)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}

          <ThemeToggle />
        </div>
      </nav>

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: '64px',
        bottom: 0,
        width: '240px',
        background: 'white',
        borderRight: '2px solid var(--zander-border-gray)',
        padding: '1.5rem 0',
        overflow: 'hidden',
        zIndex: 900
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--zander-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Sales & Revenue
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { icon: '📊', label: 'Dashboard', href: '/', id: 'dashboard' },
              { icon: '📈', label: 'Pipeline', href: '/pipeline', id: 'pipeline' },
              { icon: '👥', label: 'Contacts', href: '/contacts', id: 'contacts' },
              { icon: '📉', label: 'Analytics', href: '/analytics', id: 'analytics' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: activePage === item.id ? 'var(--zander-red)' : 'var(--zander-navy)',
                  background: activePage === item.id ? 'rgba(191, 10, 48, 0.1)' : 'transparent',
                  fontWeight: activePage === item.id ? '600' : '400'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ padding: '0 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--zander-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Tools
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { icon: '📧', label: 'Email Automation' },
              { icon: '📄', label: 'Proposals' },
              { icon: '🤖', label: 'AI Assistant' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href="#" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--zander-navy)'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
