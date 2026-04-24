import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MetaService } from '../../integrations/meta/meta.service';

// ============================================
// PLATFORM ADAPTER INTERFACES
// Phase 4: Social Media Integration Architecture
// ============================================

export interface SocialPostPayload {
  content: string;
  mediaUrls?: string[];
  scheduledFor?: Date;
  metadata?: Record<string, unknown>;
  tenantId?: string; // Added for Meta adapters to access tenant context
}

export interface SocialReplyPayload {
  engagementId: string;
  content: string;
}

export interface PlatformAnalytics {
  followers: number;
  engagementRate: number;
  postsThisMonth: number;
  impressions: number;
  clicks: number;
}

export interface PlatformAdapter {
  connect(tenantId: string, authCode: string): Promise<{ success: boolean; accountId?: string; error?: string }>;
  disconnect(accountId: string): Promise<{ success: boolean; error?: string }>;
  publishPost(accountId: string, payload: SocialPostPayload): Promise<{ success: boolean; platformPostId?: string; error?: string }>;
  getEngagements(accountId: string, since?: Date): Promise<{ success: boolean; engagements?: any[]; error?: string }>;
  replyToEngagement(accountId: string, payload: SocialReplyPayload): Promise<{ success: boolean; error?: string }>;
  getAnalytics(accountId: string, dateFrom: Date, dateTo: Date): Promise<{ success: boolean; analytics?: PlatformAnalytics; error?: string }>;
}

// ============================================
// PLATFORM ADAPTERS
// Facebook and Instagram use Meta Graph API via MetaService
// ============================================

class FacebookAdapter implements PlatformAdapter {
  constructor(private metaService: MetaService) {}

  async connect(tenantId: string, authCode: string): Promise<{ success: boolean; accountId?: string; error?: string }> {
    // OAuth flow is handled by MetaService OAuth endpoints
    // This adapter is for publishing after connection is established
    return { success: false, error: 'Use Settings > Integrations to connect Facebook via Meta OAuth flow.' };
  }

  async disconnect(): Promise<{ success: boolean; error?: string }> {
    // Disconnection is handled via MetaService disconnect endpoint
    return { success: false, error: 'Use Settings > Integrations to disconnect Facebook.' };
  }

  async publishPost(accountId: string, payload: SocialPostPayload): Promise<{ success: boolean; platformPostId?: string; error?: string }> {
    if (!payload.tenantId) {
      return { success: false, error: 'Tenant ID required for Facebook publishing.' };
    }

    // Check if Meta is connected for this tenant
    const isConnected = await this.metaService.isConnected(payload.tenantId);
    if (!isConnected) {
      return { success: false, error: 'Facebook not connected. Connect via Settings > Integrations.' };
    }

    // Publish via Meta Graph API
    return this.metaService.publishToFacebook(
      payload.tenantId,
      payload.content,
      payload.mediaUrls,
    );
  }

  async getEngagements(): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement via Meta Graph API /page/feed with fields=comments,likes
    return { success: false, error: 'Facebook engagement fetching not yet implemented.' };
  }

  async replyToEngagement(): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement via Meta Graph API POST /comment_id/replies
    return { success: false, error: 'Facebook reply not yet implemented.' };
  }

  async getAnalytics(): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement via Meta Graph API /page/insights
    return { success: false, error: 'Facebook analytics not yet implemented.' };
  }
}

class InstagramAdapter implements PlatformAdapter {
  constructor(private metaService: MetaService) {}

  async connect(tenantId: string, authCode: string): Promise<{ success: boolean; accountId?: string; error?: string }> {
    // OAuth flow is handled by MetaService OAuth endpoints (same as Facebook)
    return { success: false, error: 'Use Settings > Integrations to connect Instagram via Meta OAuth flow.' };
  }

  async disconnect(): Promise<{ success: boolean; error?: string }> {
    // Disconnection is handled via MetaService disconnect endpoint
    return { success: false, error: 'Use Settings > Integrations to disconnect Instagram.' };
  }

  async publishPost(accountId: string, payload: SocialPostPayload): Promise<{ success: boolean; platformPostId?: string; error?: string }> {
    if (!payload.tenantId) {
      return { success: false, error: 'Tenant ID required for Instagram publishing.' };
    }

    // Check if Meta is connected for this tenant
    const isConnected = await this.metaService.isConnected(payload.tenantId);
    if (!isConnected) {
      return { success: false, error: 'Instagram not connected. Connect via Settings > Integrations.' };
    }

    // Publish via Meta Graph API (two-step: create media container, then publish)
    // Note: Instagram requires an image - MetaService will return error if no media
    return this.metaService.publishToInstagram(
      payload.tenantId,
      payload.content,
      payload.mediaUrls,
    );
  }

