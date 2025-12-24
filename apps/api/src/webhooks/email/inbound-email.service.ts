import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

interface ResendInboundEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  reply_to?: string;
  message_id?: string;
  in_reply_to?: string;
  references?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content_type: string;
    content: string;
  }>;
}

@Injectable()
export class InboundEmailService {
  private readonly logger = new Logger(InboundEmailService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processInboundEmail(payload: ResendInboundEmail) {
    // Extract email address from "Name <email@domain.com>" format
    const fromEmail = this.extractEmail(payload.from);
    const toEmail = this.extractEmail(payload.to);
    
    this.logger.log(`Processing email from ${fromEmail} to ${toEmail}`);

    // Find tenant by the receiving email domain
    const tenant = await this.findTenantByEmail(toEmail);
    if (!tenant) {
      this.logger.warn(`No tenant found for email: ${toEmail}`);
      throw new Error(`No tenant found for receiving address: ${toEmail}`);
    }

    // Find contact by sender email
    const contact = await this.findContactByEmail(tenant.id, fromEmail);
    
    // Find existing thread if this is a reply
    let threadId = null;
    if (payload.in_reply_to) {
      const parentEmail = await this.prisma.emailMessage.findFirst({
        where: { messageId: payload.in_reply_to },
      });
      if (parentEmail) {
        threadId = parentEmail.threadId || parentEmail.id;
      }
    }

    // If no thread found but we have a contact, check for recent conversation
    if (!threadId && contact) {
      const recentEmail = await this.prisma.emailMessage.findFirst({
        where: {
          tenantId: tenant.id,
          contactId: contact.id,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        },
        orderBy: { createdAt: 'desc' },
      });
      if (recentEmail) {
        threadId = recentEmail.threadId || recentEmail.id;
      }
    }

    // Create the email message
    const emailMessage = await this.prisma.emailMessage.create({
      data: {
        tenantId: tenant.id,
        contactId: contact?.id || null,
        dealId: contact ? await this.findActiveDealForContact(contact.id) : null,
        direction: 'inbound',
        fromAddress: fromEmail,
        toAddress: toEmail,
        subject: payload.subject || '(No Subject)',
        body: payload.text || '',
        htmlBody: payload.html || null,
        messageId: payload.message_id || null,
        inReplyTo: payload.in_reply_to || null,
        threadId: threadId,
        status: 'received',
        sentAt: new Date(),
      },
    });

    this.logger.log(`Created email message: ${emailMessage.id} for tenant: ${tenant.id}`);

    // If contact found, update their last activity
    if (contact) {
      await this.prisma.contact.update({
        where: { id: contact.id },
        data: { updatedAt: new Date() },
      });
    }

    return emailMessage;
  }

  async updateEmailStatus(emailId: string, eventType: string, data: any) {
    const statusMap: Record<string, string> = {
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'opened',
      'email.bounced': 'failed',
      'email.complained': 'failed',
    };

    const newStatus = statusMap[eventType];
    if (!newStatus) {
      this.logger.log(`Unknown email event type: ${eventType}`);
      return;
    }

    try {
      const updateData: any = { status: newStatus };
      
      if (eventType === 'email.opened' || eventType === 'email.clicked') {
        updateData.openedAt = new Date();
      }

      await this.prisma.emailMessage.updateMany({
        where: { messageId: emailId },
        data: updateData,
      });

      this.logger.log(`Updated email ${emailId} status to: ${newStatus}`);
    } catch (error) {
      this.logger.error(`Failed to update email status: ${error.message}`);
    }
  }

  private extractEmail(emailString: string): string {
    // Handle "Name <email@domain.com>" format
    const match = emailString.match(/<([^>]+)>/);
    if (match) {
      return match[1].toLowerCase();
    }
    // Already just an email
    return emailString.toLowerCase().trim();
  }

  private async findTenantByEmail(email: string): Promise<{ id: string } | null> {
    // For now, we'll match based on domain or use a default tenant
    // In production, you'd have a tenant_domains table
    
    // Check if email is to mcfapp.com domain
    if (email.includes('@mcfapp.com') || email.includes('@zander.mcfapp.com')) {
      // Return the first tenant (for MVP)
      // Later: match inbox prefix to tenant (e.g., tenant123@zander.mcfapp.com)
      const tenant = await this.prisma.tenant.findFirst();
      return tenant;
    }

    return null;
  }

  private async findContactByEmail(tenantId: string, email: string) {
    return this.prisma.contact.findFirst({
      where: {
        tenantId,
        email: { equals: email, mode: 'insensitive' },
      },
    });
  }

  private async findActiveDealForContact(contactId: string): Promise<string | null> {
    const deal = await this.prisma.deal.findFirst({
      where: {
        contactId,
        stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return deal?.id || null;
  }
}
