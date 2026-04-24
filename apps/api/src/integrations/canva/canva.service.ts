import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Canva Connect API Integration Service
 *
 * OAuth2 flow for Canva Connect API
 * - Authorization URL: https://www.canva.com/api/oauth/authorize
 * - Token URL: https://api.canva.com/rest/v1/oauth/token
 * - Scopes: design:content:read, design:content:write, asset:read, asset:write
 *
 * NOTE: Canva Connect API requires approved integration status from Canva.
 * This implementation is ready to work once credentials are configured.
 * Env vars needed: CANVA_CLIENT_ID, CANVA_CLIENT_SECRET, CANVA_CALLBACK_URL
 */
@Injectable()
export class CanvaService {
  private readonly logger = new Logger(CanvaService.name);

  private readonly CANVA_AUTH_URL = 'https://www.canva.com/api/oauth/authorize';
  private readonly CANVA_TOKEN_URL = 'https://api.canva.com/rest/v1/oauth/token';
  private readonly CANVA_API_BASE = 'https://api.canva.com/rest/v1';
  private readonly SCOPES = 'design:content:read design:content:write asset:read asset:write';

  constructor(private prisma: PrismaService) {}

  /**
   * Generate Canva OAuth authorization URL
   */
  getAuthUrl(userId: string, tenantId: string): string {
    const clientId = process.env.CANVA_CLIENT_ID;
    const callbackUrl = process.env.CANVA_CALLBACK_URL || 'https://api.zanderos.com/integrations/canva/callback';

    if (!clientId) {
      throw new Error('CANVA_CLIENT_ID not configured. Contact support to enable Canva integration.');
    }

    // Create state parameter with user/tenant info
    const state = Buffer.from(JSON.stringify({ userId, tenantId })).toString('base64url');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: this.SCOPES,
      state,
    });

    const authUrl = `${this.CANVA_AUTH_URL}?${params.toString()}`;
    this.logger.log(`Generated Canva auth URL for tenant: ${tenantId}`);

    return authUrl;
  }

  /**
   * Handle OAuth callback - exchange code for tokens
   */
  async handleCallback(code: string, state: string): Promise<{ tenantId: string; userId: string }> {
    const clientId = process.env.CANVA_CLIENT_ID;
    const clientSecret = process.env.CANVA_CLIENT_SECRET;
    const callbackUrl = process.env.CANVA_CALLBACK_URL || 'https://api.zanderos.com/integrations/canva/callback';

    if (!clientId || !clientSecret) {
      throw new Error('Canva credentials not configured');
    }

    // Decode state parameter
    let stateData: { userId: string; tenantId: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      throw new Error('Invalid state parameter');
    }

    const { userId, tenantId } = stateData;

    // Exchange code for tokens
    const tokenResponse = await fetch(this.CANVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      this.logger.error(`Canva token exchange failed: ${tokenData.error}`);
      throw new Error(tokenData.error_description || tokenData.error);
    }

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Fetch user profile to get brand info
    let brandId: string | undefined;
    let brandName: string | undefined;
    try {
      const userResponse = await fetch(`${this.CANVA_API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });
      const userData = await userResponse.json();
      if (userData.team) {
        brandId = userData.team.id;
        brandName = userData.team.display_name;
      }
    } catch (err) {
      this.logger.warn(`Could not fetch Canva user profile: ${err.message}`);
    }

    // Upsert IntegrationConnection
    await this.prisma.integrationConnection.upsert({
      where: {
        tenantId_provider: { tenantId, provider: 'canva' },
      },
      create: {
        tenantId,
        provider: 'canva',
        status: 'active',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        connectedAt: new Date(),
        metadata: {
          brandId,
          brandName,
          connectedBy: userId,
          scopes: this.SCOPES.split(' '),
        },
      },
      update: {
        status: 'active',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        connectedAt: new Date(),
        metadata: {
          brandId,
          brandName,
          connectedBy: userId,
          scopes: this.SCOPES.split(' '),
        },
      },
    });

    this.logger.log(`Canva connected for tenant: ${tenantId}`);
    return { tenantId, userId };
  }

  /**
   * Get connection status
   */
  async getStatus(tenantId: string): Promise<{
    connected: boolean;
    brandId?: string;
    brandName?: string;
    connectedAt?: Date;
    expiresAt?: Date;
  }> {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: {
        tenantId_provider: { tenantId, provider: 'canva' },
      },
    });

    if (!connection || connection.status !== 'active') {
      return { connected: false };
    }

    const metadata = connection.metadata as Record<string, unknown> | null;

    return {
      connected: true,
      brandId: metadata?.brandId as string | undefined,
      brandName: metadata?.brandName as string | undefined,
      connectedAt: connection.connectedAt || undefined,
      expiresAt: connection.expiresAt || undefined,
    };
  }

  /**
   * Disconnect Canva integration
   */
  async disconnect(tenantId: string): Promise<void> {
    await this.prisma.integrationConnection.updateMany({
      where: { tenantId, provider: 'canva' },
      data: { status: 'disconnected' },
    });
    this.logger.log(`Canva disconnected for tenant: ${tenantId}`);
  }

  /**
   * Check if Canva is connected for a tenant
   */
  async isConnected(tenantId: string): Promise<boolean> {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: {
        tenantId_provider: { tenantId, provider: 'canva' },
      },
    });
    return !!connection && connection.status === 'active';
  }

  /**
   * Get access token, refreshing if needed
   */
  private async getAccessToken(tenantId: string): Promise<string> {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: {
        tenantId_provider: { tenantId, provider: 'canva' },
      },
    });

    if (!connection || connection.status !== 'active') {
      throw new Error('Canva not connected. Connect via Settings > Integrations.');
    }

    // Check if token needs refresh (expires in less than 5 minutes)
    const expiresAt = connection.expiresAt;
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt && expiresAt < fiveMinutesFromNow && connection.refreshToken) {
      return this.refreshAccessToken(tenantId, connection.refreshToken);
    }

    if (!connection.accessToken) {
      throw new Error('No access token available');
    }

    return connection.accessToken;
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(tenantId: string, refreshToken: string): Promise<string> {
    const clientId = process.env.CANVA_CLIENT_ID;
    const clientSecret = process.env.CANVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Canva credentials not configured');
    }

    const response = await fetch(this.CANVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (data.error) {
      this.logger.error(`Canva token refresh failed: ${data.error}`);
      // Mark connection as needing reconnection
      await this.prisma.integrationConnection.updateMany({
        where: { tenantId, provider: 'canva' },
        data: { status: 'expired' },
      });
      throw new Error('Canva session expired. Please reconnect.');
    }

    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await this.prisma.integrationConnection.updateMany({
      where: { tenantId, provider: 'canva' },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt,
      },
    });

    return data.access_token;
  }

  // ============================================
  // DESIGN OPERATIONS
  // TODO: Implement once Canva credentials are available
  // ============================================

  /**
   * List user's Canva designs
   * TODO: Implement via Canva Connect API GET /v1/designs
   */
  async listDesigns(
    tenantId: string,
    options?: { limit?: number; continuation?: string },
  ): Promise<{
    success: boolean;
    designs?: Array<{
      id: string;
      title: string;
      thumbnailUrl: string;
      editUrl: string;
      createdAt: string;
      updatedAt: string;
    }>;
    continuation?: string;
    error?: string;
  }> {
    const isConnected = await this.isConnected(tenantId);
    if (!isConnected) {
      return { success: false, error: 'Canva not connected. Connect via Settings > Integrations.' };
    }

    try {
      const accessToken = await this.getAccessToken(tenantId);

      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.continuation) params.set('continuation', options.continuation);

      const response = await fetch(`${this.CANVA_API_BASE}/designs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Canva list designs failed: ${JSON.stringify(data)}`);
        return { success: false, error: data.message || 'Failed to fetch designs' };
      }

      const designs = (data.items || []).map((design: Record<string, unknown>) => ({
        id: design.id,
        title: design.title || 'Untitled',
        thumbnailUrl: (design.thumbnail as Record<string, unknown>)?.url || '',
        editUrl: design.urls && (design.urls as Record<string, string>).edit_url,
        createdAt: design.created_at,
        updatedAt: design.updated_at,
      }));

      return {
        success: true,
        designs,
        continuation: data.continuation,
      };
    } catch (err) {
      this.logger.error(`Canva list designs error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Create a new Canva design
   * TODO: Returns URL to open Canva editor
   */
  async createDesign(
    tenantId: string,
    options: {
      title: string;
      designType?: 'social_media_graphic' | 'presentation' | 'document' | 'whiteboard';
      width?: number;
      height?: number;
    },
  ): Promise<{
    success: boolean;
    designId?: string;
    editUrl?: string;
    error?: string;
  }> {
    const isConnected = await this.isConnected(tenantId);
    if (!isConnected) {
      return { success: false, error: 'Canva not connected. Connect via Settings > Integrations.' };
    }

    try {
      const accessToken = await this.getAccessToken(tenantId);

      const body: Record<string, unknown> = {
        title: options.title,
        design_type: options.designType || 'social_media_graphic',
      };

      if (options.width && options.height) {
        body.width = options.width;
        body.height = options.height;
      }

      const response = await fetch(`${this.CANVA_API_BASE}/designs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Canva create design failed: ${JSON.stringify(data)}`);
        return { success: false, error: data.message || 'Failed to create design' };
      }

      return {
        success: true,
        designId: data.design?.id,
        editUrl: data.design?.urls?.edit_url,
      };
    } catch (err) {
      this.logger.error(`Canva create design error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Import a Canva design as a DesignAsset
   */
  async importDesign(
    tenantId: string,
    canvaDesignId: string,
  ): Promise<{
    success: boolean;
    assetId?: string;
    error?: string;
  }> {
    const isConnected = await this.isConnected(tenantId);
    if (!isConnected) {
      return { success: false, error: 'Canva not connected. Connect via Settings > Integrations.' };
    }

    try {
      const accessToken = await this.getAccessToken(tenantId);

      // Fetch design details
      const response = await fetch(`${this.CANVA_API_BASE}/designs/${canvaDesignId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to fetch design' };
      }

      const design = data.design;

      // Export design as PNG
      const exportResponse = await fetch(`${this.CANVA_API_BASE}/designs/${canvaDesignId}/exports`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: { type: 'png' },
        }),
      });

      const exportData = await exportResponse.json();
      let fileUrl = '';
      let thumbnailUrl = '';

      if (exportResponse.ok && exportData.job) {
        // Poll for export completion (simplified - in production, use webhooks)
        // For now, we'll use the thumbnail as the preview
        thumbnailUrl = design.thumbnail?.url || '';
        fileUrl = exportData.job.result?.urls?.[0] || thumbnailUrl;
      }

      // Create DesignAsset record
      const asset = await this.prisma.designAsset.create({
        data: {
          tenantId,
          name: design.title || 'Canva Design',
          type: 'IMAGE',
          source: 'canva',
          sourceId: canvaDesignId,
          fileUrl,
          thumbnailUrl,
          dimensions: design.page_count
            ? { pages: design.page_count }
            : undefined,
          tags: ['canva', 'imported'],
        },
      });

      return { success: true, assetId: asset.id };
    } catch (err) {
      this.logger.error(`Canva import design error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
