'use client';
import { useState, useEffect, useRef } from 'react';
import { getToken, setActiveTenant, getActiveTenant } from '../utils/auth';

interface Tenant {
  id: string;
  companyName: string;
  subdomain: string;
  tenantType: string;
}

export default function TenantSwitcher() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenantState] = useState<Tenant | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch accessible tenants on mount
  useEffect(() => {
    async function fetchTenants() {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch('http://localhost:3001/tenants/accessible', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTenants(data);
          
          // Set active tenant from localStorage or first in list
          const storedTenant = getActiveTenant();
          if (storedTenant) {
            const found = data.find((t: Tenant) => t.id === storedTenant.id);
            setActiveTenantState(found || data[0]);
          } else if (data.length > 0) {
            setActiveTenantState(data[0]);
            setActiveTenant(data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTenants();
  }, []);

  const handleTenantSwitch = async (tenant: Tenant) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:3001/tenants/switch/${tenant.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Update localStorage with new token if provided
        if (data.token) {
          localStorage.setItem('zander_token', data.token);
        }
        setActiveTenant(tenant);
        setActiveTenantState(tenant);
        setIsOpen(false);
        // Reload to refresh all data for new tenant context
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to switch tenant:', error);
    }
  };

  // Don't render if only one tenant or still loading
  if (loading || tenants.length <= 1) {
    return null;
  }

  const getTenantIcon = (type: string) => {
    switch (type) {
      case 'flagship': return '⭐';
      case 'internal': return '🏢';
      default: return '🏪';
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'var(--zander-off-white)',
          border: '1px solid var(--zander-border-gray)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'var(--zander-navy)',
          transition: 'all 0.2s ease'
        }}
      >
        <span>{activeTenant ? getTenantIcon(activeTenant.tenantType) : '🏢'}</span>
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeTenant?.companyName || 'Select Tenant'}
        </span>
        <span style={{
          fontSize: '0.6rem',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '0.5rem',
          background: 'white',
          border: '2px solid var(--zander-border-gray)',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          minWidth: '220px',
          overflow: 'hidden',
          zIndex: 1002
        }}>
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--zander-border-gray)',
            background: 'var(--zander-off-white)',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--zander-gray)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Switch Organization
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleTenantSwitch(tenant)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: activeTenant?.id === tenant.id ? 'rgba(191, 10, 48, 0.08)' : 'transparent',
                  border: 'none',
                  borderLeft: activeTenant?.id === tenant.id ? '3px solid var(--zander-red)' : '3px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (activeTenant?.id !== tenant.id) {
                    e.currentTarget.style.background = 'var(--zander-off-white)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTenant?.id !== tenant.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{getTenantIcon(tenant.tenantType)}</span>
                <div>
                  <div style={{ 
                    fontWeight: activeTenant?.id === tenant.id ? '600' : '500', 
                    color: 'var(--zander-navy)',
                    fontSize: '0.9rem'
                  }}>
                    {tenant.companyName}
                  </div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--zander-gray)',
                    textTransform: 'capitalize'
                  }}>
                    {tenant.tenantType}
                  </div>
                </div>
                {activeTenant?.id === tenant.id && (
                  <span style={{ marginLeft: 'auto', color: 'var(--zander-red)' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
