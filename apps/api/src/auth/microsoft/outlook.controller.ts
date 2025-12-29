import { Controller, Get, Post, Query, Body, Logger } from '@nestjs/common';
import { OutlookService } from './outlook.service';
import { MicrosoftAuthService } from './microsoft-auth.service';
import { PrismaService } from '../../prisma.service';
import { Public } from '../jwt-auth.decorator';

@Controller('outlook')
export class OutlookController {
  private readonly logger = new Logger(OutlookController.name);

  constructor(
    private readonly outlookService: OutlookService,
    private readonly microsoftAuthService: MicrosoftAuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('sync')
  async syncEmails(
    @Body('userId') userId: string,
    @Body('maxResults') maxResults?: number,
  ) {
    this.logger.log(`Syncing Outlook emails for user: ${userId}`);
    
    const token = await this.microsoftAuthService.getTokenByUserId(userId);
    if (!token) {
      return { success: false, error: 'Outlook not connected' };
    }

    try {
      const result = await this.syncOutlookEmails(userId, maxResults || 50);
      return { success: true, ...result };
    } catch (error) {
      this.logger.error(`Outlook sync error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async syncOutlookEmails(userId: string, maxResults: number): Promise<{ synced: number; errors: number }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    let synced = 0;
    let errors = 0;

    try {
      const messages = await this.outlookService.getMessages(userId, { limit: maxResults });
      this.logger.log(`Found ${messages.length} Outlook messages to sync for user ${userId}`);

      const microsoftToken = await this.microsoftAuthService.getTokenByUserId(userId);
      const userOutlookAddress = microsoftToken?.email?.toLowerCase() || '';

      for (const msg of messages) {
        try {
          // Check if we already have this message
          const existing = await this.prisma.emailMessage.findFirst({
            where: { messageId: msg.id },
          });

          if (existing) {
            continue;
          }

          // Parse message data
          const fromAddress = msg.from?.emailAddress?.address || '';
          const toAddresses = msg.toRecipients?.map((r: any) => r.emailAddress?.address).filter(Boolean) || [];
          const toAddress = toAddresses.join(', ');
          
          const isOutbound = fromAddress.toLowerCase() === userOutlookAddress;
          const contactEmail = isOutbound ? toAddresses[0] : fromAddress;
          
          // Try to match contact
          const contact = contactEmail ? await this.findContactByEmail(user.tenantId, contactEmail) : null;

          await this.prisma.emailMessage.create({
            data: {
              tenantId: user.tenantId,
              contactId: contact?.id || null,
              dealId: contact ? await this.findActiveDealForContact(contact.id) : null,
              direction: isOutbound ? 'outbound' : 'inbound',
              fromAddress: fromAddress,
              toAddress: toAddress,
              subject: msg.subject || '(No Subject)',
              body: msg.bodyPreview || '',
              htmlBody: msg.body?.contentType === 'html' ? msg.body?.content : null,
              messageId: msg.id,
              inReplyTo: msg.conversationId || null,
              threadId: msg.conversationId || null,
              status: isOutbound ? 'sent' : 'received',
              sentAt: new Date(msg.receivedDateTime || msg.sentDateTime || Date.now()),
            },
          });
          synced++;
        } catch (msgError) {
          this.logger.error(`Error syncing Outlook message ${msg.id}: ${msgError.message}`);
          errors++;
        }
      }

      this.logger.log(`Outlook sync complete: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      this.logger.error(`Outlook sync error: ${error.message}`);
      throw error;
    }
  }

  private async findContactByEmail(tenantId: string, email: string) {
    if (!email) return null;
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
        status: { notIn: ['won', 'lost'] },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return deal?.id || null;
  }

  @Public()
  @Post('send')
  async sendEmail(
    @Body('userId') userId: string,
    @Body('to') to: string | string[],
    @Body('subject') subject: string,
    @Body('body') body: string,
    @Body('isHtml') isHtml?: boolean,
  ) {
    this.logger.log(`Sending Outlook email for user: ${userId}`);
    
    const token = await this.microsoftAuthService.getTokenByUserId(userId);
    if (!token) {
      return { success: false, error: 'Outlook not connected' };
    }

    try {
      const toArray = Array.isArray(to) ? to : [to];
      await this.outlookService.sendEmail(userId, {
        to: toArray,
        subject,
        body,
        isHtml,
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Outlook send error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
