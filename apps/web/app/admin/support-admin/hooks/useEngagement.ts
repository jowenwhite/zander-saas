'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tenant } from './useTenants';

export interface SegmentedTenant extends Tenant {
  daysInactive: number;
  segmentReason: string;
}

export interface SegmentData {
  count: number;
  tenants: SegmentedTenant[];
}

export interface Segments {
  at_risk: SegmentData;
  power_users: SegmentData;
  churning: SegmentData;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'zander-support-2025';

export function useEngagement() {
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

      const data = await response.json();
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

  // Segment tenants based on engagement metrics
  const segments = useMemo<Segments>(() => {
    const now = new Date();

    const calculateDaysInactive = (lastActivity: string | null): number => {
      if (!lastActivity) return 999;
      const lastDate = new Date(lastActivity);
      return Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    // Active tenants only (not archived)
    const activeTenants = tenants.filter(t => t.status === 'ACTIVE');

    // At-Risk: churnRiskLevel is MEDIUM or HIGH, or inactive 14-30 days
    const atRiskTenants: SegmentedTenant[] = activeTenants
      .filter(t => {
        const daysInactive = calculateDaysInactive(t.lastActivityAt);
        const isRisky = t.churnRiskLevel === 'MEDIUM' || t.churnRiskLevel === 'HIGH';
        const isInactiveRange = daysInactive >= 14 && daysInactive < 30;
        return isRisky || isInactiveRange;
      })
      .map(t => {
        const daysInactive = calculateDaysInactive(t.lastActivityAt);
        let reason = '';
        if (t.churnRiskLevel === 'HIGH') {
          reason = 'High churn risk - declining engagement';
        } else if (t.churnRiskLevel === 'MEDIUM') {
          reason = 'Medium churn risk - monitor closely';
        } else {
          reason = `${daysInactive} days without activity`;
        }
        return { ...t, daysInactive, segmentReason: reason };
      })
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));

    // Power Users: High engagement (score > 50), low churn risk, active recently
    const powerUserTenants: SegmentedTenant[] = activeTenants
      .filter(t => {
        const daysInactive = calculateDaysInactive(t.lastActivityAt);
        const isHighEngagement = (t.engagementScore || 0) > 50;
        const isLowRisk = t.churnRiskLevel === 'LOW' || !t.churnRiskLevel;
        const isActive = daysInactive < 7;
        return isHighEngagement && isLowRisk && isActive;
      })
      .map(t => {
        const daysInactive = calculateDaysInactive(t.lastActivityAt);
        const score = t.engagementScore || 0;
        let reason = '';
        if (score > 80) {
          reason = 'Top tier engagement - expansion candidate';
        } else if (score > 60) {
          reason = 'Strong engagement - advocate potential';
        } else {
          reason = 'Good engagement - growth opportunity';
        }
        return { ...t, daysInactive, segmentReason: reason };
      })
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));

    // Churning: churnRiskLevel is CRITICAL, or inactive 30+ days
    const churningTenants: SegmentedTenant[] = activeTenants
      .filter(t => {
        const daysInactive = calculateDaysInactive(t.lastActivityAt);
        const isCritical = t.churnRiskLevel === 'CRITICAL';
        const isLongInactive = daysInactive >= 30;
        return isCritical || isLongInactive;
      })
      .map(t => {
        const daysInactive = calculateDaysInactive(t.lastActivityAt);
        let reason = '';
        if (t.churnRiskLevel === 'CRITICAL') {
          reason = 'Critical risk - immediate action needed';
        } else if (daysInactive >= 60) {
          reason = `${daysInactive} days inactive - likely churned`;
        } else {
          reason = `${daysInactive} days inactive - at risk of churning`;
        }
        return { ...t, daysInactive, segmentReason: reason };
      })
      .sort((a, b) => b.daysInactive - a.daysInactive);

    return {
      at_risk: { count: atRiskTenants.length, tenants: atRiskTenants },
      power_users: { count: powerUserTenants.length, tenants: powerUserTenants },
      churning: { count: churningTenants.length, tenants: churningTenants },
    };
  }, [tenants]);

  // Actions
  const extendTrial = async (tenantId: string, days: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/tenants/${tenantId}/trial/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify({ additionalDays: days }),
      });

      if (!response.ok) throw new Error('Failed to extend trial');
      await fetchTenants();
      return true;
    } catch (err) {
      console.error('Failed to extend trial:', err);
      return false;
    }
  };

  return {
    segments,
    loading,
    error,
    refetch: fetchTenants,
    extendTrial,
  };
}
