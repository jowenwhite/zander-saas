'use client';

import { useState, useEffect, useRef } from 'react';
import { logout, getUser } from '../utils/auth';
import ThemeToggle from './ThemeToggle';
import TenantSwitcher from './TenantSwitcher';

interface NavBarProps {
  activeModule?: string;
}

export default function NavBar({ activeModule = 'cro' }: NavBarProps) {
  const [currentModule, setCurrentModule] = useState(activeModule);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = getUser();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Jonathan White';
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'JW';
  const userEmail = user?.email || 'jonathan@64west.com';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moduleColors: Record<string, string> = {
    cro: 'var(--zander-red)',
    cfo: '#2E7D32',
    coo: '#5E35B1',
    cmo: '#F57C00',
    cpo: '#0288D1',
    cio: '#455A64',
    ea: '#C2185B'
  };

  return (
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
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)', letterSpacing: '-0.5px' }}>ZANDER</span>
        </a>
        <TenantSwitcher />
      </div>

      {/* Module Switcher */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[
          { code: 'CRO', label: 'Sales', href: '/cro' },
          { code: 'CFO', label: 'Finance', href: '/cfo' },
          { code: 'COO', label: 'Operations', href: '/coo' },
          { code: 'CMO', label: 'Marketing', href: '/cmo' },
          { code: 'CPO', label: 'Team', href: '/cpo' },
          { code: 'CIO', label: 'Tech', href: '/cio' },
          { code: 'EA', label: 'Tasks', href: '/ea' }
        ].map((module) => (
          <a
            key={module.code}
            href={module.href}
            style={{
              padding: '0.4rem 0.75rem 0.25rem',
              borderRadius: '6px',
              textDecoration: 'none',
              background: currentModule === module.code.toLowerCase() ? moduleColors[module.code.toLowerCase()] : 'transparent',
              color: currentModule === module.code.toLowerCase() ? 'white' : 'var(--zander-gray)',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.1rem'
            }}
          >
            <span>{module.code}</span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '400',
              opacity: currentModule === module.code.toLowerCase() ? 0.9 : 0.7,
              letterSpacing: '0.3px'
            }}>{module.label}</span>
          </a>
        ))}
      </div>

      {/* Right Side - HQ, User Menu, Theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* HQ Button */}
        <a 
          href="/headquarters" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            background: 'var(--zander-navy)', 
            color: 'white', 
            borderRadius: '6px', 
            textDecoration: 'none', 
            fontWeight: '600', 
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
        >
          🏛️ HQ
        </a>

        {/* User Menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.35rem 0.5rem',
              borderRadius: '8px',
              transition: 'background 0.2s ease',
              background: showUserMenu ? 'var(--zander-off-white)' : 'transparent'
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
            }}>
              {userInitials}
            </div>
            <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{userName}</span>
            <span style={{ 
              fontSize: '0.6rem', 
              color: 'var(--zander-gray)',
              transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>▼</span>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              minWidth: '240px',
              overflow: 'hidden',
              zIndex: 1001
            }}>
              {/* User Info Header */}
              <div style={{ 
                padding: '1rem', 
                borderBottom: '1px solid var(--zander-border-gray)',
                background: 'var(--zander-off-white)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    {userInitials}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{userName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{userEmail}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '0.5rem 0' }}>
                <a 
                  href="/settings" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    color: 'var(--zander-navy)',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--zander-off-white)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </a>

                <a 
                  href="/settings?tab=profile" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    color: 'var(--zander-navy)',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--zander-off-white)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>👤</span>
                  <span>My Profile</span>
                </a>

                <a 
                  href="/settings?tab=billing" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    color: 'var(--zander-navy)',
                    textDecoration: 'none',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--zander-off-white)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>💳</span>
                  <span>Billing</span>
                </a>
              </div>

              {/* Logout */}
              <div style={{ borderTop: '1px solid var(--zander-border-gray)', padding: '0.5rem 0' }}>
                <button
                  onClick={logout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--zander-red)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(191, 10, 48, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </nav>
  );
}
