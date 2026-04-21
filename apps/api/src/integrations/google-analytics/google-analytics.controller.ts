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
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/jwt-auth.decorator';
import { GoogleAnalyticsService } from './google-analytics.service';
import { SelectPropertyDto } from './dto/select-property.dto';

@Controller('integrations/google-analytics')
export class GoogleAnalyticsController {
  private readonly logger = new Logger(GoogleAnalyticsController.name);

  constructor(private readonly gaService: GoogleAnalyticsService) {}

  /**
   * POST /integrations/google-analytics/connect
   * Returns the OAuth URL to redirect the user to
   */
  @UseGuards(JwtAuthGuard)
  @Post('connect')
  async connect(@Request() req): Promise<{ authUrl: string }> {
    const userId = req.user.sub;
    const tenantId = req.user.tenantId;

    this.logger.log(`Generating GA4 OAuth URL for user: ${userId}, tenant: ${tenantId}`);

    const authUrl = this.gaService.getAuthUrl(userId, tenantId);
    return { authUrl };
  }

  /**
   * GET /integrations/google-analytics/callback
   * OAuth callback from Google - validates state and saves tokens
   */
  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'https://app.zanderos.com';

    // Handle OAuth errors
    if (error) {
      this.logger.error(`GA4 OAuth error: ${error}`);
      res.redirect(`${frontendUrl}/cmo/analytics?ga_error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code || !state) {
      this.logger.error('Missing code or state in GA4 callback');
      res.redirect(`${frontendUrl}/cmo/analytics?ga_error=missing_params`);
      return;
    }

    try {
      const result = await this.gaService.handleCallback(code, state);
      this.logger.log(`GA4 connected for tenant: ${result.tenantId}, properties: ${result.propertyCount}`);

      // Redirect based on property count
      if (result.propertyCount === 1) {
        res.redirect(`${frontendUrl}/cmo/analytics?ga=connected`);
      } else if (result.propertyCount > 1) {
        res.redirect(`${frontendUrl}/cmo/analytics?ga=select_property`);
      } else {
        res.redirect(`${frontendUrl}/cmo/analytics?ga_error=no_properties`);
      }
    } catch (err) {
      this.logger.error(`GA4 callback failed: ${err.message}`);
      res.redirect(`${frontendUrl}/cmo/analytics?ga_error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * GET /integrations/google-analytics/properties
   * List available GA4 properties
   */
  @UseGuards(JwtAuthGuard)
  @Get('properties')
  async listProperties(@Request() req): Promise<{
    properties: Array<{ propertyId: string; displayName: string; accountId: string }>;
  }> {
    const tenantId = req.user.tenantId;
    const properties = await this.gaService.listProperties(tenantId);
    return { properties };
  }

  /**
   * POST /integrations/google-analytics/select-property
   * Save the selected GA4 property
   */
  @UseGuards(JwtAuthGuard)
  @Post('select-property')
  async selectProperty(
    @Request() req,
    @Body() dto: SelectPropertyDto,
  ): Promise<{ success: boolean }> {
    const tenantId = req.user.tenantId;
    await this.gaService.selectProperty(tenantId, dto);
    return { success: true };
  }

  /**
   * GET /integrations/google-analytics/data
   * Fetch web traffic data from GA4
   */
  @UseGuards(JwtAuthGuard)
  @Get('data')
  async getData(
    @Request() req,
    @Query('range') range?: string,
  ): Promise<{
    activeUsers: { today: number; period: number };
    sessions: number;
    pageViews: number;
    newVsReturning: { new: number; returning: number };
    topPages: Array<{ path: string; views: number; avgTimeOnPage: number }>;
    trafficSources: Array<{ source: string; medium: string; sessions: number }>;
  }> {
    const tenantId = req.user.tenantId;

    // Validate range parameter
    let dateRange: '7d' | '30d' | '90d' = '30d';
    if (range === '7d' || range === '30d' || range === '90d') {
      dateRange = range;
    }

    return this.gaService.getWebTrafficData(tenantId, dateRange);
  }

  /**
   * GET /integrations/google-analytics/status
   * Check connection status
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req): Promise<{
    connected: boolean;
    propertyId?: string;
    propertyName?: string;
    connectedAt?: Date;
  }> {
    const tenantId = req.user.tenantId;
    return this.gaService.getStatus(tenantId);
  }

  /**
   * DELETE /integrations/google-analytics/disconnect
   * Disconnect Google Analytics integration
   */
  @UseGuards(JwtAuthGuard)
  @Delete('disconnect')
  async disconnect(@Request() req): Promise<{ success: boolean }> {
    const tenantId = req.user.tenantId;
    await this.gaService.disconnect(tenantId);
    return { success: true };
  }
}
