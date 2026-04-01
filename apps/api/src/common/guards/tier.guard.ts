import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { TIER_KEY } from '../decorators/require-tier.decorator';

/**
 * Subscription Tier Guard
 *
 * Validates that the tenant has the required subscription tier.
 * Must be used after JwtAuthGuard which populates req.tenantId.
 *
 * Tier hierarchy (lowest to highest):
 * - FREE: Default tier, limited features
 * - STARTER: Basic paid tier ($199/mo)
 * - PRO: Professional tier ($349/mo)
 * - BUSINESS: Business tier ($599/mo)
 * - ENTERPRISE: Custom enterprise deals
 *
 * @example
 * @UseGuards(JwtAuthGuard, TierGuard)
 * @RequireTier('PRO')
 * @Controller('cro')
 * export class CroController { ... }
 */
@Injectable()
export class TierGuard implements CanActivate {
  // Tier hierarchy: index = privilege level (higher = more access)
  private static readonly TIER_HIERARCHY: string[] = [
    'FREE',
    'STARTER',
    'PRO',
    'BUSINESS',
    'ENTERPRISE',
  ];

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required tier from decorator metadata
    const requiredTier = this.reflector.getAllAndOverride<string>(TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no tier specified, allow access
    if (!requiredTier) {
      return true;
    }

    // Get tenantId from request (populated by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant not identified');
    }

    // Look up tenant's subscription tier and override fields from database
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionTier: true,
        tierOverride: true,
        trialTier: true,
        trialStartDate: true,
        trialEndDate: true,
      },
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    // Determine effective tier: tierOverride > active trial > subscriptionTier > FREE
    let currentTier = tenant.subscriptionTier || 'FREE';

    // Check for tier override (admin-granted access)
    if (tenant.tierOverride) {
      currentTier = tenant.tierOverride;
    }
    // Check for active trial
    else if (tenant.trialTier && tenant.trialStartDate && tenant.trialEndDate) {
      const now = new Date();
      const trialStart = new Date(tenant.trialStartDate);
      const trialEnd = new Date(tenant.trialEndDate);

      if (now >= trialStart && now <= trialEnd) {
        currentTier = tenant.trialTier;
      }
    }

    // Get tier levels
    const requiredLevel = TierGuard.TIER_HIERARCHY.indexOf(
      requiredTier.toUpperCase(),
    );
    const currentLevel = TierGuard.TIER_HIERARCHY.indexOf(
      currentTier.toUpperCase(),
    );

    // Handle unknown tiers
    if (requiredLevel === -1) {
      console.warn(`Unknown required tier: ${requiredTier}`);
      return true; // Allow if tier is unknown (fail open for config errors)
    }

    if (currentLevel === -1) {
      // Unknown current tier - treat as FREE
      console.warn(`Unknown tenant tier: ${currentTier}, treating as FREE`);
    }

    // Check if tenant tier >= required tier
    const effectiveCurrentLevel = currentLevel === -1 ? 0 : currentLevel;

    if (effectiveCurrentLevel >= requiredLevel) {
      return true;
    }

    // Tier insufficient - throw ForbiddenException with upgrade info
    const tierNames: Record<string, string> = {
      FREE: 'Free',
      STARTER: 'Starter',
      PRO: 'Pro',
      BUSINESS: 'Business',
      ENTERPRISE: 'Enterprise',
    };

    throw new ForbiddenException({
      statusCode: 403,
      locked: true,
      requiredTier: requiredTier.toUpperCase(),
      currentTier: currentTier.toUpperCase(),
      message: `This feature requires a ${tierNames[requiredTier.toUpperCase()] || requiredTier} subscription`,
    });
  }
}