  async getEngagements(): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement via Meta Graph API /ig-media/comments
    return { success: false, error: 'Instagram engagement fetching not yet implemented.' };
  }

  async replyToEngagement(): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement via Meta Graph API POST /ig-comment/replies
    return { success: false, error: 'Instagram reply not yet implemented.' };
  }

  async getAnalytics(): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement via Meta Graph API /ig-user/insights
    return { success: false, error: 'Instagram analytics not yet implemented.' };
  }
}

class LinkedInAdapter implements PlatformAdapter {
  async connect(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'LinkedIn integration not yet configured. Requires LinkedIn Marketing API OAuth app.' };
  }
  async disconnect(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'LinkedIn integration not yet configured.' };
  }
  async publishPost(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'LinkedIn integration not yet configured.' };
  }
  async getEngagements(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'LinkedIn integration not yet configured.' };
  }
  async replyToEngagement(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'LinkedIn integration not yet configured.' };
  }
  async getAnalytics(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'LinkedIn integration not yet configured.' };
  }
}

class TikTokAdapter implements PlatformAdapter {
  async connect(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'TikTok integration not yet configured. Requires TikTok for Business API access.' };
  }
  async disconnect(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'TikTok integration not yet configured.' };
  }
  async publishPost(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'TikTok integration not yet configured.' };
  }
  async getEngagements(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'TikTok integration not yet configured.' };
  }
  async replyToEngagement(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'TikTok integration not yet configured.' };
  }
  async getAnalytics(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'TikTok integration not yet configured.' };
  }
}

class YouTubeAdapter implements PlatformAdapter {
  async connect(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'YouTube integration not yet configured. Requires YouTube Data API OAuth app.' };
  }
  async disconnect(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'YouTube integration not yet configured.' };
  }
  async publishPost(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'YouTube integration not yet configured.' };
  }
  async getEngagements(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'YouTube integration not yet configured.' };
  }
  async replyToEngagement(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'YouTube integration not yet configured.' };
  }
  async getAnalytics(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'YouTube integration not yet configured.' };
  }
}

class TwitterAdapter implements PlatformAdapter {
  async connect(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Twitter/X integration not yet configured. Requires Twitter API v2 OAuth 2.0 app.' };
  }
  async disconnect(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Twitter/X integration not yet configured.' };
  }
  async publishPost(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Twitter/X integration not yet configured.' };
  }
  async getEngagements(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Twitter/X integration not yet configured.' };
  }
  async replyToEngagement(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Twitter/X integration not yet configured.' };
  }
  async getAnalytics(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Twitter/X integration not yet configured.' };
  }
}

// ============================================
// ENGAGEMENT ESCALATION DECISION
// ============================================

export type EscalationDecision = 'auto_reply' | 'draft_for_approval' | 'escalate_immediately';

export interface EscalationResult {
  decision: EscalationDecision;
  reason: string;
  suggestedReply?: string;
}

// ============================================
// MAIN SOCIAL MEDIA SERVICE
// ============================================

@Injectable()
export class SocialMediaService {
  private readonly logger = new Logger(SocialMediaService.name);
  private adapters: Map<string, PlatformAdapter> = new Map();

  constructor(
    private prisma: PrismaService,
    private metaService: MetaService,
  ) {
    // Initialize all platform adapters
    // Facebook and Instagram use MetaService for Graph API calls
    this.adapters.set('facebook', new FacebookAdapter(this.metaService));
    this.adapters.set('instagram', new InstagramAdapter(this.metaService));
    this.adapters.set('linkedin', new LinkedInAdapter());
    this.adapters.set('tiktok', new TikTokAdapter());
    this.adapters.set('youtube', new YouTubeAdapter());
    this.adapters.set('twitter', new TwitterAdapter());
  }

  private getAdapter(platform: string): PlatformAdapter {
    const adapter = this.adapters.get(platform.toLowerCase());
    if (!adapter) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return adapter;
  }

  // ============================================
  // SOCIAL ACCOUNT MANAGEMENT
  // ============================================

