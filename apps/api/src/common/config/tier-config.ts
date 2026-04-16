/**
 * Subscription Tier Configuration
 *
 * Centralized configuration for tier-based features and limits.
 * Token limits are derived from tier at runtime to stay in sync automatically.
 */

/**
 * Monthly token caps per subscription tier.
 * All AI chat interactions count against this limit.
 */
export const TIER_TOKEN_CAPS: Record<string, number> = {
  FREE: 10_000, // 10K tokens/month
  STARTER: 50_000, // 50K tokens/month
  PRO: 200_000, // 200K tokens/month
  BUSINESS: 500_000, // 500K tokens/month
  ENTERPRISE: 2_000_000, // 2M tokens/month
  CONSULTING: 0, // No AI executive access - HQ/documents/surveys only
};

/**
 * Standard tier hierarchy for comparison (higher index = more access)
 * CONSULTING is separate - it's a different product type (no AI, HQ-only)
 */
export const TIER_HIERARCHY = ['FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'];

/**
 * Special tiers that don't follow the standard hierarchy
 */
export const SPECIAL_TIERS = ['CONSULTING'];

/**
 * Human-readable tier names
 */
export const TIER_NAMES: Record<string, string> = {
  FREE: 'Free',
  STARTER: 'Starter',
  PRO: 'Pro',
  BUSINESS: 'Business',
  ENTERPRISE: 'Enterprise',
  CONSULTING: 'Consulting',
};

/**
 * Get the token cap for a given tier.
 * Returns FREE tier cap if tier is unknown.
 */
export function getTokenCapForTier(tier: string): number {
  const normalizedTier = tier?.toUpperCase() || 'FREE';
  return TIER_TOKEN_CAPS[normalizedTier] ?? TIER_TOKEN_CAPS.FREE;
}

/**
 * Format token count for display (e.g., 50000 -> "50K")
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(tokens % 1_000 === 0 ? 0 : 1)}K`;
  }
  return tokens.toString();
}
