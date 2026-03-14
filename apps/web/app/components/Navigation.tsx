'use client';

import { useState } from 'react';
import Image from 'next/image';
import { logout, getUser } from '../utils/auth';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  activePage: 'dashboard' | 'pipeline' | 'contacts' | 'analytics';
}

export default function Navigation({ activePage }: NavigationProps) {
  const [activeModule, setActiveModule] = useState('cro');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = getUser();

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';

  return (
    <>
      {/* Top Navigation */}
      <nav style={{
        background: '#13131A',
        borderBottom: '2px solid #2A2A38',
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
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/images/zander-logo.svg"
            alt="Zander"
            width={120}
            height={30}
            priority
          />
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
                  ? module === 'CRO' ? '#00CCEE' 
                  : module === 'CFO' ? '#27AE60'
                  : module === 'COO' ? '#3498DB'
                  : '#13131A'
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
              background: 'linear-gradient(135deg, #00CCEE 0%, #00A0CC 100%)',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>{userInitials}</div>
            <span style={{ fontWeight: '600', color: '#13131A' }}>{userName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>▼</span>
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: '#1C1C26',
              border: '2px solid #2A2A38',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '200px',
              overflow: 'hidden',
              zIndex: 1001
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #2A2A38' }}>
                <div style={{ fontWeight: '600', color: '#F0F0F5' }}>{userName}</div>
                <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>{user?.email || 'user@example.com'}</div>
              </div>
              <a href="#" style={{
                display: 'block',
                padding: '0.75rem 1rem',
                color: '#F0F0F5',
                textDecoration: 'none',
                transition: 'background 0.2s ease'
              }}>
                ⚙️ Settings
              </a>
              <a href="#" style={{
                display: 'block',
                padding: '0.75rem 1rem',
                color: '#F0F0F5',
                textDecoration: 'none',
                transition: 'background 0.2s ease'
              }}>
                👤 Profile
              </a>
              <div style={{ borderTop: '1px solid #2A2A38' }}>
                <button
                  onClick={logout}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: '#00CCEE',
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
        background: '#13131A',
        borderRight: '2px solid #2A2A38',
        padding: '1.5rem 0',
        overflow: 'hidden',
        zIndex: 900
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#8888A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
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
                  color: activePage === item.id ? '#00CCEE' : '#F0F0F5',
                  background: activePage === item.id ? 'rgba(0, 204, 238, 0.1)' : 'transparent',
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
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#8888A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Tools
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { icon: '📧', label: 'Communications' },
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
                  color: '#F0F0F5'
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
