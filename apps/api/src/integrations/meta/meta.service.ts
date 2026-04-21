import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { SelectPageDto } from './dto/select-page.dto';
import { CreateDraftPostDto } from './dto/create-draft-post.dto';

interface CacheEntry {
  data: any;
  expiresAt: number;
}

interface MetaPage {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramAccountId?: string;
  instagramUsername?: string;
}

interface MetaEngagementData {
  pageLikes: number;
  pageFollowers: number;
  postReach: { period7d: number; period30d: number };
  engagementRate: number;
  topPosts: Array<{
    id: string;
    message: string;
    createdTime: string;
    reach: number;
    engagement: number;
    type: 'facebook' | 'instagram';
  }>;
}

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private readonly GRAPH_API_VERSION = 'v19.0';
  private readonly GRAPH_API_BASE = `https://graph.facebook.com/${this.GRAPH_API_VERSION}`;

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
        purpose: 'meta-oauth',
      },
      jwtSecret,
      { expiresIn: '10m' },
    );

    const appId = this.configService.get<string>('META_APP_ID');
    const redirectUri = this.configService.get<string>('META_CALLBACK_URL')
      || `${this.configService.get<string>('API_URL') || 'http://localhost:3001'}/integrations/meta/callback`;

    // Required scopes for Facebook Pages + Instagram
    const scopes = [
      'pages_manage_posts',
      'pages_read_engagement',
      'pages_show_list',
      'instagram_basic',
      'instagram_content_publish',
      'pages_read_user_content',
    ].join(',');

    const authUrl = `https://www.facebook.com/${this.GRAPH_API_VERSION}/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${encodeURIComponent(stateToken)}&response_type=code`;

    return authUrl;
  }

  /**
   * Handle OAuth callback - exchange code for tokens and save to IntegrationConnection
   */
  async handleCallback(code: string, state: string): Promise<{ tenantId: string; pageCount: number }> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Verify state token
    let userId: string;
    let tenantId: string;
    try {
      const decoded = jwt.verify(state, jwtSecret) as any;
      if (decoded.purpose !== 'meta-oauth') {
        throw new Error('Invalid state token purpose');
      }
      userId = decoded.userId;
      tenantId = decoded.tenantId;
    } catch (error) {
      this.logger.error(`Invalid state token: ${error.message}`);
      throw new BadRequestException('Invalid or expired state token');
    }

    // Exchange code for short-lived token
    const appId = this.configService.get<string>('META_APP_ID');
    const appSecret = this.configService.get<string>('META_APP_SECRET');
    const redirectUri = this.configService.get<string>('META_CALLBACK_URL')
      || `${this.configService.get<string>('API_URL') || 'http://localhost:3001'}/integrations/meta/callback`;

    const tokenUrl = `${this.GRAPH_API_BASE}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      this.logger.error(`Meta token exchange failed: ${tokenData.error.message}`);
      throw new BadRequestException(`Failed to exchange code: ${tokenData.error.message}`);
    }

    const shortLivedToken = tokenData.access_token;

    // Exchange for long-lived token (60 days)
    const longLivedTokenUrl = `${this.GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;

    const longLivedResponse = await fetch(longLivedTokenUrl);
    const longLivedData = await longLivedResponse.json();

    if (longLivedData.error) {
      this.logger.error(`Meta long-lived token exchange failed: ${longLivedData.error.message}`);
      throw new BadRequestException(`Failed to get long-lived token: ${longLivedData.error.message}`);
    }

    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000; // Default 60 days

    this.logger.log(`Meta tokens received for tenant: ${tenantId}`);

    // Save to IntegrationConnection (tenant-level, not user-level)
    await this.prisma.integrationConnection.upsert({
      where: {
        tenantId_provider: {
          tenantId,
          provider: 'meta',
        },
      },
      update: {
        accessToken: longLivedToken,
        refreshToken: null, // Meta doesn't use refresh tokens for long-lived tokens
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        status: 'active',
        updatedAt: new Date(),
      },
      create: {
        tenantId,
        provider: 'meta',
        accessToken: longLivedToken,
        refreshToken: null,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        status: 'active',
      },
    });

    // Auto-detect pages
    const pages = await this.listPagesInternal(tenantId);

    // If only one page, auto-select it
    if (pages.length === 1) {
      await this.selectPage(tenantId, {
        pageId: pages[0].pageId,
        pageName: pages[0].pageName,
        pageAccessToken: pages[0].pageAccessToken,
        instagramAccountId: pages[0].instagramAccountId,
        instagramUsername: pages[0].instagramUsername,
      });
    }

    return { tenantId, pageCount: pages.length };
  }

  /**
   * List Facebook Pages accessible by the connected account
   */
  async listPages(tenantId: string): Promise<MetaPage[]> {
    return this.listPagesInternal(tenantId);
  }

  private async listPagesInternal(tenantId: string): Promise<MetaPage[]> {
    const connection = await this.getConnection(tenantId);

    try {
      // Get user's pages
      const pagesUrl = `${this.GRAPH_API_BASE}/me/accounts?fields=id,name,access_token&access_token=${connection.accessToken}`;
      const pagesResponse = await fetch(pagesUrl);
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        throw new Error(pagesData.error.message);
      }

      const pages: MetaPage[] = [];

      for (const page of pagesData.data || []) {
        // Get Instagram Business Account for this page
        const igUrl = `${this.GRAPH_API_BASE}/${page.id}?fields=instagram_business_account{id,username}&access_token=${page.access_token}`;
        const igResponse = await fetch(igUrl);
        const igData = await igResponse.json();

        pages.push({
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          instagramAccountId: igData.instagram_business_account?.id,
          instagramUsername: igData.instagram_business_account?.username,
        });
      }

      this.logger.log(`Found ${pages.length} Meta pages for tenant: ${tenantId}`);
      return pages;
    } catch (error) {
      this.logger.error(`Failed to list Meta pages: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save selected page to IntegrationConnection metadata
   */
  async selectPage(tenantId: string, dto: SelectPageDto): Promise<void> {
    await this.prisma.integrationConnection.update({
      where: {
        tenantId_provider: {
          tenantId,
          provider: 'meta',
        },
      },
      data: {
        metadata: {
          pageId: dto.pageId,
          pageName: dto.pageName,
          pageAccessToken: dto.pageAccessToken,
          instagramAccountId: dto.instagramAccountId,
          instagramUsername: dto.instagramUsername,
        },
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Selected Meta page ${dto.pageId} for tenant: ${tenantId}`);
  }

  /**
   * Get engagement data from Meta Graph API
   */
  async getEngagementData(
    tenantId: string,
    dateRange: '7d' | '30d' | '90d' = '30d',
  ): Promise<MetaEngagementData> {
    const cacheKey = `meta-${tenantId}-${dateRange}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const connection = await this.getConnection(tenantId);
    const metadata = connection.metadata as any;

    if (!metadata?.pageId) {
      throw new BadRequestException('No Meta page selected. Please select a page first.');
    }

    // Check if token needs refresh (within 7 days of expiry)
    if (connection.expiresAt) {
      const daysUntilExpiry = (connection.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry < 7) {
        await this.refreshToken(tenantId, connection);
      }
    }

    const pageAccessToken = metadata.pageAccessToken;
    const pageId = metadata.pageId;

    try {
      // Fetch page insights in parallel
      const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const since = Math.floor((Date.now() - daysBack * 24 * 60 * 60 * 1000) / 1000);
      const until = Math.floor(Date.now() / 1000);

      const [pageInfo, pageInsights, recentPosts] = await Promise.all([
        // Page info (likes, followers)
        this.fetchGraphAPI(`${pageId}?fields=fan_count,followers_count`, pageAccessToken),
        // Page insights
        this.fetchGraphAPI(
          `${pageId}/insights?metric=page_impressions,page_engaged_users,page_post_engagements&period=day&since=${since}&until=${until}`,
          pageAccessToken,
        ),
        // Recent posts with insights
        this.fetchGraphAPI(
          `${pageId}/posts?fields=id,message,created_time,insights.metric(post_impressions,post_engaged_users)&limit=10`,
          pageAccessToken,
        ),
      ]);

      // Parse page info
      const pageLikes = pageInfo.fan_count || 0;
      const pageFollowers = pageInfo.followers_count || 0;

      // Parse insights
      let totalImpressions = 0;
      let totalEngagedUsers = 0;
      let impressions7d = 0;
      let impressions30d = 0;

      for (const metric of pageInsights.data || []) {
        if (metric.name === 'page_impressions') {
          const values = metric.values || [];
          values.forEach((v: any, i: number) => {
            const val = v.value || 0;
            totalImpressions += val;
            if (i < 7) impressions7d += val;
            if (i < 30) impressions30d += val;
          });
        }
        if (metric.name === 'page_engaged_users') {
          const values = metric.values || [];
          values.forEach((v: any) => {
            totalEngagedUsers += v.value || 0;
          });
        }
      }

      // Calculate engagement rate
      const engagementRate = totalImpressions > 0
        ? (totalEngagedUsers / totalImpressions) * 100
        : 0;

      // Parse top posts
      const topPosts = (recentPosts.data || []).map((post: any) => {
        const insights = post.insights?.data || [];
        let reach = 0;
        let engagement = 0;
        for (const insight of insights) {
          if (insight.name === 'post_impressions') {
            reach = insight.values?.[0]?.value || 0;
          }
          if (insight.name === 'post_engaged_users') {
            engagement = insight.values?.[0]?.value || 0;
          }
        }
        return {
          id: post.id,
          message: post.message || '(Media post)',
          createdTime: post.created_time,
          reach,
          engagement,
          type: 'facebook' as const,
        };
      });

      const result: MetaEngagementData = {
        pageLikes,
        pageFollowers,
        postReach: {
          period7d: impressions7d,
          period30d: impressions30d,
        },
        engagementRate: Math.round(engagementRate * 100) / 100,
        topPosts: topPosts.slice(0, 5),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch Meta data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a draft social post - NEVER publishes, saves to database only
   * L3 DRAFT: Jonathan reviews and publishes manually
   */
  async createDraftPost(
    tenantId: string,
    userId: string,
    dto: CreateDraftPostDto,
  ): Promise<{ postId: string; message: string }> {
    const connection = await this.getConnection(tenantId);
    const metadata = connection.metadata as any;

    if (!metadata?.pageId) {
      throw new BadRequestException('No Meta page selected. Please select a page first.');
    }

    // Validate content length for Instagram
    if (dto.platform === 'instagram' && dto.content.length > 2200) {
      throw new BadRequestException('Instagram content cannot exceed 2200 characters');
    }

    // Find or create SocialAccount for this page
    let socialAccount = await this.prisma.socialAccount.findFirst({
      where: {
        tenantId,
        platform: dto.platform,
        accountId: dto.platform === 'instagram' ? metadata.instagramAccountId : metadata.pageId,
      },
    });

    if (!socialAccount) {
      socialAccount = await this.prisma.socialAccount.create({
        data: {
          tenantId,
          platform: dto.platform,
          accountName: dto.platform === 'instagram' ? (metadata.instagramUsername || metadata.pageName) : metadata.pageName,
          accountId: dto.platform === 'instagram' ? (metadata.instagramAccountId || metadata.pageId) : metadata.pageId,
          accessToken: metadata.pageAccessToken,
          isActive: true,
          connectedAt: new Date(),
          connectedBy: userId,
          metadata: {
            source: 'meta-integration',
            pageId: metadata.pageId,
          },
        },
      });
    }

    // Create draft post - NEVER call Graph API to publish
    const post = await this.prisma.socialPost.create({
      data: {
        tenantId,
        socialAccountId: socialAccount.id,
        content: dto.content,
        mediaUrls: dto.mediaUrl ? [dto.mediaUrl] : [],
        status: 'draft', // L3 DRAFT ONLY
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        campaignId: dto.campaignId,
        metadata: {
          platform: dto.platform,
          createdVia: 'meta-integration',
          requiresReview: true,
        },
      },
    });

    this.logger.log(`Created draft ${dto.platform} post ${post.id} for tenant: ${tenantId}`);

    return {
      postId: post.id,
      message: `Draft ${dto.platform} post created. Awaiting manual review and publishing.`,
    };
  }

  /**
   * Get connection status
   */
  async getStatus(tenantId: string): Promise<{
    connected: boolean;
    pageId?: string;
    pageName?: string;
    instagramConnected?: boolean;
    instagramUsername?: string;
    connectedAt?: Date;
    expiresAt?: Date;
  }> {
    try {
      const connection = await this.prisma.integrationConnection.findUnique({
        where: {
          tenantId_provider: {
            tenantId,
            provider: 'meta',
          },
        },
      });

      if (!connection || connection.status !== 'active') {
        return { connected: false };
      }

      const metadata = connection.metadata as any;
      return {
        connected: true,
        pageId: metadata?.pageId,
        pageName: metadata?.pageName,
        instagramConnected: !!metadata?.instagramAccountId,
        instagramUsername: metadata?.instagramUsername,
        connectedAt: connection.connectedAt,
        expiresAt: connection.expiresAt || undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get Meta status: ${error.message}`);
      return { connected: false };
    }
  }

  /**
   * Disconnect Meta integration
   */
  async disconnect(tenantId: string): Promise<void> {
    await this.prisma.integrationConnection.deleteMany({
      where: {
        tenantId,
        provider: 'meta',
      },
    });

    // Clear cache for this tenant
    for (const key of this.cache.keys()) {
      if (key.startsWith(`meta-${tenantId}-`)) {
        this.cache.delete(key);
      }
    }

    this.logger.log(`Disconnected Meta for tenant: ${tenantId}`);
  }

  // Helper: Get connection or throw
  private async getConnection(tenantId: string) {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: {
        tenantId_provider: {
          tenantId,
          provider: 'meta',
        },
      },
    });

    if (!connection) {
      throw new NotFoundException('Meta not connected');
    }

    return connection;
  }

  // Helper: Fetch from Graph API
  private async fetchGraphAPI(endpoint: string, accessToken: string): Promise<any> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.GRAPH_API_BASE}/${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data;
  }

  // Helper: Refresh long-lived token
  private async refreshToken(tenantId: string, connection: any): Promise<void> {
    try {
      const appId = this.configService.get<string>('META_APP_ID');
      const appSecret = this.configService.get<string>('META_APP_SECRET');

      const refreshUrl = `${this.GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${connection.accessToken}`;

      const response = await fetch(refreshUrl);
      const data = await response.json();

      if (data.access_token) {
        const expiresIn = data.expires_in || 5184000;
        await this.prisma.integrationConnection.update({
          where: { id: connection.id },
          data: {
            accessToken: data.access_token,
            expiresAt: new Date(Date.now() + expiresIn * 1000),
            updatedAt: new Date(),
          },
        });
        this.logger.log(`Refreshed Meta token for tenant: ${tenantId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to refresh Meta token: ${error.message}`);
    }
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
