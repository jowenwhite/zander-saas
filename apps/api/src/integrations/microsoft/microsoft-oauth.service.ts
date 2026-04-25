import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const GRAPH_ME_URL = 'https://graph.microsoft.com/v1.0/me';

export const MICROSOFT_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'Mail.Read',
  'Mail.Send',
  'Calendars.ReadWrite',
  'Files.Read',
  'Files.ReadWrite.All',
].join(' ');

@Injectable()
export class MicrosoftOAuthService {
  private readonly logger = new Logger(MicrosoftOAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  getAuthUrl(userId: string, tenantId: string): string {
    const clientId = this.config.get<string>('MICROSOFT_CLIENT_ID');
    const redirectUri = encodeURIComponent(
      this.config.get<string>('MICROSOFT_CALLBACK_URL') ||
        'http://localhost:3001/integrations/microsoft/callback',
    );
    const scope = encodeURIComponent(MICROSOFT_SCOPES);

    const jwtSecret = this.config.get<string>('JWT_SECRET');
    const state = jwt.sign(
      { userId, tenantId, purpose: 'microsoft-integration-oauth' },
      jwtSecret,
      { expiresIn: '10m' },
    );

    return (
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${encodeURIComponent(state)}` +
      `&prompt=consent`
    );
  }

  decodeState(state: string): { userId: string; tenantId: string } {
    const jwtSecret = this.config.get<string>('JWT_SECRET');
    const decoded = jwt.verify(state, jwtSecret) as any;
    if (decoded.purpose !== 'microsoft-integration-oauth') {
      throw new Error('Invalid state token purpose');
    }
    return { userId: decoded.userId, tenantId: decoded.tenantId };
  }

  async exchangeCodeForTokens(code: string): Promise<{
    email: string;
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date;
  }> {
    const params = new URLSearchParams({
      client_id: this.config.get<string>('MICROSOFT_CLIENT_ID') || '',
      client_secret: this.config.get<string>('MICROSOFT_CLIENT_SECRET') || '',
      code,
      redirect_uri:
        this.config.get<string>('MICROSOFT_CALLBACK_URL') ||
        'http://localhost:3001/integrations/microsoft/callback',
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      this.logger.error(`Microsoft token exchange failed: ${err}`);
      throw new Error('Failed to exchange Microsoft authorization code');
    }

    const tokens = await tokenRes.json();

    const profileRes = await fetch(GRAPH_ME_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      throw new Error('Failed to fetch Microsoft user profile');
    }

    const profile = await profileRes.json();
    const email = profile.mail || profile.userPrincipalName || '';

    const expiresIn = tokens.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresAt,
    };
  }

  async saveConnection(
    tenantId: string,
    userId: string,
    tokens: { email: string; accessToken: string; refreshToken: string | null; expiresAt: Date },
  ) {
    return this.prisma.integrationConnection.upsert({
      where: { tenantId_provider: { tenantId, provider: 'microsoft' } },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || undefined,
        expiresAt: tokens.expiresAt,
        status: 'active',
        metadata: { email: tokens.email, connectedByUserId: userId },
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        provider: 'microsoft',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || undefined,
        expiresAt: tokens.expiresAt,
        status: 'active',
        metadata: { email: tokens.email, connectedByUserId: userId },
      },
    });
  }

  async getStatus(tenantId: string): Promise<{ connected: boolean; email: string | null; connectedAt: Date | null }> {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'microsoft' } },
    });

    if (!connection || connection.status !== 'active') {
      return { connected: false, email: null, connectedAt: null };
    }

    const meta = connection.metadata as { email?: string } | null;
    return {
      connected: true,
      email: meta?.email || null,
      connectedAt: connection.connectedAt,
    };
  }

  async disconnect(tenantId: string): Promise<void> {
    await this.prisma.integrationConnection.updateMany({
      where: { tenantId, provider: 'microsoft' },
      data: { status: 'disconnected', accessToken: null, refreshToken: null },
    });
    this.logger.log(`Microsoft disconnected for tenant: ${tenantId}`);
  }

  async getValidAccessToken(tenantId: string): Promise<string> {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'microsoft' } },
    });

    if (!connection || !connection.accessToken) {
      throw new Error('Microsoft not connected for this tenant');
    }

    const fiveMinutes = 5 * 60 * 1000;
    const isExpiringSoon =
      connection.expiresAt && connection.expiresAt < new Date(Date.now() + fiveMinutes);

    if (isExpiringSoon) {
      return this.refreshAccessToken(tenantId, connection);
    }

    return connection.accessToken;
  }

  private async refreshAccessToken(
    tenantId: string,
    connection: { refreshToken?: string | null },
  ): Promise<string> {
    if (!connection.refreshToken) {
      throw new Error('No refresh token available for Microsoft connection');
    }

    const params = new URLSearchParams({
      client_id: this.config.get<string>('MICROSOFT_CLIENT_ID') || '',
      client_secret: this.config.get<string>('MICROSOFT_CLIENT_SECRET') || '',
      refresh_token: connection.refreshToken,
      grant_type: 'refresh_token',
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Microsoft token refresh failed for tenant ${tenantId}: ${err}`);
      await this.prisma.integrationConnection.updateMany({
        where: { tenantId, provider: 'microsoft' },
        data: { status: 'expired' },
      });
      throw new Error('Failed to refresh Microsoft access token');
    }

    const tokens = await res.json();
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

    await this.prisma.integrationConnection.updateMany({
      where: { tenantId, provider: 'microsoft' },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || connection.refreshToken,
        expiresAt,
        status: 'active',
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Microsoft token refreshed for tenant: ${tenantId}`);
    return tokens.access_token;
  }
}
