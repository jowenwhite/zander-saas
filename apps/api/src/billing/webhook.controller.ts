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
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/jwt-auth.decorator';
import { EmailService } from '../integrations/email/email.service';

// Stripe LIVE price IDs -> Tier mapping
const PRICE_TO_TIER: Record<string, string> = {
  'price_1THMKiCryiiyM4ceRYP44O8T': 'STARTER',  // Starter $199/mo
  'price_1THMKiCryiiyM4ceQjddUKNI': 'PRO',       // Pro $349/mo
  'price_1THMKjCryiiyM4ceaJIYMyfI': 'BUSINESS',  // Business $599/mo
};

// Tier to amount mapping for admin notifications
const TIER_AMOUNTS: Record<string, number> = {
  'STARTER': 199,
  'PRO': 349,
  'BUSINESS': 599,
};

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
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

    // Retrieve subscription to get price ID for tier mapping
    let tier = 'STARTER'; // Default
    if (subscriptionId) {
      try {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        tier = this.getTierFromPriceId(priceId);
        this.logger.log(`Resolved tier ${tier} from price ${priceId}`);
      } catch (err) {
        this.logger.warn(`Could not retrieve subscription ${subscriptionId}: ${err.message}`);
      }
    }

    // Get tenant info before update for email - include ALL users, not just owners
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: { take: 1, orderBy: { createdAt: 'asc' } } },
    });

    // Update tenant with subscription info and tier
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: 'active',
        subscriptionTier: tier,
        subscriptionCohort: cohort,
      },
    });

    this.logger.log(`Updated tenant ${tenantId} with subscription ${subscriptionId}, tier: ${tier}`);

    // Get customer email from multiple sources (in priority order)
    // 1. session.customer_email (set during checkout)
    // 2. session.metadata.customerEmail (backup in metadata)
    // 3. tenant.users[0].email (first user on tenant)
    const customerEmail = session.customer_email ||
                          session.metadata?.customerEmail ||
                          tenant?.users?.[0]?.email;
    const customerName = tenant?.companyName ||
                         tenant?.users?.[0]?.firstName ||
                         'Valued Customer';

    this.logger.log(`Email resolution: session.customer_email=${session.customer_email}, metadata.customerEmail=${session.metadata?.customerEmail}, user.email=${tenant?.users?.[0]?.email}, resolved=${customerEmail}`);

    // Send welcome email
    if (customerEmail) {
      await this.sendWelcomeEmail(customerEmail, customerName, tier);
    }

    // Send admin notification
    await this.sendAdminNotification(customerName, customerEmail || 'unknown', tier);
  }

  // ============================================
  // EMAIL HANDLERS
  // ============================================

  private async sendWelcomeEmail(email: string, name: string, tier: string) {
    try {
      const tierName = tier.charAt(0) + tier.slice(1).toLowerCase();
      const tierFeatures = this.getTierFeatures(tier);

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0C2340; margin: 0; font-size: 28px;">Welcome to Zander</h1>
            <p style="color: #666; margin: 10px 0 0;">Your AI executive team is ready</p>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for subscribing to Zander <strong>${tierName}</strong>. Your AI executive team is now activated and ready to help grow your business.
          </p>

          <div style="background: linear-gradient(135deg, #0C2340 0%, #1a3a5c 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h2 style="color: #fff; margin: 0 0 15px; font-size: 18px;">What's Included in ${tierName}:</h2>
            <ul style="color: #fff; margin: 0; padding-left: 20px; line-height: 1.8;">
              ${tierFeatures.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #0C2340; margin: 0 0 10px; font-size: 16px;">Next Steps:</h3>
            <ol style="color: #333; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Complete your company profile in Settings</li>
              <li>Import or add your contacts</li>
              <li>Start chatting with your AI executives</li>
            </ol>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Questions? Just reply to this email or reach out through the app. We're here to help you succeed.
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Welcome aboard,<br>
            <strong>Pam</strong><br>
            <span style="color: #666;">Your Executive Assistant at Zander</span>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            Zander - Operating Simply<br>
            Powered by 64 West Holdings
          </p>
        </div>
      `;

      const result = await this.emailService.sendEmail({
        to: email,
        subject: 'Welcome to Zander — Your team is ready',
        html,
        from: 'Pam from Zander <pam@zanderos.com>',
        replyTo: 'support@zanderos.com',
      });

      if (result.success) {
        this.logger.log(`Welcome email sent to ${email}, messageId: ${result.messageId}`);
      } else {
        this.logger.warn(`Welcome email failed for ${email}: ${result.error}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${email}: ${err.message}`);
    }
  }

  private async sendAdminNotification(customerName: string, customerEmail: string, tier: string) {
    try {
      const tierName = tier.charAt(0) + tier.slice(1).toLowerCase();
      const amount = TIER_AMOUNTS[tier] || 0;
      const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/New_York'
      });

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0C2340; margin: 0 0 20px; font-size: 24px;">🎉 New Subscriber!</h1>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Customer</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Email</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Tier</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;"><strong>${tierName}</strong></td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Amount</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">$${amount}/month</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #666;">Timestamp</td>
              <td style="padding: 12px; color: #333;">${timestamp} ET</td>
            </tr>
          </table>

          <p style="color: #666; font-size: 14px;">
            Log in to the admin panel to view the customer details.
          </p>
        </div>
      `;

      const result = await this.emailService.sendEmail({
        to: 'jonathan@zanderos.com',
        subject: `New Zander Subscriber: ${customerName} — ${tierName}`,
        html,
        from: 'Zander System <noreply@zanderos.com>',
      });

      if (result.success) {
        this.logger.log(`Admin notification sent for new subscriber: ${customerEmail}, messageId: ${result.messageId}`);
      } else {
        this.logger.warn(`Admin notification failed for ${customerEmail}: ${result.error}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send admin notification: ${err.message}`);
    }
  }

  private getTierFeatures(tier: string): string[] {
    switch (tier) {
      case 'STARTER':
        return [
          'Pam - Executive Assistant (scheduling, email drafts, task management)',
          'Contact & Deal Management',
          'Email & Calendar Integration',
          '10,000 AI tokens/month',
        ];
      case 'PRO':
        return [
          'Everything in Starter, plus:',
          'Jordan - AI Sales Director (pipeline coaching, follow-ups)',
          'Sales Analytics & Forecasting',
          '50,000 AI tokens/month',
          'Priority Support',
        ];
      case 'BUSINESS':
        return [
          'Everything in Pro, plus:',
          'Don - AI CMO (marketing strategy, content planning)',
          'Full HQ Strategic Dashboard',
          'Team Collaboration Features',
          '200,000 AI tokens/month',
          'Dedicated Success Manager',
        ];
      default:
        return ['Full access to your selected tier features'];
    }
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
        subscriptionTier: 'FREE', // Downgrade to free tier
        stripeSubscriptionId: null, // Clear the subscription ID
      },
    });

    this.logger.log(`Tenant ${tenant.id} subscription canceled - downgraded to FREE`);
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
    if (!priceId) return 'FREE';

    // Use the exact price ID mapping for Stripe LIVE prices
    const tier = PRICE_TO_TIER[priceId];
    if (tier) {
      return tier;
    }

    // Fallback: try string matching for test/legacy prices
    const lowerPrice = priceId.toLowerCase();
    if (lowerPrice.includes('business')) return 'BUSINESS';
    if (lowerPrice.includes('pro')) return 'PRO';
    if (lowerPrice.includes('starter') || lowerPrice.includes('beta')) return 'STARTER';
    if (lowerPrice.includes('enterprise')) return 'ENTERPRISE';

    this.logger.warn(`Unknown price ID: ${priceId}, defaulting to STARTER`);
    return 'STARTER';
  }
}
