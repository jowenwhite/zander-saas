import { Controller, Get, Post, Query, Body, Request, Logger, UseGuards } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GoogleAuthService } from './google-auth.service';
import { MicrosoftGraphService } from '../../integrations/microsoft/microsoft-graph.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('gmail')
@UseGuards(JwtAuthGuard)
export class GmailController {
  private readonly logger = new Logger(GmailController.name);

  constructor(
    private readonly gmailService: GmailService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly microsoftGraphService: MicrosoftGraphService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /gmail/sync
   * Provider-aware inbox sync. Checks tenant's IntegrationConnection first — if microsoft is
   * active, syncs from Outlook. Otherwise falls back to Gmail. Pam's sync_gmail_inbox tool
   * calls this endpoint and the provider switch is fully transparent.
   */
  @Post('sync')
  async syncEmails(
    @Request() req,
    @Body('maxResults') maxResults?: number,
  ) {
    const userId = req.user.sub;
    const tenantId = req.user.tenantId;
    this.logger.log(`Inbox sync for user: ${userId}, tenant: ${tenantId}`);

    try {
      const msConnection = await this.prisma.integrationConnection.findUnique({
        where: { tenantId_provider: { tenantId, provider: 'microsoft' } },
      });

      if (msConnection?.status === 'active') {
        this.logger.log(`Routing inbox sync to Microsoft Graph for tenant: ${tenantId}`);
        const result = await this.microsoftGraphService.syncInbox(tenantId, maxResults || 50);
        return { success: true, ...result, provider: 'microsoft' };
      }

      const googleToken = await this.googleAuthService.getTokenByUserId(userId);
      if (!googleToken) {
        return {
          success: false,
          synced: 0,
          error: 'No email provider connected. Connect Gmail or Outlook in Settings > Integrations.',
        };
      }

      this.logger.log(`Routing inbox sync to Gmail for user: ${userId}`);
      const result = await this.gmailService.syncEmails(userId, maxResults || 50);
      return { success: true, ...result, provider: 'google' };
    } catch (error) {
      this.logger.error(`Inbox sync error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Get('recent')
  async getRecentEmails(
    @Request() req,
    @Query('maxResults') maxResults?: string,
  ) {
    const userId = req.user.sub;

    const token = await this.googleAuthService.getTokenByUserId(userId);
    if (!token) {
      return { success: false, error: 'Gmail not connected', emails: [] };
    }

    try {
      const emails = await this.gmailService.getRecentEmails(
        userId,
        maxResults ? parseInt(maxResults) : 20,
      );
      return { success: true, emails };
    } catch (error) {
      this.logger.error(`Fetch error: ${error.message}`);
      return { success: false, error: error.message, emails: [] };
    }
  }

  @Post('send')
  async sendEmail(
    @Request() req,
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('body') body: string,
    @Body('htmlBody') htmlBody?: string,
  ) {
    const userId = req.user.sub;

    const token = await this.googleAuthService.getTokenByUserId(userId);
    if (!token) {
      return { success: false, error: 'Gmail not connected' };
    }

    try {
      const result = await this.gmailService.sendEmail(userId, to, subject, body, htmlBody);
      return { success: true, messageId: result.id };
    } catch (error) {
      this.logger.error(`Send error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Get('status')
  async getConnectionStatus(@Request() req) {
    const userId = req.user.sub;
    const tenantId = req.user.tenantId;

    const msConnection = await this.prisma.integrationConnection.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'microsoft' } },
    });

    if (msConnection?.status === 'active') {
      const meta = msConnection.metadata as { email?: string } | null;
      return { connected: true, provider: 'microsoft', email: meta?.email || null };
    }

    const googleToken = await this.googleAuthService.getTokenByUserId(userId);
    if (googleToken) {
      return { connected: true, provider: 'google', email: googleToken.email };
    }

    return { connected: false, provider: null, email: null };
  }
}
