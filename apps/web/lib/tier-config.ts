/**
 * Subscription Tier Configuration
 *
 * Defines which executives are available at each tier level.
 * Also includes pricing and feature information for upgrade flows.
 */

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

export interface TierConfig {
  name: string;
  displayName: string;
  monthlyPrice: number | null; // null for Enterprise (custom pricing)
  stripePriceId: string | null;
  description: string;
  executiveIds: string[];
  features: string[];
}

// Executive IDs that map to each tier
export const EXECUTIVE_TIERS: Record<string, SubscriptionTier> = {
  // STARTER tier ($199/mo) - EA + CRO
  'pam': 'STARTER',
  'jordan': 'STARTER',

  // PRO tier ($349/mo) - adds CMO
  'don': 'PRO',

  // BUSINESS tier ($599/mo) - adds CFO
  'ben': 'BUSINESS',

  // ENTERPRISE tier - COO, CPO, CIO (coming soon)
  'miranda': 'ENTERPRISE',
  'ted': 'ENTERPRISE',
  'jarvis': 'ENTERPRISE',
};

// Full tier configurations
export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  FREE: {
    name: 'FREE',
    displayName: 'Free',
    monthlyPrice: 0,
    stripePriceId: null,
    description: 'Limited access to explore the platform',
    executiveIds: [],
    features: [
      'Platform access',
      'View-only dashboard',
    ],
  },
  STARTER: {
    name: 'STARTER',
    displayName: 'Starter',
    monthlyPrice: 199,
    stripePriceId: null, // Backend handles price lookup
    description: 'Your EA and HQ — fully operational from day one',
    executiveIds: ['pam', 'jordan'],
    features: [
      'Pam (AI Executive Assistant)',
      'Jordan (AI Chief Revenue Officer)',
      'Inbox management',
      'Calendar integration',
      'Contact management',
      'SMS sequences',
      'Pipeline tracking',
    ],
  },
  PRO: {
    name: 'PRO',
    displayName: 'Pro',
    monthlyPrice: 349,
    stripePriceId: null, // Backend handles price lookup
    description: 'Everything in Starter plus marketing power',
    executiveIds: ['pam', 'jordan', 'don'],
    features: [
      'Everything in Starter',
      'Don (AI Chief Marketing Officer)',
      'Marketing calendar',
      'Campaign execution',
      'Brand personas',
      'Content creation',
    ],
  },
  BUSINESS: {
    name: 'BUSINESS',
    displayName: 'Business',
    monthlyPrice: 599,
    stripePriceId: null, // Backend handles price lookup
    description: 'The complete C-suite for growing companies',
    executiveIds: ['pam', 'jordan', 'don', 'ben'],
    features: [
      'Everything in Pro',
      'Ben (AI Chief Financial Officer)',
      'Financial dashboards',
      'Budget tracking',
      'Expense management',
      'Cash flow forecasting',
    ],
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    displayName: 'Enterprise',
    monthlyPrice: null,
    stripePriceId: null, // Custom pricing
    description: 'Full executive team with custom integrations',
    executiveIds: ['pam', 'jordan', 'don', 'ben', 'miranda', 'ted', 'jarvis'],
    features: [
      'Everything in Business',
      'Miranda (AI Chief Operations Officer)',
      'Ted (AI Chief People Officer)',
      'Jarvis (AI Chief Information Officer)',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
    ],
  },
};

// Tier hierarchy for comparison
export const TIER_HIERARCHY: SubscriptionTier[] = ['FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'];

/**
 * Check if a tier has access to an executive
 */
export function hasExecutiveAccess(tier: SubscriptionTier, executiveId: string): boolean {
  const requiredTier = EXECUTIVE_TIERS[executiveId];
  if (!requiredTier) return false; // Unknown executive

  const currentLevel = TIER_HIERARCHY.indexOf(tier);
  const requiredLevel = TIER_HIERARCHY.indexOf(requiredTier);

  return currentLevel >= requiredLevel;
}

/**
 * Get the tier required to unlock an executive
 */
export function getRequiredTier(executiveId: string): SubscriptionTier | null {
  return EXECUTIVE_TIERS[executiveId] || null;
}

/**
 * Get the upgrade tier for a locked executive
 */
export function getUpgradeTier(executiveId: string, currentTier: SubscriptionTier): SubscriptionTier | null {
  const requiredTier = EXECUTIVE_TIERS[executiveId];
  if (!requiredTier) return null;

  const currentLevel = TIER_HIERARCHY.indexOf(currentTier);
  const requiredLevel = TIER_HIERARCHY.indexOf(requiredTier);

  if (currentLevel >= requiredLevel) return null; // Already has access

  return requiredTier;
}

/**
 * Get tier config for a specific tier
 */
export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return TIER_CONFIGS[tier] || TIER_CONFIGS.FREE;
}
