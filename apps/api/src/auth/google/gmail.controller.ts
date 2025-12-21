import { Controller, Get, Post, Query, Body, Logger } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GoogleAuthService } from './google-auth.service';
import { Public } from '../jwt-auth.decorator';

@Controller('gmail')
export class GmailController {
  private readonly logger = new Logger(GmailController.name);

  constructor(
    private readonly gmailService: GmailService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Public()
  @Post('sync')
  async syncEmails(
    @Body('userId') userId: string,
    @Body('maxResults') maxResults?: number,
  ) {
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

  @Public()
  @Get('recent')
  async getRecentEmails(
    @Query('userId') userId: string,
    @Query('maxResults') maxResults?: string,
  ) {
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

  @Public()
  @Post('send')
  async sendEmail(
    @Body('userId') userId: string,
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('body') body: string,
    @Body('htmlBody') htmlBody?: string,
  ) {
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

  @Public()
  @Get('status')
  async getConnectionStatus(@Query('userId') userId: string) {
    const token = await this.googleAuthService.getTokenByUserId(userId);
    return {
      connected: !!token,
      email: token?.email || null,
      connectedAt: token?.createdAt || null,
    };
  }
}
