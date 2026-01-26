import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../integrations/email/email.service';
import { TicketStatus } from '@prisma/client';

interface TicketNotificationData {
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: string;
  category: string;
  resolution?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  tenant: {
    companyName: string;
  };
}

@Injectable()
export class TicketNotificationService {
  private readonly logger = new Logger(TicketNotificationService.name);
  private readonly appUrl = 'https://app.zanderos.com';

  constructor(private emailService: EmailService) {}

  /**
   * Send notification when a new ticket is created
   */
  async sendTicketCreatedNotification(ticket: TicketNotificationData): Promise<void> {
    const { user, ticketNumber, subject, description, priority, category } = ticket;

    const html = this.generateTicketCreatedEmail({
      firstName: user.firstName,
      ticketNumber,
      subject,
      description,
      priority: this.formatPriority(priority),
      category: this.formatCategory(category),
      ticketUrl: `${this.appUrl}/support/tickets/${ticketNumber}`,
    });

    try {
      const result = await this.emailService.sendEmail({
        to: user.email,
        subject: `[${ticketNumber}] Ticket Created: ${subject}`,
        html,
      });

      if (result.success) {
        this.logger.log(`Ticket created email sent for ${ticketNumber} to ${user.email}`);
      } else {
        this.logger.warn(`Failed to send ticket created email: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending ticket created email: ${error.message}`);
    }
  }

  /**
   * Send notification when a ticket is updated
   */
  async sendTicketUpdatedNotification(
    ticket: TicketNotificationData,
    previousStatus: TicketStatus
  ): Promise<void> {
    const { user, ticketNumber, subject, status } = ticket;

    // Skip if status hasn't changed (other field updates)
    if (status === previousStatus) {
      return;
    }

    // Use resolved email for resolved/closed status
    if (status === 'RESOLVED' || status === 'CLOSED') {
      return this.sendTicketResolvedNotification(ticket);
    }

    const html = this.generateTicketUpdatedEmail({
      firstName: user.firstName,
      ticketNumber,
      subject,
      previousStatus: this.formatStatus(previousStatus),
      newStatus: this.formatStatus(status),
      ticketUrl: `${this.appUrl}/support/tickets/${ticketNumber}`,
    });

    try {
      const result = await this.emailService.sendEmail({
        to: user.email,
        subject: `[${ticketNumber}] Ticket Updated: ${subject}`,
        html,
      });

      if (result.success) {
        this.logger.log(`Ticket updated email sent for ${ticketNumber} to ${user.email}`);
      } else {
        this.logger.warn(`Failed to send ticket updated email: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending ticket updated email: ${error.message}`);
    }
  }

  /**
   * Send notification when a ticket is resolved
   */
  async sendTicketResolvedNotification(ticket: TicketNotificationData): Promise<void> {
    const { user, ticketNumber, subject, resolution, status } = ticket;

    const html = this.generateTicketResolvedEmail({
      firstName: user.firstName,
      ticketNumber,
      subject,
      resolution: resolution || 'Your ticket has been resolved.',
      status: this.formatStatus(status),
      ticketUrl: `${this.appUrl}/support/tickets/${ticketNumber}`,
    });

    try {
      const result = await this.emailService.sendEmail({
        to: user.email,
        subject: `[${ticketNumber}] Ticket Resolved: ${subject}`,
        html,
      });

      if (result.success) {
        this.logger.log(`Ticket resolved email sent for ${ticketNumber} to ${user.email}`);
      } else {
        this.logger.warn(`Failed to send ticket resolved email: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending ticket resolved email: ${error.message}`);
    }
  }

  private formatPriority(priority: string): string {
    const priorityLabels: Record<string, string> = {
      P0: 'Critical',
      P1: 'High',
      P2: 'Medium',
      P3: 'Low',
      P4: 'Minimal',
    };
    return priorityLabels[priority] || priority;
  }

  private formatCategory(category: string): string {
    const categoryLabels: Record<string, string> = {
      BUG: 'Bug Report',
      FEATURE_REQUEST: 'Feature Request',
      QUESTION: 'Question',
      BILLING: 'Billing',
      ACCOUNT: 'Account',
      INTEGRATION: 'Integration',
      OTHER: 'Other',
    };
    return categoryLabels[category] || category;
  }

  private formatStatus(status: TicketStatus): string {
    const statusLabels: Record<string, string> = {
      NEW: 'New',
      AI_RESOLVED: 'AI Resolved',
      PENDING_REVIEW: 'Pending Review',
      IN_PROGRESS: 'In Progress',
      RESOLVED: 'Resolved',
      CLOSED: 'Closed',
    };
    return statusLabels[status] || status;
  }

  private generateTicketCreatedEmail(data: {
    firstName: string;
    ticketNumber: string;
    subject: string;
    description: string;
    priority: string;
    category: string;
    ticketUrl: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0C2340 0%, #1a3a5c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #F0B323; margin: 0; font-size: 24px;">⚡ Zander Support</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Your ticket has been created</p>
    </div>

    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hi ${data.firstName},</p>

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Thank you for reaching out. We've received your support ticket and our team will review it shortly.
      </p>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 120px;">Ticket #:</td>
            <td style="padding: 8px 0; color: #0C2340; font-size: 14px; font-weight: 600;">${data.ticketNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Subject:</td>
            <td style="padding: 8px 0; color: #0C2340; font-size: 14px; font-weight: 600;">${data.subject}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Priority:</td>
            <td style="padding: 8px 0; color: #0C2340; font-size: 14px;">${data.priority}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Category:</td>
            <td style="padding: 8px 0; color: #0C2340; font-size: 14px;">${data.category}</td>
          </tr>
        </table>
      </div>

      <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p style="color: #666; font-size: 12px; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 0.5px;">Description</p>
        <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.description.slice(0, 500)}${data.description.length > 500 ? '...' : ''}</p>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${data.ticketUrl}" style="display: inline-block; background: linear-gradient(135deg, #BF0A30 0%, #A00A28 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Ticket</a>
      </div>

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
        We'll notify you when there's an update to your ticket.
      </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p style="margin: 0;">Zander - Operating Simply</p>
      <p style="margin: 5px 0 0;">Powered by 64 West Holdings</p>
    </div>
  </div>
</body>
</html>`;
  }

  private generateTicketUpdatedEmail(data: {
    firstName: string;
    ticketNumber: string;
    subject: string;
    previousStatus: string;
    newStatus: string;
    ticketUrl: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0C2340 0%, #1a3a5c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #F0B323; margin: 0; font-size: 24px;">⚡ Zander Support</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Your ticket has been updated</p>
    </div>

    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hi ${data.firstName},</p>

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        There's been an update to your support ticket.
      </p>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 120px;">Ticket #:</td>
            <td style="padding: 8px 0; color: #0C2340; font-size: 14px; font-weight: 600;">${data.ticketNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Subject:</td>
            <td style="padding: 8px 0; color: #0C2340; font-size: 14px; font-weight: 600;">${data.subject}</td>
          </tr>
        </table>
      </div>

      <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin: 25px 0; text-align: center;">
        <div style="display: inline-block; background: #f1f3f5; padding: 10px 20px; border-radius: 6px;">
          <p style="color: #666; font-size: 11px; text-transform: uppercase; margin: 0 0 4px;">Previous Status</p>
          <p style="color: #333; font-size: 14px; font-weight: 600; margin: 0;">${data.previousStatus}</p>
        </div>
        <span style="color: #999; font-size: 20px;">→</span>
        <div style="display: inline-block; background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.05) 100%); padding: 10px 20px; border-radius: 6px; border: 1px solid rgba(39, 174, 96, 0.2);">
          <p style="color: #666; font-size: 11px; text-transform: uppercase; margin: 0 0 4px;">New Status</p>
          <p style="color: #27ae60; font-size: 14px; font-weight: 600; margin: 0;">${data.newStatus}</p>
        </div>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${data.ticketUrl}" style="display: inline-block; background: linear-gradient(135deg, #BF0A30 0%, #A00A28 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Ticket</a>
      </div>

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
        We'll continue to keep you updated on any changes.
      </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p style="margin: 0;">Zander - Operating Simply</p>
      <p style="margin: 5px 0 0;">Powered by 64 West Holdings</p>
    </div>
  </div>
</body>
</html>`;
  }

  private generateTicketResolvedEmail(data: {
    firstName: string;
    ticketNumber: string;
    subject: string;
    resolution: string;
    status: string;
    ticketUrl: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">✅ Ticket Resolved</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">${data.ticketNumber}</p>
    </div>

    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
      <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hi ${data.firstName},</p>

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Great news! Your support ticket has been resolved.
      </p>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px; width: 120px;">Ticket #:</td>
            <td style="padding: 8px 0; color: #0C2340; font-size: 14px; font-weight: 600;">${data.ticketNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Subject:</td>
            <td style="padding: 8px 0; color: #0C2340; font-size: 14px; font-weight: 600;">${data.subject}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Status:</td>
            <td style="padding: 8px 0;">
              <span style="display: inline-block; background: #27ae60; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">${data.status}</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.05) 100%); border: 1px solid rgba(39, 174, 96, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #27ae60; font-size: 12px; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 0.5px; font-weight: 600;">Resolution</p>
        <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.resolution}</p>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${data.ticketUrl}" style="display: inline-block; background: linear-gradient(135deg, #0C2340 0%, #1a3a5c 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Ticket Details</a>
      </div>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-top: 20px; text-align: center;">
        <p style="color: #666; font-size: 13px; margin: 0;">
          Need more help? Reply to this email or <a href="${data.ticketUrl}" style="color: #BF0A30; text-decoration: none; font-weight: 600;">open a new ticket</a>.
        </p>
      </div>
    </div>

    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p style="margin: 0;">Zander - Operating Simply</p>
      <p style="margin: 5px 0 0;">Powered by 64 West Holdings</p>
    </div>
  </div>
</body>
</html>`;
  }
}
