import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../../prisma.service';
import { GoogleAuthService } from './google-auth.service';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async syncEmails(userId: string, maxResults: number = 50): Promise<{ synced: number; errors: number }> {
    const gmail = await this.googleAuthService.getGmailClient(userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found');
    }

    let synced = 0;
    let errors = 0;

    try {
      // Get list of messages
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'in:inbox OR in:sent',
      });

      const messages = response.data.messages || [];
      this.logger.log(`Found ${messages.length} messages to sync for user ${userId}`);

      for (const msg of messages) {
        try {
          // Check if we already have this message
          const existing = await this.prisma.emailMessage.findFirst({
            where: { messageId: msg.id },
          });

          if (existing) {
            continue; // Skip already synced messages
          }

          // Fetch full message details
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full',
          });

          const emailData = this.parseGmailMessage(fullMessage.data);
          
          // Determine direction based on from address
          const googleToken = await this.googleAuthService.getTokenByUserId(userId);
          const userGmailAddress = googleToken?.email?.toLowerCase();
          const isOutbound = emailData.from.toLowerCase().includes(userGmailAddress || '');

          // Try to match contact by email
          const contactEmail = isOutbound ? emailData.to : emailData.from;
          const contact = await this.findContactByEmail(user.tenantId, contactEmail);

          // Create email message record
          await this.prisma.emailMessage.create({
            data: {
              tenantId: user.tenantId,
              contactId: contact?.id || null,
              dealId: contact ? await this.findActiveDealForContact(contact.id) : null,
              direction: isOutbound ? 'outbound' : 'inbound',
              fromAddress: emailData.from,
              toAddress: emailData.to,
              subject: emailData.subject,
              body: emailData.textBody,
              htmlBody: emailData.htmlBody,
              messageId: msg.id,
              inReplyTo: emailData.inReplyTo,
              threadId: emailData.threadId,
              status: isOutbound ? 'sent' : 'received',
              sentAt: new Date(emailData.date),
            },
          });

          synced++;
        } catch (msgError) {
          this.logger.error(`Error syncing message ${msg.id}: ${msgError.message}`);
          errors++;
        }
      }

      this.logger.log(`Sync complete: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      this.logger.error(`Gmail sync error: ${error.message}`);
      throw error;
    }
  }

  async getRecentEmails(userId: string, maxResults: number = 20) {
    const gmail = await this.googleAuthService.getGmailClient(userId);

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'in:inbox',
    });

    const messages = response.data.messages || [];
    const emails = [];

    for (const msg of messages.slice(0, 10)) { // Limit to 10 for speed
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      emails.push(this.parseGmailMessage(fullMessage.data));
    }

    return emails;
  }

  async sendEmail(userId: string, to: string, subject: string, body: string, htmlBody?: string) {
    const gmail = await this.googleAuthService.getGmailClient(userId);
    const googleToken = await this.googleAuthService.getTokenByUserId(userId);

    const message = this.createMimeMessage(
      googleToken?.email || '',
      to,
      subject,
      body,
      htmlBody,
    );

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return response.data;
  }

  private parseGmailMessage(message: any) {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    let textBody = '';
    let htmlBody = '';

    // Extract body from parts
    const extractBody = (parts: any[]) => {
      for (const part of parts || []) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          textBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          extractBody(part.parts);
        }
      }
    };

    if (message.payload?.body?.data) {
      const bodyData = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      if (message.payload.mimeType === 'text/html') {
        htmlBody = bodyData;
      } else {
        textBody = bodyData;
      }
    } else if (message.payload?.parts) {
      extractBody(message.payload.parts);
    }

    // Extract email address from "Name <email>" format
    const extractEmail = (str: string) => {
      const match = str.match(/<([^>]+)>/);
      return match ? match[1] : str;
    };

    return {
      id: message.id,
      threadId: message.threadId,
      from: extractEmail(getHeader('From')),
      to: extractEmail(getHeader('To')),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      inReplyTo: getHeader('In-Reply-To'),
      textBody,
      htmlBody,
      snippet: message.snippet,
    };
  }

  private createMimeMessage(from: string, to: string, subject: string, text: string, html?: string): string {
    const boundary = '----=_Part_' + Math.random().toString(36).substr(2);
    
    let message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
    ];

    if (html) {
      message.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
      message.push('');
      message.push(`--${boundary}`);
      message.push('Content-Type: text/plain; charset=UTF-8');
      message.push('');
      message.push(text);
      message.push(`--${boundary}`);
      message.push('Content-Type: text/html; charset=UTF-8');
      message.push('');
      message.push(html);
      message.push(`--${boundary}--`);
    } else {
      message.push('Content-Type: text/plain; charset=UTF-8');
      message.push('');
      message.push(text);
    }

    return message.join('\r\n');
  }

  private async findContactByEmail(tenantId: string, email: string) {
    const cleanEmail = email.toLowerCase().trim();
    return this.prisma.contact.findFirst({
      where: {
        tenantId,
        email: { equals: cleanEmail, mode: 'insensitive' },
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
