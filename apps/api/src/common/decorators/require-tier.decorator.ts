import { SetMetadata } from '@nestjs/common';

export const TIER_KEY = 'requiredTier';

/**
 * Subscription Tier Decorator
 *
 * Use with TierGuard to restrict endpoint access based on subscription tier.
 * Tier hierarchy (lowest to highest): FREE < STARTER < PRO < BUSINESS < ENTERPRISE
 *
 * @example
 * // Require PRO tier or higher
 * @UseGuards(JwtAuthGuard, TierGuard)
 * @RequireTier('PRO')
 * @Controller('cro')
 * export class CroController { ... }
 *
 * Valid tiers: 'FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'
 */
export const RequireTier = (tier: string) => SetMetadata(TIER_KEY, tier);
