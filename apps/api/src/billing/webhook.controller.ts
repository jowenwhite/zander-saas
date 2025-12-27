import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../prisma.service';
import { Public } from '../auth/jwt-auth.decorator';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  }

  @Public()
  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured - skipping signature verification');
      // In development without webhook secret, just parse the body
      const event = req.body as Stripe.Event;
      await this.handleEvent(event);
      return res.json({ received: true });
    }

    let event: Stripe.Event;

    try {
      // Use raw body for signature verification
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        this.logger.error('Raw body not available for webhook verification');
        return res.status(400).json({ error: 'Raw body not available' });
      }

      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    await this.handleEvent(event);
    return res.json({ received: true });
  }

  private async handleEvent(event: Stripe.Event) {
    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling ${event.type}: ${error.message}`);
      // Don't throw - we still want to return 200 to Stripe
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`Checkout completed: ${session.id}`);
    
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const tenantId = session.metadata?.tenantId;
    const cohort = session.metadata?.cohort || 'public';

    if (!tenantId) {
      this.logger.warn('No tenantId in checkout session metadata');
      return;
    }

    // Update tenant with subscription info
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: 'active',
        subscriptionCohort: cohort,
      },
    });

    this.logger.log(`Updated tenant ${tenantId} with subscription ${subscriptionId}`);
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription created: ${subscription.id}`);
    
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price.id;
    const tier = this.getTierFromPriceId(priceId);

    // Find tenant by Stripe customer ID
    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      this.logger.warn(`No tenant found for customer ${customerId}`);
      return;
    }

    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionTier: tier,
        trialEndsAt: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000) 
          : null,
      },
    });

    this.logger.log(`Tenant ${tenant.id} subscription created: ${tier}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    
    const priceId = subscription.items.data[0]?.price.id;
    const tier = this.getTierFromPriceId(priceId);
    const status = subscription.cancel_at_period_end ? 'canceling' : subscription.status;

    // Find tenant by subscription ID
    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!tenant) {
      // Try finding by customer ID
      const customerId = subscription.customer as string;
      const tenantByCustomer = await this.prisma.tenant.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!tenantByCustomer) {
        this.logger.warn(`No tenant found for subscription ${subscription.id}`);
        return;
      }

      await this.prisma.tenant.update({
        where: { id: tenantByCustomer.id },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: status,
          subscriptionTier: tier,
          trialEndsAt: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000) 
            : null,
        },
      });

      this.logger.log(`Tenant ${tenantByCustomer.id} subscription updated: ${status}, ${tier}`);
      return;
    }

    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: status,
        subscriptionTier: tier,
        trialEndsAt: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000) 
          : null,
      },
    });

    this.logger.log(`Tenant ${tenant.id} subscription updated: ${status}, ${tier}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    
    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!tenant) {
      this.logger.warn(`No tenant found for subscription ${subscription.id}`);
      return;
    }

    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionTier: 'free', // Downgrade to free tier
      },
    });

    this.logger.log(`Tenant ${tenant.id} subscription canceled - downgraded to free`);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice paid: ${invoice.id}`);
    
    const customerId = invoice.customer as string;

    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      this.logger.warn(`No tenant found for customer ${customerId}`);
      return;
    }

    // Ensure status is active after successful payment
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: 'active',
      },
    });

    this.logger.log(`Tenant ${tenant.id} payment successful - status: active`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.log(`Payment failed: ${invoice.id}`);
    
    const customerId = invoice.customer as string;

    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!tenant) {
      this.logger.warn(`No tenant found for customer ${customerId}`);
      return;
    }

    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: 'past_due',
      },
    });

    this.logger.log(`Tenant ${tenant.id} payment failed - status: past_due`);
    
    // TODO: Send payment failed notification email
    // await this.emailService.sendPaymentFailedEmail(tenant);
  }

  // ============================================
  // HELPERS
  // ============================================

  private getTierFromPriceId(priceId: string): string {
    // Map price lookup keys to tiers
    // This matches the lookup keys we created in Stripe
    if (!priceId) return 'free';
    
    // Fetch the price to get lookup key
    // For now, use a simple mapping based on price IDs
    // In production, you might want to cache this or use lookup keys directly
    
    // Default tier mapping based on common patterns
    if (priceId.includes('starter') || priceId.includes('beta')) return 'starter';
    if (priceId.includes('pro')) return 'professional';
    if (priceId.includes('business')) return 'business';
    if (priceId.includes('enterprise')) return 'enterprise';
    
    return 'starter'; // Default
  }
}
