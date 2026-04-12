'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Tenant {
  id: string;
  name: string;
  subscriptionTier: string;
  tierOverride: string | null;
  tierOverrideNote: string | null;
  trialTier: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
  trialActive: boolean;
  effectiveTier: string;
  userCount: number;
  createdAt: string;
  archivedAt: string | null;
  lastActivityAt: string | null;
  engagementScore: number | null;
  churnRiskLevel: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface TenantsResponse {
  success: boolean;
  data: Tenant[];
  count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || '803cbd7661ec10912c7772ed12c094afbe6023ea07d1ab2c53791e8b1682501c';

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/admin/tenants`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tenants: ${response.status}`);
      }

      const data: TenantsResponse = await response.json();
      if (data.success) {
        setTenants(data.data);
      } else {
        throw new Error('Failed to fetch tenants');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const renameTenant = async (tenantId: string, newName: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/tenants/${tenantId}/rename`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify({ newName }),
      });

      if (!response.ok) throw new Error('Failed to rename tenant');
      await fetchTenants();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename tenant');
      return false;
    }
  };

  const setTierOverride = async (tenantId: string, tier: string, note?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/tenants/${tenantId}/tier-override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify({ tier, note }),
      });

      if (!response.ok) throw new Error('Failed to set tier override');
      await fetchTenants();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set tier override');
      return false;
    }
  };

  const removeTierOverride = async (tenantId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/tenants/${tenantId}/tier-override`, {
        method: 'DELETE',
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) throw new Error('Failed to remove tier override');
      await fetchTenants();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove tier override');
      return false;
    }
  };

  const startTrial = async (tenantId: string, tier: string, durationDays: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/tenants/${tenantId}/trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify({ tier, durationDays }),
      });

      if (!response.ok) throw new Error('Failed to start trial');
      await fetchTenants();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start trial');
      return false;
    }
  };

  const extendTrial = async (tenantId: string, additionalDays: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/tenants/${tenantId}/trial/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify({ additionalDays }),
      });

      if (!response.ok) throw new Error('Failed to extend trial');
      await fetchTenants();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend trial');
      return false;
    }
  };

  const cancelTrial = async (tenantId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/tenants/${tenantId}/trial`, {
        method: 'DELETE',
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) throw new Error('Failed to cancel trial');
      await fetchTenants();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel trial');
      return false;
    }
  };

  const archiveTenant = async (tenantId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/tenants/${tenantId}/archive`, {
        method: 'POST',
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) throw new Error('Failed to archive tenant');
      await fetchTenants();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive tenant');
      return false;
    }
  };

  const restoreTenant = async (tenantId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/tenants/${tenantId}/restore`, {
        method: 'POST',
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) throw new Error('Failed to restore tenant');
      await fetchTenants();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore tenant');
      return false;
    }
  };

  // Batch operations
  const bulkSetTierOverride = async (tenantIds: string[], tier: string, note?: string): Promise<boolean> => {
    try {
      await Promise.all(tenantIds.map(id => setTierOverride(id, tier, note)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed bulk tier override');
      return false;
    }
  };

  const bulkExtendTrial = async (tenantIds: string[], additionalDays: number): Promise<boolean> => {
    try {
      await Promise.all(tenantIds.map(id => extendTrial(id, additionalDays)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed bulk trial extend');
      return false;
    }
  };

  const bulkArchive = async (tenantIds: string[]): Promise<boolean> => {
    try {
      await Promise.all(tenantIds.map(id => archiveTenant(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed bulk archive');
      return false;
    }
  };

  return {
    tenants,
    loading,
    error,
    refresh: fetchTenants,
    renameTenant,
    setTierOverride,
    removeTierOverride,
    startTrial,
    extendTrial,
    cancelTrial,
    archiveTenant,
    restoreTenant,
    bulkSetTierOverride,
    bulkExtendTrial,
    bulkArchive,
  };
}
