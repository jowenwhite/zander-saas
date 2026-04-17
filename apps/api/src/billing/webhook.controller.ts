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
import { TIER_TOKEN_CAPS, formatTokenCount } from '../common/config/tier-config';

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

// Consulting package price IDs (from Stripe account acct_1SisqdCryiiyM4ce)
// Hours per PRD: Business Analysis=3, Compass=10, Foundation=20, Blueprint=40
// Extension is a 3-month time extension, not additional hours
const CONSULTING_PRICE_IDS: Record<string, { type: string; hours: number; price: number; isExtension?: boolean }> = {
  'price_1TN9RYCryiiyM4ceWM3YN0aA': { type: 'BUSINESS_ANALYSIS', hours: 3, price: 500 },
  'price_1TN9SaCryiiyM4ce1k2eQ4Ce': { type: 'COMPASS', hours: 10, price: 2500 },
  'price_1TN9TmCryiiyM4ceBBDLV187': { type: 'FOUNDATION', hours: 20, price: 4500 },
  'price_1TN9V7CryiiyM4ce7UvNa6Kd': { type: 'BLUEPRINT', hours: 40, price: 8000 },
  'price_1TN9WRCryiiyM4ceXLSFsTGv': { type: 'EXTENSION', hours: 0, price: 250, isExtension: true },
};

