import { Controller, Get, Post, Query, Body, Request, Logger, UseGuards } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GoogleAuthService } from './google-auth.service';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('gmail')
@UseGuards(JwtAuthGuard)
export class GmailController {
  private readonly logger = new Logger(GmailController.name);

  constructor(
    private readonly gmailService: GmailService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Post('sync')
  async syncEmails(
    @Request() req,
    @Body('maxResults') maxResults?: number,
  ) {
    const userId = req.user.sub;
    this.logger.log(`Syncing emails for user: ${userId}`);

    // Verify user has connected Gmail
    const token = await this.googleAuthService.getTokenByUserId(userId);
    if (!token) {
      return { success: false, error: 'Gmail not connected' };
    }

    try {
      const result = await this.gmailService.syncEmails(userId, maxResults || 50);
      return { success: true, ...result };
    } catch (error) {
      this.logger.error(`Sync error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Get('recent')
  async getRecentEmails(
    @Request() req,
    @Query('maxResults') maxResults?: string,
  ) {
    const userId = req.user.sub;
    this.logger.log(`Fetching recent emails for user: ${userId}`);

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
    this.logger.log(`Sending email for user: ${userId} to: ${to}`);

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
    const token = await this.googleAuthService.getTokenByUserId(userId);
    return {
      connected: !!token,
      email: token?.email || null,
      connectedAt: token?.createdAt || null,
    };
  }
}
