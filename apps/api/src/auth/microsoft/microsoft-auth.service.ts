import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MicrosoftAuthService {
  private readonly logger = new Logger(MicrosoftAuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exchangeCodeForTokens(code: string): Promise<{ email: string; accessToken: string; refreshToken?: string }> {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID || '',
      client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
      code,
      redirect_uri: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3001/auth/microsoft/callback',
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      this.logger.error(`Token exchange failed: ${error}`);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Get user profile using Microsoft Graph
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text();
      this.logger.error(`Profile fetch failed: ${profileError}`);
      throw new Error('Failed to get user profile');
    }

    const profile = await profileResponse.json();

    return {
      email: profile.mail || profile.userPrincipalName || '',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  }

  async saveTokens(userId: string, tokens: { email: string; accessToken: string; refreshToken?: string }) {
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    return this.prisma.microsoftToken.upsert({
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
    return this.prisma.microsoftToken.findUnique({
      where: { userId },
    });
  }

  async deleteTokens(userId: string) {
    try {
      await this.prisma.microsoftToken.delete({
        where: { userId },
      });
    } catch (error) {
      this.logger.warn(`No Microsoft token to delete for user: ${userId}`);
    }
  }

  async refreshAccessToken(userId: string): Promise<string> {
    const token = await this.getTokenByUserId(userId);
    if (!token || !token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID || '',
      client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
      refresh_token: token.refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();

    await this.prisma.microsoftToken.update({
      where: { userId },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || token.refreshToken,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    });

    return tokens.access_token;
  }

  async getValidAccessToken(userId: string): Promise<string> {
    const token = await this.getTokenByUserId(userId);
    if (!token) {
      throw new Error('No Microsoft token found for user');
    }

    // Check if token is expired or will expire in next 5 minutes
    if (token.expiresAt && token.expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
      return this.refreshAccessToken(userId);
    }

    return token.accessToken;
  }
}
