import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  }

  // ============================================
  // CUSTOMER MANAGEMENT
  // ============================================

  async createOrGetStripeCustomer(tenantId: string, email: string, name?: string): Promise<string> {
    // Check if tenant already has a Stripe customer ID
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (tenant?.stripeCustomerId) {
      return tenant.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      email,
      name: name || tenant?.companyName,
      metadata: {
        tenantId,
      },
    });

    // Save Stripe customer ID to tenant
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customer.id },
    });

    this.logger.log(`Created Stripe customer ${customer.id} for tenant ${tenantId}`);
    return customer.id;
  }

  // ============================================
  // CHECKOUT SESSION (New Subscriptions)
  // ============================================

  async createCheckoutSession(
    tenantId: string,
    email: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    cohort: 'beta' | 'founding' | 'public' = 'public',
    trialDays: number = 14,
  ): Promise<{ url: string }> {
    const customerId = await this.createOrGetStripeCustomer(tenantId, email);

    // Determine if this price should have a trial
    const price = await this.stripe.prices.retrieve(priceId);
    const isRecurring = price.type === 'recurring';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        cohort,
      },
    };

    // Add trial period for recurring subscriptions (not deposits)
    if (isRecurring && trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
        metadata: {
          tenantId,
          cohort,
        },
      };
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);
    this.logger.log(`Created checkout session ${session.id} for tenant ${tenantId}`);

    return { url: session.url! };
  }

  // ============================================
  // WAITLIST DEPOSIT
  // ============================================

  async createWaitlistDeposit(
    email: string,
    name: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string; spotNumber: number }> {
    // Get current waitlist count
    const waitlistCount = await this.prisma.waitlistEntry.count();
    const spotNumber = waitlistCount + 1;

    // Get deposit price by lookup key
    const prices = await this.stripe.prices.list({
      lookup_keys: ['waitlist_deposit'],
      limit: 1,
    });

    if (!prices.data.length) {
      throw new Error('Waitlist deposit price not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?spot=${spotNumber}`,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        type: 'waitlist_deposit',
        spotNumber: spotNumber.toString(),
        customerName: name,
      },
    });

    this.logger.log(`Created waitlist deposit session for spot #${spotNumber}`);
    return { url: session.url!, spotNumber };
  }

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  async getSubscription(tenantId: string): Promise<any> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant?.stripeSubscriptionId) {
      return null;
    }

    const subscription = await this.stripe.subscriptions.retrieve(
      tenant.stripeSubscriptionId,
      { expand: ['default_payment_method', 'items.data.price.product'] }
    );

    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      items: subscription.items.data.map((item) => {
        const product = item.price.product as Stripe.Product;
        return {
          id: item.id,
          priceId: item.price.id,
          productId: typeof item.price.product === 'string' ? item.price.product : product.id,
          productName: typeof item.price.product === 'object' && 'name' in product ? product.name : null,
          amount: item.price.unit_amount,
          interval: item.price.recurring?.interval,
        };
      }),
    };
  }

  async cancelSubscription(tenantId: string, immediate: boolean = false): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    if (immediate) {
      await this.stripe.subscriptions.cancel(tenant.stripeSubscriptionId);
      this.logger.log(`Immediately cancelled subscription for tenant ${tenantId}`);
    } else {
      await this.stripe.subscriptions.update(tenant.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      this.logger.log(`Scheduled cancellation for tenant ${tenantId}`);
    }
  }

  async reactivateSubscription(tenantId: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant?.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    await this.stripe.subscriptions.update(tenant.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    this.logger.log(`Reactivated subscription for tenant ${tenantId}`);
  }

  // ============================================
  // UPGRADE/DOWNGRADE
  // ============================================

  async changeSubscription(
    tenantId: string,
    newPriceId: string,
    trialDays: number = 30,
  ): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    const subscription = await this.stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
    const currentItem = subscription.items.data[0];

    // Get current and new price amounts
    const currentPrice = await this.stripe.prices.retrieve(currentItem.price.id);
    const newPrice = await this.stripe.prices.retrieve(newPriceId);

    const isUpgrade = (newPrice.unit_amount || 0) > (currentPrice.unit_amount || 0);

    if (isUpgrade && trialDays > 0) {
      // Upgrade with trial period
      await this.stripe.subscriptions.update(tenant.stripeSubscriptionId, {
        items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        trial_end: Math.floor(Date.now() / 1000) + (trialDays * 24 * 60 * 60),
        proration_behavior: 'none',
      });
      this.logger.log(`Upgraded tenant ${tenantId} with ${trialDays}-day trial`);
    } else {
      // Downgrade or upgrade without trial
      await this.stripe.subscriptions.update(tenant.stripeSubscriptionId, {
        items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });
      this.logger.log(`Changed subscription for tenant ${tenantId}`);
    }
  }

  // ============================================
  // BILLING PORTAL
  // ============================================

  async createBillingPortalSession(
    tenantId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant?.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  // ============================================
  // PRICING INFO (Public)
  // ============================================

  async getPrices(): Promise<any[]> {
    const prices = await this.stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100,
    });

    return prices.data
      .filter((price) => {
        const product = price.product as Stripe.Product;
        return product.active && !product.metadata.type; // Exclude add-ons for main pricing
      })
      .map((price) => {
        const product = price.product as Stripe.Product;
        return {
          id: price.id,
          productId: product.id,
          productName: product.name,
          description: product.description,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
          intervalCount: price.recurring?.interval_count,
          metadata: {
            ...product.metadata,
            ...price.metadata,
          },
          lookupKey: price.lookup_key,
        };
      });
  }

  // ============================================
  // MIGRATION HELPER (temporary)
  // ============================================
  async createWaitlistTable(): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS waitlist_entries (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        "spotNumber" INTEGER UNIQUE NOT NULL,
        "stripePaymentId" TEXT,
        "depositAmount" INTEGER DEFAULT 4900,
        "depositPaidAt" TIMESTAMP(3),
        "depositRefundedAt" TIMESTAMP(3),
        "convertedAt" TIMESTAMP(3),
        "convertedTenantId" TEXT,
        status TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    this.logger.log('Waitlist table created successfully');
  }
}