  async connectAccount(tenantId: string, platform: string, authCode: string, userId: string) {
    const adapter = this.getAdapter(platform);
    const result = await adapter.connect(tenantId, authCode);

    if (!result.success) {
      return result;
    }

    // Create account record in database
    const account = await this.prisma.socialAccount.create({
      data: {
        tenantId,
        platform: platform.toLowerCase(),
        accountName: `${platform} Account`, // Would be populated from OAuth response
        accountId: result.accountId || `pending_${Date.now()}`,
        connectedBy: userId,
        isActive: true,
      },
    });

    return { success: true, account };
  }

  async disconnectAccount(accountId: string) {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    const adapter = this.getAdapter(account.platform);
    await adapter.disconnect(account.accountId);

    await this.prisma.socialAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    return { success: true };
  }

  async listAccounts(tenantId: string) {
    return this.prisma.socialAccount.findMany({
      where: { tenantId, isActive: true },
      orderBy: { platform: 'asc' },
    });
  }

  // ============================================
  // POST MANAGEMENT
  // ============================================

  async createPost(
    tenantId: string,
    socialAccountId: string,
    content: string,
    options: {
      mediaUrls?: string[];
      scheduledFor?: Date;
      campaignId?: string;
      calendarEventId?: string;
      status?: string;
    } = {},
  ) {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!account || account.tenantId !== tenantId) {
      return { success: false, error: 'Social account not found' };
    }

    const post = await this.prisma.socialPost.create({
      data: {
        tenantId,
        socialAccountId,
        content,
        mediaUrls: options.mediaUrls || [],
        scheduledFor: options.scheduledFor,
        campaignId: options.campaignId,
        calendarEventId: options.calendarEventId,
        status: options.status || 'draft',
      },
    });

