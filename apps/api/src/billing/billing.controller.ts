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
import { Public } from '../auth/jwt-auth.decorator';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

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
    const baseUrl = process.env.FRONTEND_URL || 'https://app.zanderos.com';
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
    @Body() body: { priceId: string; cohort?: 'beta' | 'founding' | 'public' },
  ) {
    const baseUrl = process.env.FRONTEND_URL || 'https://app.zanderos.com';
    return this.billingService.createCheckoutSession(
      req.user.tenantId,
      req.user.email,
      body.priceId,
      `${baseUrl}/settings/billing?success=true`,
      `${baseUrl}/settings/billing?canceled=true`,
      body.cohort || 'public',
      14,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  async upgradeSubscription(
    @Request() req: any,
    @Body() body: { priceId: string; trialDays?: number },
  ) {
    await this.billingService.changeSubscription(
      req.user.tenantId,
      body.priceId,
      body.trialDays ?? 30,
    );
    return { success: true, message: 'Subscription upgraded' };
  }

  @UseGuards(JwtAuthGuard)
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
    const baseUrl = process.env.FRONTEND_URL || 'https://app.zanderos.com';
    return this.billingService.createBillingPortalSession(
      req.user.tenantId,
      body.returnUrl || `${baseUrl}/settings/billing`,
    );
  }

  // ============================================
  // ADMIN MIGRATION ENDPOINT (temporary)
  // ============================================
  @Public()
  @Post('migrate-waitlist')
  async migrateWaitlist() {
    try {
      await this.billingService.createWaitlistTable();
      return { success: true, message: 'Waitlist table created' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
