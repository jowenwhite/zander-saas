import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../auth/jwt-auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { getTokenCapForTier, formatTokenCount } from '../common/config/tier-config';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly prisma: PrismaService,
  ) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================
  @Public()
  @Get('prices')
  async getPrices() {
    return this.billingService.getPrices();
  }

  @Public()
  @Post('waitlist')
  async createWaitlistDeposit(
    @Body() body: { email: string; name: string },
  ) {
    const baseUrl = process.env.FRONTEND_URL || 'https://zanderos.com';
    return this.billingService.createWaitlistDeposit(
      body.email,
      body.name,
      `${baseUrl}/waitlist/success`,
      `${baseUrl}/waitlist`,
    );
  }

  // ============================================
  // AUTHENTICATED ENDPOINTS
  // ============================================
  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async getSubscription(@Request() req: any) {
    return this.billingService.getSubscription(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(
    @Request() req: any,
    @Body() body: {
      priceId?: string;
      tier?: 'STARTER' | 'PRO' | 'BUSINESS';
      cohort?: 'beta' | 'founding' | 'public';
      successUrl?: string;
      cancelUrl?: string;
    },
  ) {
    const baseUrl = process.env.FRONTEND_URL || 'https://zanderos.com';

    // Resolve priceId from tier if not provided directly
    let priceId = body.priceId;
    if (!priceId && body.tier) {
      const tierPriceMap: Record<string, string | undefined> = {
        STARTER: process.env.STRIPE_PRICE_STARTER,
        PRO: process.env.STRIPE_PRICE_PRO,
        BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
      };
      priceId = tierPriceMap[body.tier];
      if (!priceId) {
        throw new Error(`Price ID not configured for tier: ${body.tier}`);
      }
    }

    if (!priceId) {
      throw new Error('Either priceId or tier must be provided');
    }

    return this.billingService.createCheckoutSession(
      req.user.tenantId,
      req.user.email,
      priceId,
      body.successUrl || `${baseUrl}/settings?tab=billing&success=true`,
      body.cancelUrl || `${baseUrl}/settings?tab=billing&canceled=true`,
      body.cohort || 'public',
      0, // No free trial - charge immediately, 30-day money-back guarantee
    );
  }

  // HIGH-4: Owner-only - subscription changes affect billing
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Post('upgrade')
  async upgradeSubscription(
    @Request() req: any,
    @Body() body: { priceId: string; trialDays?: number },
  ) {
    await this.billingService.changeSubscription(
      req.user.tenantId,
      body.priceId,
      body.trialDays ?? 0, // No free trial on upgrades - charge immediately
    );
    return { success: true, message: 'Subscription upgraded' };
  }

  // HIGH-4: Owner-only - subscription cancellation is critical
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  @Post('cancel')
  async cancelSubscription(
    @Request() req: any,
    @Body() body: { immediate?: boolean },
  ) {
    await this.billingService.cancelSubscription(
      req.user.tenantId,
      body.immediate || false,
    );
    return { success: true, message: 'Subscription cancelled' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reactivate')
  async reactivateSubscription(@Request() req: any) {
    await this.billingService.reactivateSubscription(req.user.tenantId);
    return { success: true, message: 'Subscription reactivated' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  async createPortalSession(
    @Request() req: any,
    @Body() body: { returnUrl?: string },
  ) {
    const baseUrl = process.env.FRONTEND_URL || 'https://zanderos.com';
    return this.billingService.createBillingPortalSession(
      req.user.tenantId,
      body.returnUrl || `${baseUrl}/settings?tab=billing`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('token-usage')
  async getTokenUsage(@Request() req: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
      select: {
        subscriptionTier: true,
        tierOverride: true,
        trialTier: true,
        trialStartDate: true,
        trialEndDate: true,
        monthlyTokensUsed: true,
        tokenResetDate: true,
      },
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Determine effective tier
    let effectiveTier = tenant.subscriptionTier || 'FREE';
    if (tenant.tierOverride) {
      effectiveTier = tenant.tierOverride;
    } else if (tenant.trialTier && tenant.trialStartDate && tenant.trialEndDate) {
      const now = new Date();
      const trialStart = new Date(tenant.trialStartDate);
      const trialEnd = new Date(tenant.trialEndDate);
      if (now >= trialStart && now <= trialEnd) {
        effectiveTier = tenant.trialTier;
      }
    }

    const monthlyTokenLimit = getTokenCapForTier(effectiveTier);
    const monthlyTokensUsed = tenant.monthlyTokensUsed || 0;

    // Check if reset is needed (lazy reset logic for display)
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const tokenResetDate = tenant.tokenResetDate ? new Date(tenant.tokenResetDate) : null;
    const needsReset = !tokenResetDate || tokenResetDate < firstOfMonth;

    // Calculate next reset date
    const nextReset = new Date(firstOfMonth);
    nextReset.setMonth(nextReset.getMonth() + 1);

    return {
      success: true,
      usage: {
        monthlyTokensUsed: needsReset ? 0 : monthlyTokensUsed,
        monthlyTokenLimit,
        effectiveTier: effectiveTier.toUpperCase(),
        percentageUsed: Math.min(
          100,
          Math.round(((needsReset ? 0 : monthlyTokensUsed) / monthlyTokenLimit) * 100),
        ),
        formatted: {
          used: formatTokenCount(needsReset ? 0 : monthlyTokensUsed),
          limit: formatTokenCount(monthlyTokenLimit),
        },
        resetsAt: nextReset.toISOString(),
      },
    };
  }
}