    return { success: true, post };
  }

  async publishPost(postId: string) {
    const post = await this.prisma.socialPost.findUnique({
      where: { id: postId },
      include: { socialAccount: true },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    const adapter = this.getAdapter(post.socialAccount.platform);
    const result = await adapter.publishPost(post.socialAccount.accountId, {
      content: post.content,
      mediaUrls: post.mediaUrls,
      tenantId: post.tenantId, // Pass tenantId for Meta adapters to access IntegrationConnection
    });

    if (!result.success) {
      await this.prisma.socialPost.update({
        where: { id: postId },
        data: { status: 'failed' },
      });
      return result;
    }

    await this.prisma.socialPost.update({
      where: { id: postId },
      data: {
        status: 'published',
        platformPostId: result.platformPostId,
        publishedAt: new Date(),
      },
    });

    return { success: true, platformPostId: result.platformPostId };
  }

  async listPosts(tenantId: string, options: { status?: string; limit?: number } = {}) {
    return this.prisma.socialPost.findMany({
      where: {
        tenantId,
        ...(options.status ? { status: options.status } : {}),
      },
      include: { socialAccount: true },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
    });
  }

  // ============================================
  // ENGAGEMENT EVALUATION (ESCALATION RULES)
  // Implements Don's social media agent rules
  // ============================================

  evaluateEngagement(engagement: {
    type: string;
    content?: string;
    sentiment?: string;
    authorFollowers?: number;
    authorHandle?: string;
  }): EscalationResult {
    const { type, content, sentiment, authorFollowers, authorHandle } = engagement;
    const contentLower = (content || '').toLowerCase();

    // ESCALATE IMMEDIATELY conditions
    const escalateKeywords = [
      'lawsuit', 'lawyer', 'attorney', 'legal action', 'sue you',
      'fda', 'ftc', 'sec', 'regulatory', 'compliance',
      'data breach', 'privacy violation', 'gdpr', 'ccpa',
      'journalist', 'reporter', 'media inquiry', 'press',
      'going viral', 'trending', 'news story',
    ];

    for (const keyword of escalateKeywords) {
      if (contentLower.includes(keyword)) {
        return {
          decision: 'escalate_immediately',
          reason: `Contains escalation trigger: "${keyword}"`,
        };
      }
    }

    // High-follower accounts (10k+) always need approval
    if (authorFollowers && authorFollowers >= 10000) {
      return {
        decision: 'draft_for_approval',
        reason: `High-profile account (${authorFollowers.toLocaleString()} followers)`,
        suggestedReply: this.generateSuggestedReply(engagement),
      };
    }

    // Negative sentiment always needs approval
    if (sentiment === 'negative') {
      return {
        decision: 'draft_for_approval',
        reason: 'Negative sentiment detected - requires human review',
        suggestedReply: this.generateSuggestedReply(engagement),
      };
    }

    // Pricing/refund/commitment mentions need approval
    const approvalKeywords = ['price', 'pricing', 'refund', 'money back', 'guarantee', 'promise', 'commit'];
    for (const keyword of approvalKeywords) {
      if (contentLower.includes(keyword)) {
        return {
          decision: 'draft_for_approval',
          reason: `Contains commitment-related keyword: "${keyword}"`,
          suggestedReply: this.generateSuggestedReply(engagement),
        };
      }
    }

    // DMs beyond simple acknowledgment need approval
    if (type === 'dm' && content && content.length > 50) {
      return {
        decision: 'draft_for_approval',
        reason: 'DM requires more than simple acknowledgment',
        suggestedReply: this.generateSuggestedReply(engagement),
      };
    }

    // AUTO-EXECUTE conditions (positive, simple interactions)
    if (sentiment === 'positive' && type === 'comment') {
      return {
        decision: 'auto_reply',
        reason: 'Positive comment - safe for auto-reply',
        suggestedReply: this.getPositiveAutoReply(),
      };
    }

    if (type === 'like' || type === 'share') {
      return {
        decision: 'auto_reply',
        reason: 'Like/share acknowledgment',
        suggestedReply: null, // No reply needed for likes/shares
      };
    }

    // Default: draft for approval if uncertain
    return {
      decision: 'draft_for_approval',
      reason: 'Uncertain engagement - defaulting to human review',
      suggestedReply: this.generateSuggestedReply(engagement),
    };
  }

  private generateSuggestedReply(engagement: {
    type: string;
    content?: string;
    sentiment?: string;
  }): string {
    // Generate a draft reply based on engagement type and sentiment
    // This would be enhanced with AI generation in the future
    if (engagement.sentiment === 'negative') {
      return "We're sorry to hear about your experience. We'd love to help resolve this - could you DM us with more details?";
    }
    if (engagement.type === 'dm') {
      return "Thanks for reaching out! Let me get you the information you need.";
    }
    return "Thanks for your comment! We appreciate you engaging with us.";
  }

  private getPositiveAutoReply(): string {
    const replies = [
      "Thanks! We're glad you found this helpful.",
      "Thank you for the kind words!",
      "We appreciate your support!",
      "Thanks for sharing your thoughts!",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // ============================================
  // ENGAGEMENT MANAGEMENT
  // ============================================

  async getPendingEngagements(tenantId: string) {
    return this.prisma.socialEngagement.findMany({
      where: {
        tenantId,
        status: { in: ['new', 'draft_reply'] },
      },
      include: {
        socialAccount: true,
        socialPost: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEngagementReply(
    engagementId: string,
    replyContent: string,
    replyStatus: 'pending_approval' | 'auto',
  ) {
    const engagement = await this.prisma.socialEngagement.update({
      where: { id: engagementId },
      data: {
        replyContent,
        replyStatus,
        status: replyStatus === 'auto' ? 'auto_replied' : 'draft_reply',
        respondedAt: replyStatus === 'auto' ? new Date() : null,
        respondedBy: replyStatus === 'auto' ? 'don_auto' : null,
      },
    });

    return { success: true, engagement };
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getAnalytics(tenantId: string, dateFrom: Date, dateTo: Date) {
    const accounts = await this.prisma.socialAccount.findMany({
      where: { tenantId, isActive: true },
    });

    const results: Record<string, any> = {};

    for (const account of accounts) {
      const adapter = this.getAdapter(account.platform);
      const analytics = await adapter.getAnalytics(account.accountId, dateFrom, dateTo);
      results[account.platform] = analytics;
    }

    // Aggregate post metrics from database
    const postMetrics = await this.prisma.socialPost.groupBy({
      by: ['status'],
      where: {
        tenantId,
        createdAt: { gte: dateFrom, lte: dateTo },
      },
      _count: true,
    });

    const engagementMetrics = await this.prisma.socialEngagement.groupBy({
      by: ['type'],
      where: {
        tenantId,
        createdAt: { gte: dateFrom, lte: dateTo },
      },
      _count: true,
    });

    return {
      platforms: results,
      posts: postMetrics,
      engagements: engagementMetrics,
    };
  }
}
