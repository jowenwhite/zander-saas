import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../integrations/email/email.service';
import { TicketStatus } from '@prisma/client';
import {
  wrapInBaseLayout,
  createSectionHeader,
  EMAIL_COLORS,
} from '../email/templates/base-layout';

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
    const bodyContent = `
      <p style="color: ${EMAIL_COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
        Hi ${data.firstName},
      </p>

      <p style="color: ${EMAIL_COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
        Thank you for reaching out. We've received your support ticket and our team will review it shortly.
      </p>

      ${createSectionHeader('Ticket Details')}

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(255,255,255,0.03); border: 1px solid ${EMAIL_COLORS.borderColor}; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.mutedGray}; font-size: 14px; width: 100px; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">Ticket #</td>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.cyan}; font-size: 14px; font-weight: 600; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">${data.ticketNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.mutedGray}; font-size: 14px; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">Subject</td>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.white}; font-size: 14px; font-weight: 600; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">${data.subject}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.mutedGray}; font-size: 14px; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">Priority</td>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.lightGray}; font-size: 14px; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">${data.priority}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.mutedGray}; font-size: 14px;">Category</td>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.lightGray}; font-size: 14px;">${data.category}</td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(255,255,255,0.02); border: 1px solid ${EMAIL_COLORS.borderColor}; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="padding: 16px;">
            <p style="color: ${EMAIL_COLORS.mutedGray}; font-size: 12px; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 0.5px;">Description</p>
            <p style="color: ${EMAIL_COLORS.lightGray}; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.description.slice(0, 500)}${data.description.length > 500 ? '...' : ''}</p>
          </td>
        </tr>
      </table>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 25px 0;">
        <tr>
          <td>
            <a href="${data.ticketUrl}" style="display: inline-block; background: ${EMAIL_COLORS.cyan}; color: ${EMAIL_COLORS.background}; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Ticket</a>
          </td>
        </tr>
      </table>

      <p style="color: ${EMAIL_COLORS.mutedGray}; font-size: 14px; line-height: 1.6; margin: 0;">
        We'll notify you when there's an update to your ticket.
      </p>
    `;

    return wrapInBaseLayout(bodyContent, {
      showHeader: true,
      showSignature: true,
      preheaderText: `Ticket ${data.ticketNumber} created: ${data.subject}`,
    });
  }

  private generateTicketUpdatedEmail(data: {
    firstName: string;
    ticketNumber: string;
    subject: string;
    previousStatus: string;
    newStatus: string;
    ticketUrl: string;
  }): string {
    const bodyContent = `
      <p style="color: ${EMAIL_COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
        Hi ${data.firstName},
      </p>

      <p style="color: ${EMAIL_COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
        There's been an update to your support ticket.
      </p>

      ${createSectionHeader('Ticket Details')}

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(255,255,255,0.03); border: 1px solid ${EMAIL_COLORS.borderColor}; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.mutedGray}; font-size: 14px; width: 100px; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">Ticket #</td>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.cyan}; font-size: 14px; font-weight: 600; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">${data.ticketNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.mutedGray}; font-size: 14px;">Subject</td>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.white}; font-size: 14px; font-weight: 600;">${data.subject}</td>
        </tr>
      </table>

      ${createSectionHeader('Status Change')}

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
        <tr>
          <td width="45%" style="vertical-align: top;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(255,255,255,0.03); border: 1px solid ${EMAIL_COLORS.borderColor}; border-radius: 8px;">
              <tr>
                <td style="padding: 16px; text-align: center;">
                  <p style="color: ${EMAIL_COLORS.mutedGray}; font-size: 11px; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 0.5px;">Previous</p>
                  <p style="color: ${EMAIL_COLORS.lightGray}; font-size: 14px; font-weight: 600; margin: 0;">${data.previousStatus}</p>
                </td>
              </tr>
            </table>
          </td>
          <td width="10%" style="text-align: center; vertical-align: middle;">
            <span style="color: ${EMAIL_COLORS.cyan}; font-size: 20px;">→</span>
          </td>
          <td width="45%" style="vertical-align: top;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(0, 212, 255, 0.1); border: 1px solid ${EMAIL_COLORS.cyan}; border-radius: 8px;">
              <tr>
                <td style="padding: 16px; text-align: center;">
                  <p style="color: ${EMAIL_COLORS.mutedGray}; font-size: 11px; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 0.5px;">New</p>
                  <p style="color: ${EMAIL_COLORS.cyan}; font-size: 14px; font-weight: 600; margin: 0;">${data.newStatus}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 25px 0;">
        <tr>
          <td>
            <a href="${data.ticketUrl}" style="display: inline-block; background: ${EMAIL_COLORS.cyan}; color: ${EMAIL_COLORS.background}; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Ticket</a>
          </td>
        </tr>
      </table>

      <p style="color: ${EMAIL_COLORS.mutedGray}; font-size: 14px; line-height: 1.6; margin: 0;">
        We'll continue to keep you updated on any changes.
      </p>
    `;

    return wrapInBaseLayout(bodyContent, {
      showHeader: true,
      showSignature: true,
      preheaderText: `Ticket ${data.ticketNumber} status changed to ${data.newStatus}`,
    });
  }

  private generateTicketResolvedEmail(data: {
    firstName: string;
    ticketNumber: string;
    subject: string;
    resolution: string;
    status: string;
    ticketUrl: string;
  }): string {
    // Green accent for resolved status
    const successGreen = '#10B981';

    const bodyContent = `
      <p style="color: ${EMAIL_COLORS.white}; font-size: 32px; font-weight: 700; margin: 0 0 20px; letter-spacing: -1px;">
        Ticket Resolved
      </p>

      <p style="color: ${EMAIL_COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
        Hi ${data.firstName},
      </p>

      <p style="color: ${EMAIL_COLORS.lightGray}; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
        Great news! Your support ticket has been resolved.
      </p>

      ${createSectionHeader('Ticket Details')}

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(255,255,255,0.03); border: 1px solid ${EMAIL_COLORS.borderColor}; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.mutedGray}; font-size: 14px; width: 100px; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">Ticket #</td>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.cyan}; font-size: 14px; font-weight: 600; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">${data.ticketNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.mutedGray}; font-size: 14px; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">Subject</td>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.white}; font-size: 14px; font-weight: 600; border-bottom: 1px solid ${EMAIL_COLORS.borderColor};">${data.subject}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; color: ${EMAIL_COLORS.mutedGray}; font-size: 14px;">Status</td>
          <td style="padding: 8px 16px;">
            <span style="display: inline-block; background: ${successGreen}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">${data.status}</span>
          </td>
        </tr>
      </table>

      ${createSectionHeader('Resolution')}

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="padding: 20px;">
            <p style="color: ${EMAIL_COLORS.lightGray}; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${data.resolution}</p>
          </td>
        </tr>
      </table>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 25px 0;">
        <tr>
          <td>
            <a href="${data.ticketUrl}" style="display: inline-block; background: ${EMAIL_COLORS.cyan}; color: ${EMAIL_COLORS.background}; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Ticket Details</a>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(255,255,255,0.03); border: 1px solid ${EMAIL_COLORS.borderColor}; border-radius: 8px; margin: 25px 0 0;">
        <tr>
          <td style="padding: 16px; text-align: center;">
            <p style="color: ${EMAIL_COLORS.mutedGray}; font-size: 13px; margin: 0;">
              Need more help? Reply to this email or <a href="${data.ticketUrl}" style="color: ${EMAIL_COLORS.cyan}; text-decoration: none; font-weight: 600;">open a new ticket</a>.
            </p>
          </td>
        </tr>
      </table>
    `;

    return wrapInBaseLayout(bodyContent, {
      showHeader: true,
      showSignature: true,
      preheaderText: `Great news! Ticket ${data.ticketNumber} has been resolved.`,
    });
  }
}
