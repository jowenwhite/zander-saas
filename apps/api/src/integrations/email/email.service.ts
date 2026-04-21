import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Resend webhook event types
export type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked';

export interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Additional fields for specific events
    click?: { link: string; timestamp: string };
    bounce?: { message: string };
  };
}

export interface SendEmailDto {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private defaultFrom: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured - emails will not be sent');
    }
    if (apiKey) { this.resend = new Resend(apiKey); }
    // Default from address - Zander platform emails
    this.defaultFrom = 'Zander <noreply@zanderos.com>';
  }

  async sendEmail(dto: SendEmailDto): Promise<EmailResult> {
    try {
      if (!process.env.RESEND_API_KEY) {
        this.logger.warn('Email not sent - RESEND_API_KEY not configured');
        return { success: false, error: 'Email service not configured' };
      }

      const { data, error } = await this.resend.emails.send({
        from: dto.from || this.defaultFrom,
        to: Array.isArray(dto.to) ? dto.to : [dto.to],
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
        replyTo: dto.replyTo,
        cc: dto.cc ? (Array.isArray(dto.cc) ? dto.cc : [dto.cc]) : undefined,
        bcc: dto.bcc ? (Array.isArray(dto.bcc) ? dto.bcc : [dto.bcc]) : undefined,
      });

      if (error) {
        this.logger.error(`Failed to send email: ${error.message}`);
        return { success: false, error: error.message };
      }

      this.logger.log(`Email sent successfully to ${dto.to}, messageId: ${data?.id}`);
      return { success: true, messageId: data?.id };
    } catch (err) {
      this.logger.error(`Email send error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async sendTemplateEmail(
    to: string,
    subject: string,
    templateContent: string,
    variables: Record<string, string> = {},
    options: Partial<SendEmailDto> = {}
  ): Promise<EmailResult> {
    // Replace template variables like {{firstName}}, {{companyName}}, etc.
    let html = templateContent;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      html = html.replace(regex, value || '');
    }

    return this.sendEmail({
      to,
      subject: this.replaceVariables(subject, variables),
      html,
      ...options,
    });
  }

  private replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(regex, value || '');
    }
    return result;
  }

  async sendTestEmail(to: string): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject: 'Zander Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0C2340;">🎉 Email Integration Working!</h1>
          <p>This is a test email from your Zander CRM system.</p>
          <p>If you're receiving this, your email integration is configured correctly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent from Zander - Operating Simply<br>
            Powered by Zander Systems LLC
          </p>
        </div>
      `,
    });
  }

  /**
   * Verify Resend webhook signature using svix headers
   * Resend uses Svix for webhook delivery
   */
  verifyWebhookSignature(
    payload: string,
    headers: {
      'svix-id': string;
      'svix-timestamp': string;
      'svix-signature': string;
    }
  ): boolean {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      this.logger.warn('RESEND_WEBHOOK_SECRET not configured - skipping signature verification');
      // In development, allow unverified webhooks
      return process.env.NODE_ENV !== 'production';
    }

    try {
      const signedContent = `${headers['svix-id']}.${headers['svix-timestamp']}.${payload}`;

      // Extract the secret (remove "whsec_" prefix if present)
      const secretBytes = Buffer.from(
        webhookSecret.startsWith('whsec_')
          ? webhookSecret.slice(6)
          : webhookSecret,
        'base64'
      );

      const expectedSignature = crypto
        .createHmac('sha256', secretBytes)
        .update(signedContent)
        .digest('base64');

      // svix-signature format: "v1,<signature>" (can have multiple)
      const signatures = headers['svix-signature'].split(' ');

      for (const sig of signatures) {
        const [version, signature] = sig.split(',');
        if (version === 'v1' && signature === expectedSignature) {
          return true;
        }
      }

      // Check timestamp to prevent replay attacks (5 minute tolerance)
      const timestamp = parseInt(headers['svix-timestamp']);
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - timestamp) > 300) {
        this.logger.warn('Webhook timestamp too old - possible replay attack');
        return false;
      }

      this.logger.warn('Webhook signature verification failed');
      return false;
    } catch (err) {
      this.logger.error(`Webhook signature verification error: ${err.message}`);
      return false;
    }
  }

  /**
   * Process Resend webhook events
   */
  async processWebhookEvent(event: ResendWebhookPayload): Promise<{ processed: boolean; message: string }> {
    const { type, data } = event;
    const emailId = data.email_id;

    this.logger.log(`Processing webhook event: ${type} for email: ${emailId}`);

    try {
      // Find the email message by Resend messageId
      const emailMessage = await prisma.emailMessage.findFirst({
        where: { messageId: emailId }
      });

      if (!emailMessage) {
        this.logger.log(`Email message not found for messageId: ${emailId} - may be from external sender`);
        return { processed: true, message: 'Email not tracked in system' };
      }

      switch (type) {
        case 'email.sent':
          await prisma.emailMessage.update({
            where: { id: emailMessage.id },
            data: { status: 'sent' }
          });
          break;

        case 'email.delivered':
          await prisma.emailMessage.update({
            where: { id: emailMessage.id },
            data: { status: 'delivered' }
          });
          break;

        case 'email.delivery_delayed':
          await prisma.emailMessage.update({
            where: { id: emailMessage.id },
            data: { status: 'delayed' }
          });
          break;

        case 'email.opened':
          await prisma.emailMessage.update({
            where: { id: emailMessage.id },
            data: {
              status: 'opened',
              openedAt: new Date()
            }
          });
          break;

        case 'email.clicked':
          // Track click event - status remains 'opened' but we log the click
          this.logger.log(`Email clicked: ${emailId}, link: ${data.click?.link}`);
          // Could add a separate EmailClick table for detailed tracking
          break;

        case 'email.bounced':
          await prisma.emailMessage.update({
            where: { id: emailMessage.id },
            data: { status: 'bounced' }
          });
          this.logger.warn(`Email bounced: ${emailId}, reason: ${data.bounce?.message}`);
          break;

        case 'email.complained':
          await prisma.emailMessage.update({
            where: { id: emailMessage.id },
            data: { status: 'complained' }
          });
          this.logger.warn(`Email complaint received for: ${emailId}`);
          // Consider adding contact to suppression list
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${type}`);
      }

      return { processed: true, message: `Event ${type} processed successfully` };
    } catch (err) {
      this.logger.error(`Error processing webhook event: ${err.message}`);
      return { processed: false, message: err.message };
    }
  }
}
