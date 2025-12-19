import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

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
    this.resend = new Resend(apiKey);
    // Default from address - update this to your verified domain
    this.defaultFrom = 'Zander <noreply@mcfapp.com>';
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
            Powered by 64 West Holdings
          </p>
        </div>
      `,
    });
  }
}
