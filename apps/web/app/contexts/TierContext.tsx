'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getToken } from '../utils/auth';

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE' | 'CONSULTING';

export interface TierInfo {
  tenantId: string;
  effectiveTier: SubscriptionTier;
  tierSource: 'subscription' | 'override' | 'trial';
  baseTier: SubscriptionTier;
  trialTier: SubscriptionTier | null;
  trialEndDate: string | null;
  trialDaysRemaining: number | null;
  tierOverride: SubscriptionTier | null;
  tierOverrideNote: string | null;
  hasStripeSubscription: boolean;
}

interface TierContextValue {
  tier: TierInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasTier: (requiredTier: SubscriptionTier) => boolean;
}

// Standard subscription tier hierarchy
// CONSULTING is special - not in hierarchy, treated as FREE for feature access but has HQ access
const TIER_HIERARCHY: SubscriptionTier[] = ['FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'];

// Special tiers that don't follow standard hierarchy
const SPECIAL_TIERS: SubscriptionTier[] = ['CONSULTING'];

const TierContext = createContext<TierContextValue | undefined>(undefined);

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<TierInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTier = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
      const response = await fetch(`${apiUrl}/tenants/tier`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTier(data);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch tier');
      }
    } catch (err) {
      console.error('Error fetching tier:', err);
      setError('Failed to fetch subscription tier');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTier();
  }, [fetchTier]);

  // Check if tenant has at least the required tier
  // CONSULTING tier is special - treated as FREE for subscription features, but has HQ access
  const hasTier = useCallback((requiredTier: SubscriptionTier): boolean => {
    if (!tier) return false;

    // CONSULTING is a special tier - for standard feature gating, treat as FREE
    // This means CONSULTING users won't pass hasTier checks for paid features
    if (SPECIAL_TIERS.includes(tier.effectiveTier as SubscriptionTier)) {
      // CONSULTING only passes if checking for FREE
      return requiredTier === 'FREE';
    }

    const requiredLevel = TIER_HIERARCHY.indexOf(requiredTier);
    const currentLevel = TIER_HIERARCHY.indexOf(tier.effectiveTier);

    return currentLevel >= requiredLevel;
  }, [tier]);

  return (
    <TierContext.Provider value={{ tier, loading, error, refetch: fetchTier, hasTier }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const context = useContext(TierContext);
  if (!context) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}

// Utility function for use outside React components
export function getTierLevel(tier: SubscriptionTier): number {
  return TIER_HIERARCHY.indexOf(tier);
}
