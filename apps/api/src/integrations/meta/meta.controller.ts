import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Res,
  Request,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/jwt-auth.decorator';
import { MetaService } from './meta.service';
import { SelectPageDto } from './dto/select-page.dto';
import { CreateDraftPostDto } from './dto/create-draft-post.dto';

@Controller('integrations/meta')
export class MetaController {
  private readonly logger = new Logger(MetaController.name);

  constructor(private readonly metaService: MetaService) {}

  /**
   * POST /integrations/meta/connect
   * Returns the OAuth URL to redirect the user to
   */
  @UseGuards(JwtAuthGuard)
  @Post('connect')
  async connect(@Request() req): Promise<{ authUrl: string }> {
    const userId = req.user.sub;
    const tenantId = req.user.tenantId;

    this.logger.log(`Generating Meta OAuth URL for user: ${userId}, tenant: ${tenantId}`);

    const authUrl = this.metaService.getAuthUrl(userId, tenantId);
    return { authUrl };
  }

  /**
   * GET /integrations/meta/callback
   * OAuth callback from Meta - validates state and saves tokens
   */
  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

    // Handle OAuth errors
    if (error) {
      this.logger.error(`Meta OAuth error: ${error} - ${errorDescription}`);
      res.redirect(`${frontendUrl}/cmo/analytics?meta_error=${encodeURIComponent(errorDescription || error)}`);
      return;
    }

    if (!code || !state) {
      this.logger.error('Missing code or state in Meta callback');
      res.redirect(`${frontendUrl}/cmo/analytics?meta_error=missing_params`);
      return;
    }

    try {
      const result = await this.metaService.handleCallback(code, state);
      this.logger.log(`Meta connected for tenant: ${result.tenantId}, pages: ${result.pageCount}`);

      // Redirect based on page count
      if (result.pageCount === 1) {
        res.redirect(`${frontendUrl}/cmo/analytics?meta=connected`);
      } else if (result.pageCount > 1) {
        res.redirect(`${frontendUrl}/cmo/analytics?meta=select_page`);
      } else {
        res.redirect(`${frontendUrl}/cmo/analytics?meta_error=no_pages`);
      }
    } catch (err) {
      this.logger.error(`Meta callback failed: ${err.message}`);
      res.redirect(`${frontendUrl}/cmo/analytics?meta_error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * GET /integrations/meta/pages
   * List available Facebook Pages + Instagram accounts
   */
  @UseGuards(JwtAuthGuard)
  @Get('pages')
  async listPages(@Request() req): Promise<{
    pages: Array<{
      pageId: string;
      pageName: string;
      pageAccessToken: string;
      instagramAccountId?: string;
      instagramUsername?: string;
    }>;
  }> {
    const tenantId = req.user.tenantId;
    const pages = await this.metaService.listPages(tenantId);
    return { pages };
  }

  /**
   * POST /integrations/meta/select-page
   * Save the selected Facebook Page
   */
  @UseGuards(JwtAuthGuard)
  @Post('select-page')
  async selectPage(
    @Request() req,
    @Body() dto: SelectPageDto,
  ): Promise<{ success: boolean }> {
    const tenantId = req.user.tenantId;
    await this.metaService.selectPage(tenantId, dto);
    return { success: true };
  }

  /**
   * GET /integrations/meta/data
   * Fetch engagement data from Meta
   */
  @UseGuards(JwtAuthGuard)
  @Get('data')
  async getData(
    @Request() req,
    @Query('range') range?: string,
  ): Promise<{
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
  }> {
    const tenantId = req.user.tenantId;

    // Validate range parameter
    let dateRange: '7d' | '30d' | '90d' = '30d';
    if (range === '7d' || range === '30d' || range === '90d') {
      dateRange = range;
    }

    return this.metaService.getEngagementData(tenantId, dateRange);
  }

  /**
   * POST /integrations/meta/draft-post
   * Create a draft social post (L3 DRAFT ONLY - never auto-publishes)
   */
  @UseGuards(JwtAuthGuard)
  @Post('draft-post')
  async createDraftPost(
    @Request() req,
    @Body() dto: CreateDraftPostDto,
  ): Promise<{ postId: string; message: string }> {
    const tenantId = req.user.tenantId;
    const userId = req.user.sub;
    return this.metaService.createDraftPost(tenantId, userId, dto);
  }

  /**
   * GET /integrations/meta/status
   * Check connection status
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req): Promise<{
    connected: boolean;
    pageId?: string;
    pageName?: string;
    instagramConnected?: boolean;
    instagramUsername?: string;
    connectedAt?: Date;
    expiresAt?: Date;
  }> {
    const tenantId = req.user.tenantId;
    return this.metaService.getStatus(tenantId);
  }

  /**
   * DELETE /integrations/meta/disconnect
   * Disconnect Meta integration
   */
  @UseGuards(JwtAuthGuard)
  @Delete('disconnect')
  async disconnect(@Request() req): Promise<{ success: boolean }> {
    const tenantId = req.user.tenantId;
    await this.metaService.disconnect(tenantId);
    return { success: true };
  }
}
