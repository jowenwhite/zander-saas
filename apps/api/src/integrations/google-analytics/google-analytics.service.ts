import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { SelectPropertyDto } from './dto/select-property.dto';

interface CacheEntry {
  data: any;
  expiresAt: number;
}

@Injectable()
export class GoogleAnalyticsService {
  private readonly logger = new Logger(GoogleAnalyticsService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate OAuth URL with signed state token
   */
  getAuthUrl(userId: string, tenantId: string): string {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Generate signed state token (10 minute expiry)
    const stateToken = jwt.sign(
      {
        userId,
        tenantId,
        purpose: 'google-analytics-oauth',
      },
      jwtSecret,
      { expiresIn: '10m' },
    );

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_ANALYTICS_CALLBACK_URL')
      || `${this.configService.get<string>('API_URL') || 'http://localhost:3001'}/integrations/google-analytics/callback`;

    // GA4 requires these scopes
    const scope = encodeURIComponent('https://www.googleapis.com/auth/analytics.readonly');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${encodeURIComponent(stateToken)}`;

    return authUrl;
  }

  /**
   * Handle OAuth callback - exchange code for tokens and save to IntegrationConnection
   */
  async handleCallback(code: string, state: string): Promise<{ tenantId: string; propertyCount: number }> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Verify state token
    let userId: string;
    let tenantId: string;
    try {
      const decoded = jwt.verify(state, jwtSecret) as any;
      if (decoded.purpose !== 'google-analytics-oauth') {
        throw new Error('Invalid state token purpose');
      }
      userId = decoded.userId;
      tenantId = decoded.tenantId;
    } catch (error) {
      this.logger.error(`Invalid state token: ${error.message}`);
      throw new BadRequestException('Invalid or expired state token');
    }

    // Exchange code for tokens
    const oauth2Client = this.createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    this.logger.log(`GA4 tokens received for tenant: ${tenantId}`);

    // Save to IntegrationConnection (tenant-level, not user-level)
    await this.prisma.integrationConnection.upsert({
      where: {
        tenantId_provider: {
          tenantId,
          provider: 'google-analytics',
        },
      },
      update: {
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        status: 'active',
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        provider: 'google-analytics',
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        status: 'active',
      },
    });

    // Auto-detect properties
    const properties = await this.listPropertiesInternal(tenantId);

    // If only one property, auto-select it
    if (properties.length === 1) {
      await this.selectProperty(tenantId, {
        propertyId: properties[0].propertyId,
        propertyName: properties[0].displayName,
        accountId: properties[0].accountId,
      });
    }

    return { tenantId, propertyCount: properties.length };
  }

  /**
   * List GA4 properties accessible by the connected account
   */
  async listProperties(tenantId: string): Promise<Array<{
    propertyId: string;
    displayName: string;
    accountId: string;
  }>> {
    return this.listPropertiesInternal(tenantId);
  }

  private async listPropertiesInternal(tenantId: string): Promise<Array<{
    propertyId: string;
    displayName: string;
    accountId: string;
  }>> {
    const connection = await this.getConnection(tenantId);
    const oauth2Client = await this.getAuthenticatedClient(connection);

    const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth: oauth2Client });

    try {
      // First, list accounts
      const accountsResponse = await analyticsAdmin.accounts.list();
      const accounts = accountsResponse.data.accounts || [];

      const properties: Array<{ propertyId: string; displayName: string; accountId: string }> = [];

      // For each account, list properties
      for (const account of accounts) {
        const accountId = account.name?.replace('accounts/', '') || '';
        const propsResponse = await analyticsAdmin.properties.list({
          filter: `parent:accounts/${accountId}`,
        });

        for (const prop of propsResponse.data.properties || []) {
          properties.push({
            propertyId: prop.name?.replace('properties/', '') || '',
            displayName: prop.displayName || 'Unnamed Property',
            accountId,
          });
        }
      }

      this.logger.log(`Found ${properties.length} GA4 properties for tenant: ${tenantId}`);
      return properties;
    } catch (error) {
      this.logger.error(`Failed to list GA4 properties: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save selected property to IntegrationConnection metadata
   */
  async selectProperty(tenantId: string, dto: SelectPropertyDto): Promise<void> {
    await this.prisma.integrationConnection.update({
      where: {
        tenantId_provider: {
          tenantId,
          provider: 'google-analytics',
        },
      },
      data: {
        metadata: {
          propertyId: dto.propertyId,
          propertyName: dto.propertyName,
          measurementId: dto.measurementId,
          accountId: dto.accountId,
        },
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Selected GA4 property ${dto.propertyId} for tenant: ${tenantId}`);
  }

  /**
   * Get web traffic data from GA4
   */
  async getWebTrafficData(
    tenantId: string,
    dateRange: '7d' | '30d' | '90d' = '30d',
  ): Promise<{
    activeUsers: { today: number; period: number };
    sessions: number;
    pageViews: number;
    newVsReturning: { new: number; returning: number };
    topPages: Array<{ path: string; views: number; avgTimeOnPage: number }>;
    trafficSources: Array<{ source: string; medium: string; sessions: number }>;
  }> {
    const cacheKey = `ga4-${tenantId}-${dateRange}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const connection = await this.getConnection(tenantId);
    const metadata = connection.metadata as any;

    if (!metadata?.propertyId) {
      throw new BadRequestException('No GA4 property selected. Please select a property first.');
    }

    const oauth2Client = await this.getAuthenticatedClient(connection);
    const analyticsData = google.analyticsdata({ version: 'v1beta', auth: oauth2Client });

    const propertyId = `properties/${metadata.propertyId}`;
    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = `${daysBack}daysAgo`;
    const endDate = 'today';

    try {
      // Run multiple queries in parallel
      const [overviewReport, topPagesReport, trafficSourcesReport, todayReport] = await Promise.all([
        // Overview metrics
        analyticsData.properties.runReport({
          property: propertyId,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            metrics: [
              { name: 'activeUsers' },
              { name: 'sessions' },
              { name: 'screenPageViews' },
              { name: 'newUsers' },
            ],
          },
        }),
        // Top pages
        analyticsData.properties.runReport({
          property: propertyId,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
            ],
            limit: '10',
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          },
        }),
        // Traffic sources
        analyticsData.properties.runReport({
          property: propertyId,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
            metrics: [{ name: 'sessions' }],
            limit: '10',
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          },
        }),
        // Today's active users
        analyticsData.properties.runReport({
          property: propertyId,
          requestBody: {
            dateRanges: [{ startDate: 'today', endDate: 'today' }],
            metrics: [{ name: 'activeUsers' }],
          },
        }),
      ]);

      // Parse overview
      const overviewRow = overviewReport.data.rows?.[0]?.metricValues || [];
      const activeUsersPeriod = parseInt(overviewRow[0]?.value || '0', 10);
      const sessions = parseInt(overviewRow[1]?.value || '0', 10);
      const pageViews = parseInt(overviewRow[2]?.value || '0', 10);
      const newUsers = parseInt(overviewRow[3]?.value || '0', 10);

      // Today's users
      const todayRow = todayReport.data.rows?.[0]?.metricValues || [];
      const activeUsersToday = parseInt(todayRow[0]?.value || '0', 10);

      // Parse top pages
      const topPages = (topPagesReport.data.rows || []).map((row) => ({
        path: row.dimensionValues?.[0]?.value || '/',
        views: parseInt(row.metricValues?.[0]?.value || '0', 10),
        avgTimeOnPage: parseFloat(row.metricValues?.[1]?.value || '0'),
      }));

      // Parse traffic sources
      const trafficSources = (trafficSourcesReport.data.rows || []).map((row) => ({
        source: row.dimensionValues?.[0]?.value || '(direct)',
        medium: row.dimensionValues?.[1]?.value || '(none)',
        sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
      }));

      const result = {
        activeUsers: {
          today: activeUsersToday,
          period: activeUsersPeriod,
        },
        sessions,
        pageViews,
        newVsReturning: {
          new: newUsers,
          returning: activeUsersPeriod - newUsers,
        },
        topPages,
        trafficSources,
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch GA4 data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  async getStatus(tenantId: string): Promise<{
    connected: boolean;
    propertyId?: string;
    propertyName?: string;
    connectedAt?: Date;
  }> {
    try {
      const connection = await this.prisma.integrationConnection.findUnique({
        where: {
          tenantId_provider: {
            tenantId,
            provider: 'google-analytics',
          },
        },
      });

      if (!connection || connection.status !== 'active') {
        return { connected: false };
      }

      const metadata = connection.metadata as any;
      return {
        connected: true,
        propertyId: metadata?.propertyId,
        propertyName: metadata?.propertyName,
        connectedAt: connection.connectedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get GA4 status: ${error.message}`);
      return { connected: false };
    }
  }

  /**
   * Disconnect Google Analytics integration
   */
  async disconnect(tenantId: string): Promise<void> {
    await this.prisma.integrationConnection.deleteMany({
      where: {
        tenantId,
        provider: 'google-analytics',
      },
    });

    // Clear cache for this tenant
    for (const key of this.cache.keys()) {
      if (key.startsWith(`ga4-${tenantId}-`)) {
        this.cache.delete(key);
      }
    }

    this.logger.log(`Disconnected GA4 for tenant: ${tenantId}`);
  }

  // Helper: Get connection or throw
  private async getConnection(tenantId: string) {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: {
        tenantId_provider: {
          tenantId,
          provider: 'google-analytics',
        },
      },
    });

    if (!connection) {
      throw new NotFoundException('Google Analytics not connected');
    }

    return connection;
  }

  // Helper: Create OAuth client with token refresh handling
  private createOAuthClient() {
    return new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_ANALYTICS_CALLBACK_URL')
        || `${this.configService.get<string>('API_URL') || 'http://localhost:3001'}/integrations/google-analytics/callback`,
    );
  }

  // Helper: Get authenticated client with token refresh
  private async getAuthenticatedClient(connection: any) {
    const oauth2Client = this.createOAuthClient();

    oauth2Client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken,
    });

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.access_token) {
        await this.prisma.integrationConnection.update({
          where: { id: connection.id },
          data: {
            accessToken: tokens.access_token,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            updatedAt: new Date(),
          },
        });
        this.logger.log(`Refreshed GA4 token for connection: ${connection.id}`);
      }
    });

    return oauth2Client;
  }

  // Cache helpers
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }
}
