import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private oauth2Client: any;

  constructor(private readonly prisma: PrismaService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );
  }

  async exchangeCodeForTokens(code: string): Promise<{ email: string; accessToken: string; refreshToken?: string }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    
    this.oauth2Client.setCredentials(tokens);
    
    // Get user email
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data } = await oauth2.userinfo.get();
    
    return {
      email: data.email || '',
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token,
    };
  }

  async saveTokens(userId: string, tokens: { email: string; accessToken: string; refreshToken?: string }) {
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    return this.prisma.googleToken.upsert({
      where: { userId },
      update: {
        email: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || undefined,
        expiresAt,
      },
      create: {
        userId,
        email: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt,
      },
    });
  }

  async getTokenByUserId(userId: string) {
    return this.prisma.googleToken.findUnique({
      where: { userId },
    });
  }

  async deleteTokens(userId: string) {
    try {
      await this.prisma.googleToken.delete({
        where: { userId },
      });
    } catch (error) {
      this.logger.warn(`No token to delete for user: ${userId}`);
    }
  }

  async getGmailClient(userId: string) {
    const token = await this.getTokenByUserId(userId);
    if (!token) {
      throw new Error('No Google token found for user');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await this.prisma.googleToken.update({
          where: { userId },
          data: {
            accessToken: tokens.access_token,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          },
        });
      }
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async getCalendarClient(userId: string) {
    const token = await this.getTokenByUserId(userId);
    if (!token) {
      throw new Error('No Google token found for user');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async getPeopleClient(userId: string) {
    const token = await this.getTokenByUserId(userId);
    if (!token) {
      throw new Error('No Google token found for user');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    return google.people({ version: 'v1', auth: oauth2Client });
  }
}