// Digital store product price IDs (from Stripe account acct_1SisqdCryiiyM4ce)
const DIGITAL_STORE_PRICE_IDS: Record<string, { type: string; name: string }> = {
  'price_1TN9EjCryiiyM4ce1JuVPzP7': { type: 'OPERATIONS_PLAYBOOK', name: 'Operations Playbook' },
  'price_1TN9KECryiiyM4ce4GUDL3G0': { type: 'STARTUP_FOUNDATIONS', name: 'Startup Foundations Kit' },
  'price_1TN9LdCryiiyM4cedyseEGCe': { type: 'SALES_MARKETING', name: 'Sales and Marketing Kit' },
  'price_1TN9NfCryiiyM4ceJhjP9acm': { type: 'HIRING_TEAM', name: 'Hiring and Team Building Kit' },
  'price_1TN9OeCryiiyM4ceegNAxeI5': { type: 'FINANCIAL_CLARITY', name: 'Financial Clarity Kit' },
  'price_1TN9PrCryiiyM4cetv9u1wIM': { type: 'INDUSTRY_STARTER', name: 'Industry Starter Packs' },
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
    this.logger.log(`Checkout completed: ${session.id}, mode: ${session.mode}`);

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const tenantId = session.metadata?.tenantId;
    const cohort = session.metadata?.cohort || 'public';
    const checkoutType = session.metadata?.type; // 'consulting', 'digital_product', or undefined (subscription)

    // Handle digital store purchases (no tenantId required)
    if (session.mode === 'payment' && checkoutType === 'digital_product') {
      await this.handleDigitalStorePurchase(session);
      return;
    }

    // Handle consulting package purchases
    if (session.mode === 'payment' && checkoutType === 'consulting') {
      if (!tenantId) {
        this.logger.warn('No tenantId for consulting purchase');
        return;
      }
      await this.handleConsultingPurchase(session, tenantId, customerId);
      return;
    }

    // Standard subscription checkout
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

    // For the greeting, prefer user's first name over company name
    // Trim to remove any whitespace issues
    const firstUser = tenant?.users?.[0];
    const customerName = (firstUser?.firstName?.trim() || tenant?.companyName?.trim() || 'Valued Customer');

    this.logger.log(`Email resolution: session.customer_email=${session.customer_email}, metadata.customerEmail=${session.metadata?.customerEmail}, user.email=${tenant?.users?.[0]?.email}, resolved=${customerEmail}`);

    // Send welcome email
    if (customerEmail) {
      await this.sendWelcomeEmail(customerEmail, customerName, tier);
    }

    // Send admin notification
    await this.sendAdminNotification(customerName, customerEmail || 'unknown', tier);
  }

  // ============================================
  // CONSULTING & DIGITAL STORE HANDLERS
  // ============================================

  private async handleConsultingPurchase(session: Stripe.Checkout.Session, tenantId: string, customerId: string) {
    this.logger.log(`Processing consulting purchase for tenant ${tenantId}`);

    // Get line items to determine the package
    const lineItems = await this.stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    if (!priceId) {
      this.logger.error('No price ID found in consulting checkout session');
      return;
    }

    // Look up package details from price ID
    const packageInfo = CONSULTING_PRICE_IDS[priceId];
    if (!packageInfo) {
      this.logger.warn(`Unknown consulting price ID: ${priceId}`);
      // Fall back to metadata if available
      const packageType = session.metadata?.packageType || 'UNKNOWN';
      const totalHours = parseInt(session.metadata?.hours || '0', 10);
      await this.createConsultingEngagement(tenantId, packageType, totalHours, session.id, customerId);
      return;
    }

    // Handle Extension package differently - adds 3 months, not hours
    if (packageInfo.isExtension) {
      await this.handlePackageExtension(tenantId, session.id, customerId);
      return;
    }

    await this.createConsultingEngagement(
      tenantId,
      packageInfo.type,
      packageInfo.hours,
      session.id,
      customerId,
    );
  }

  private async handlePackageExtension(tenantId: string, paymentId: string, customerId: string) {
    this.logger.log(`Processing 3-month package extension for tenant ${tenantId}`);

    try {
      // Get tenant with current consulting info
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { users: { take: 1, orderBy: { createdAt: 'asc' } } },
      });

      if (!tenant) {
        this.logger.error(`Tenant ${tenantId} not found for extension`);
        return;
      }

      // Calculate new expiration date (add 3 months to current expiration or from now)
      const currentExpiration = tenant.packageExpirationDate || new Date();
      const newExpiration = new Date(currentExpiration);
      newExpiration.setMonth(newExpiration.getMonth() + 3);

      // Update tenant with extended expiration
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          stripeCustomerId: customerId,
          packageExpirationDate: newExpiration,
        },
      });

      this.logger.log(`Extended tenant ${tenantId} package expiration to ${newExpiration.toISOString()}`);

      // Send confirmation email
      const customerEmail = tenant.users?.[0]?.email || tenant.email;
      const customerName = tenant.users?.[0]?.firstName || tenant.companyName || 'Valued Client';

      if (customerEmail) {
        await this.sendExtensionConfirmationEmail(customerEmail, customerName, newExpiration);
      }

      // Send admin notification
      await this.sendExtensionAdminNotification(customerName, customerEmail || 'unknown', newExpiration);

    } catch (error) {
      this.logger.error(`Failed to process package extension: ${error.message}`);
    }
  }

  private async sendExtensionConfirmationEmail(email: string, name: string, newExpiration: Date) {
    try {
      const expirationStr = newExpiration.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #0C2340; margin: 0 0 20px; font-size: 28px;">Package Extension Confirmed</h1>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your consulting package has been extended by 3 months. Your new expiration date is:
          </p>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="font-size: 24px; font-weight: 700; color: #0C2340; margin: 0;">${expirationStr}</p>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your remaining consulting hours carry over. Let's keep building!
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Best,<br>
            <strong>Jonathan White</strong><br>
            <span style="color: #666;">Founder, Zander</span>
          </p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: email,
        subject: 'Consulting Package Extended - New Expiration Date',
        html,
        from: 'Jonathan from Zander <jonathan@zanderos.com>',
        replyTo: 'jonathan@zanderos.com',
      });

      this.logger.log(`Extension confirmation email sent to ${email}`);
    } catch (err) {
      this.logger.error(`Failed to send extension confirmation email: ${err.message}`);
    }
  }

  private async sendExtensionAdminNotification(customerName: string, customerEmail: string, newExpiration: Date) {
    try {
      const expirationStr = newExpiration.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const html = `
        <div style="font-family: -apple-system, sans-serif; padding: 20px;">
          <h2 style="color: #0C2340;">📅 Package Extension Purchased</h2>
          <p><strong>Client:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>New Expiration:</strong> ${expirationStr}</p>
          <p><strong>Extension:</strong> +3 months</p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: 'jonathan@zanderos.com',
        subject: `Package Extension: ${customerName}`,
        html,
        from: 'Zander System <noreply@zanderos.com>',
      });

      this.logger.log(`Extension admin notification sent for ${customerEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send extension admin notification: ${err.message}`);
    }
  }

  private async createConsultingEngagement(
    tenantId: string,
    packageType: string,
    totalHours: number,
    paymentId: string,
    customerId: string,
  ) {
    try {
      // Get tenant info
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { users: { take: 1, orderBy: { createdAt: 'asc' } } },
      });

      if (!tenant) {
        this.logger.error(`Tenant ${tenantId} not found for consulting purchase`);
        return;
      }

      // Calculate expiration (6 months from now for consulting packages)
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 6);

      // Create consulting engagement
      const engagement = await this.prisma.consultingEngagement.create({
        data: {
          tenantId,
          packageType,
          startDate: new Date(),
          totalHours,
          hoursUsed: 0,
          billableHours: 0,
          status: 'ACTIVE',
          stripePaymentId: paymentId,
          notes: `Auto-created from Stripe checkout ${paymentId}`,
        },
      });

      this.logger.log(`Created consulting engagement ${engagement.id} for tenant ${tenantId}`);

      // Update tenant with consulting fields
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          stripeCustomerId: customerId,
          consultingStatus: 'ACTIVE',
          packageType,
          hoursRemaining: totalHours,
          hoursUsed: 0,
          packagePurchaseDate: new Date(),
          packageExpirationDate: expirationDate,
          // Set tier override to CONSULTING if not already on a paid subscription
          ...(tenant.subscriptionTier === 'FREE' && { tierOverride: 'CONSULTING' }),
        },
      });

      this.logger.log(`Updated tenant ${tenantId} consulting status to ACTIVE`);

      // Send confirmation email
      const customerEmail = tenant.users?.[0]?.email || tenant.email;
      const customerName = tenant.users?.[0]?.firstName || tenant.companyName || 'Valued Client';

      if (customerEmail) {
        await this.sendConsultingWelcomeEmail(customerEmail, customerName, packageType, totalHours);
      }

      // Send admin notification
      await this.sendConsultingAdminNotification(
        customerName,
        customerEmail || 'unknown',
        packageType,
        totalHours,
      );

    } catch (error) {
      this.logger.error(`Failed to create consulting engagement: ${error.message}`);
    }
  }

  private async handleDigitalStorePurchase(session: Stripe.Checkout.Session) {
    this.logger.log(`Processing digital store purchase: ${session.id}`);

    const customerEmail = session.customer_email || session.customer_details?.email;
    if (!customerEmail) {
      this.logger.warn('No customer email for digital store purchase');
      return;
    }

    // Get line items to determine the product
    const lineItems = await this.stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    const productName = lineItems.data[0]?.description || 'Digital Product';

    this.logger.log(`Digital product purchased: ${productName} by ${customerEmail}`);

    // Send download link email
    await this.sendDigitalProductEmail(customerEmail, productName, session.id);

    // Send admin notification
    await this.sendDigitalStoreAdminNotification(customerEmail, productName);
  }

  private async sendConsultingWelcomeEmail(email: string, name: string, packageType: string, hours: number) {
    try {
      const packageName = this.getConsultingPackageName(packageType);

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0C2340; margin: 0; font-size: 28px;">Welcome to Zander Consulting</h1>
            <p style="color: #666; margin: 10px 0 0;">Your ${packageName} engagement is confirmed</p>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for choosing Zander for your business consulting needs. Your <strong>${packageName}</strong> package is now active.
          </p>

          <div style="background: linear-gradient(135deg, #0C2340 0%, #1a3a5c 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h2 style="color: #fff; margin: 0 0 15px; font-size: 18px;">Your Package Details:</h2>
            <ul style="color: #fff; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Package: ${packageName}</li>
              ${hours > 0 ? `<li>Consulting Hours: ${hours} hours</li>` : ''}
              <li>Valid for: 6 months from purchase</li>
              <li>Access: Zander HQ Dashboard</li>
            </ul>
          </div>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #0C2340; margin: 0 0 10px; font-size: 16px;">Next Steps:</h3>
            <ol style="color: #333; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Jonathan will reach out within 24 hours to schedule your kickoff call</li>
              <li>Complete your intake survey in the HQ Dashboard</li>
              <li>Prepare any documents you'd like reviewed</li>
            </ol>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            I'm looking forward to working with you and helping your business thrive.
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Talk soon,<br>
            <strong>Jonathan White</strong><br>
            <span style="color: #666;">Founder, Zander</span>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            Zander - Operating Simply<br>
            Powered by Zander Systems LLC
          </p>
        </div>
      `;

      const result = await this.emailService.sendEmail({
        to: email,
        subject: `Welcome to Zander Consulting — ${packageName}`,
        html,
        from: 'Jonathan from Zander <jonathan@zanderos.com>',
        replyTo: 'jonathan@zanderos.com',
      });

      if (result.success) {
        this.logger.log(`Consulting welcome email sent to ${email}`);
      } else {
        this.logger.warn(`Consulting welcome email failed: ${result.error}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send consulting welcome email: ${err.message}`);
    }
  }

  private async sendConsultingAdminNotification(
    customerName: string,
    customerEmail: string,
    packageType: string,
    hours: number,
  ) {
    try {
      const packageName = this.getConsultingPackageName(packageType);
      const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/New_York',
      });

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0C2340; margin: 0 0 20px; font-size: 24px;">💼 New Consulting Client!</h1>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Client</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Email</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Package</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;"><strong>${packageName}</strong></td>
            </tr>
            ${hours > 0 ? `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Hours</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${hours} hours</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #666;">Timestamp</td>
              <td style="padding: 12px; color: #333;">${timestamp} ET</td>
            </tr>
          </table>

          <p style="color: #d97706; font-size: 14px; font-weight: bold;">
            ⚡ Action Required: Schedule kickoff call within 24 hours
          </p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: 'jonathan@zanderos.com',
        subject: `🎉 New Consulting Client: ${customerName} — ${packageName}`,
        html,
        from: 'Zander System <noreply@zanderos.com>',
      });

      this.logger.log(`Consulting admin notification sent for ${customerEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send consulting admin notification: ${err.message}`);
    }
  }

  private async sendDigitalProductEmail(email: string, productName: string, sessionId: string) {
    try {
      const downloadUrl = `https://app.zanderos.com/store/download?session_id=${sessionId}`;

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0C2340; margin: 0; font-size: 28px;">Thank You for Your Purchase!</h1>
            <p style="color: #666; margin: 10px 0 0;">Your download is ready</p>
          </div>

          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for purchasing <strong>${productName}</strong>. Your download is ready.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="display: inline-block; background: #00CFEB; color: #000; padding: 16px 32px; border-radius: 8px; font-weight: 700; font-size: 16px; text-decoration: none;">
              Download Now
            </a>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center;">
            This link will remain active for 30 days.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            Questions? Reply to this email.<br>
            Zander - Operating Simply
          </p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: email,
        subject: `Your Download: ${productName}`,
        html,
        from: 'Zander <noreply@zanderos.com>',
        replyTo: 'support@zanderos.com',
      });

      this.logger.log(`Digital product email sent to ${email}`);
    } catch (err) {
      this.logger.error(`Failed to send digital product email: ${err.message}`);
    }
  }

  private async sendDigitalStoreAdminNotification(customerEmail: string, productName: string) {
    try {
      const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/New_York',
      });

      const html = `
        <div style="font-family: -apple-system, sans-serif; padding: 20px;">
          <h2 style="color: #0C2340;">📦 Digital Store Purchase</h2>
          <p><strong>Product:</strong> ${productName}</p>
          <p><strong>Customer:</strong> ${customerEmail}</p>
          <p><strong>Time:</strong> ${timestamp} ET</p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: 'jonathan@zanderos.com',
        subject: `Store Purchase: ${productName}`,
        html,
        from: 'Zander System <noreply@zanderos.com>',
      });

      this.logger.log(`Digital store admin notification sent for ${customerEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send digital store admin notification: ${err.message}`);
    }
  }

  private getConsultingPackageName(packageType: string): string {
    const packageNames: Record<string, string> = {
      'BUSINESS_ANALYSIS': 'Comprehensive Business Analysis',
      'COMPASS': 'Compass Package',
      'FOUNDATION': 'Foundation Package',
      'BLUEPRINT': 'Blueprint Package',
      'EXTENSION': 'Package Extension',
    };
    return packageNames[packageType] || packageType;
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
            Powered by Zander Systems LLC
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
    // Get the actual token cap from config
    const tokenCap = TIER_TOKEN_CAPS[tier] ?? TIER_TOKEN_CAPS.STARTER;
    const formattedTokens = formatTokenCount(tokenCap);

    switch (tier) {
      case 'STARTER':
        return [
          'Pam - Executive Assistant (scheduling, email drafts, task management)',
          'Contact & Deal Management',
          'Email & Calendar Integration',
          `${formattedTokens} AI tokens/month`,
        ];
      case 'PRO':
        return [
          'Everything in Starter, plus:',
          'Jordan - AI Sales Director (pipeline coaching, follow-ups)',
          'Sales Analytics & Forecasting',
          `${formattedTokens} AI tokens/month`,
          'Priority Support',
        ];
      case 'BUSINESS':
        return [
          'Everything in Pro, plus:',
          'Don - AI CMO (marketing strategy, content planning)',
          'Full HQ Strategic Dashboard',
          'Team Collaboration Features',
          `${formattedTokens} AI tokens/month`,
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
