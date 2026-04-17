/**
 * Subscription Tier Configuration
 *
 * Defines which executives are available at each tier level.
 * Also includes pricing and feature information for upgrade flows.
 */

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE' | 'CONSULTING';

export interface TierConfig {
  name: string;
  displayName: string;
  monthlyPrice: number | null; // null for Enterprise (custom pricing)
  stripePriceId: string | null;
  description: string;
  executiveIds: string[];
  features: string[];
}

// Executive IDs that map to each tier (null = coming soon, not tier-gated)
export const EXECUTIVE_TIERS: Record<string, SubscriptionTier | null> = {
  // STARTER tier ($199/mo) - EA only
  'pam': 'STARTER',

  // PRO tier ($349/mo) - adds CRO
  'jordan': 'PRO',

  // BUSINESS tier ($599/mo) - adds CMO
  'don': 'BUSINESS',

  // Coming Soon (Q4 2026) - NOT tier-gated, show "Coming Q4 2026" for ALL users
  'ben': null,
  'miranda': null,
  'ted': null,
  'jarvis': null,
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
    description: 'Your EA — fully operational from day one',
    executiveIds: ['pam'],
    features: [
      'Pam (AI Executive Assistant)',
      'Inbox management',
      'Calendar integration',
      'Contact management',
      'SMS sequences',
    ],
  },
  PRO: {
    name: 'PRO',
    displayName: 'Pro',
    monthlyPrice: 349,
    stripePriceId: null, // Backend handles price lookup
    description: 'Everything in Starter plus sales power',
    executiveIds: ['pam', 'jordan'],
    features: [
      'Everything in Starter',
      'Jordan (AI Chief Revenue Officer)',
      'Pipeline management',
      'Deal tracking',
      'Outreach sequences',
    ],
  },
  BUSINESS: {
    name: 'BUSINESS',
    displayName: 'Business',
    monthlyPrice: 599,
    stripePriceId: null, // Backend handles price lookup
    description: 'The complete C-suite for growing companies',
    executiveIds: ['pam', 'jordan', 'don'],
    features: [
      'Everything in Pro',
      'Don (AI Chief Marketing Officer)',
      'Marketing calendar',
      'Campaign execution',
      'Brand personas',
      'Content creation',
    ],
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    displayName: 'Enterprise',
    monthlyPrice: null,
    stripePriceId: null, // Custom pricing
    description: 'Full executive team with custom integrations',
    executiveIds: ['pam', 'jordan', 'don'],
    features: [
      'Everything in Business',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'Priority access to new executives',
    ],
  },
  CONSULTING: {
    name: 'CONSULTING',
    displayName: 'Consulting',
    monthlyPrice: null,
    stripePriceId: null, // Package pricing, not subscription
    description: 'Hands-on consulting with HQ access - no AI executives',
    executiveIds: [], // NO AI executive access
    features: [
      'HQ (Headquarters) access',
      'Business Analysis Scorecard',
      'Document library',
      'Survey & intake tools',
      'Direct consulting support',
    ],
  },
};

// Tier hierarchy for comparison (standard subscription tiers)
// CONSULTING is special - not in hierarchy, has no AI executive access
export const TIER_HIERARCHY: SubscriptionTier[] = ['FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'];

// Special tiers that don't follow standard hierarchy
export const SPECIAL_TIERS: SubscriptionTier[] = ['CONSULTING'];

/**
 * Check if a tier is a special tier (not in standard hierarchy)
 */
export function isSpecialTier(tier: SubscriptionTier): boolean {
  return SPECIAL_TIERS.includes(tier);
}

/**
 * Check if an executive is coming soon (null tier means coming soon)
 */
export function isComingSoon(executiveId: string): boolean {
  return EXECUTIVE_TIERS[executiveId] === null;
}

/**
 * Check if a tier has access to an executive
 * Returns false for coming soon executives (they're not accessible to anyone)
 * Returns false for CONSULTING tier (no AI executive access)
 */
export function hasExecutiveAccess(tier: SubscriptionTier, executiveId: string): boolean {
  // CONSULTING tier has NO AI executive access - HQ only
  if (tier === 'CONSULTING') return false;

  const requiredTier = EXECUTIVE_TIERS[executiveId];

  // null means coming soon - no one has access
  if (requiredTier === null) return false;

  // undefined means unknown executive
  if (requiredTier === undefined) return false;

  const currentLevel = TIER_HIERARCHY.indexOf(tier);
  const requiredLevel = TIER_HIERARCHY.indexOf(requiredTier);

  return currentLevel >= requiredLevel;
}

/**
 * Get the tier required to unlock an executive
 * Returns null for coming soon executives
 */
export function getRequiredTier(executiveId: string): SubscriptionTier | null {
  const tier = EXECUTIVE_TIERS[executiveId];
  // Both null (coming soon) and undefined (unknown) return null
  return tier || null;
}

/**
 * Get the upgrade tier for a locked executive
 * Returns null for coming soon executives (can't upgrade to unlock them)
 */
export function getUpgradeTier(executiveId: string, currentTier: SubscriptionTier): SubscriptionTier | null {
  const requiredTier = EXECUTIVE_TIERS[executiveId];

  // Coming soon or unknown - can't upgrade to get access
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
