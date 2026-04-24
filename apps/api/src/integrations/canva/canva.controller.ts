import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Res,
  Request,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/jwt-auth.decorator';
import { CanvaService } from './canva.service';

@Controller('integrations/canva')
export class CanvaController {
  private readonly logger = new Logger(CanvaController.name);

  constructor(private readonly canvaService: CanvaService) {}

  /**
   * POST /integrations/canva/connect
   * Returns the OAuth URL to redirect the user to
   */
  @UseGuards(JwtAuthGuard)
  @Post('connect')
  async connect(@Request() req): Promise<{ authUrl: string }> {
    const userId = req.user.sub;
    const tenantId = req.user.tenantId;

    this.logger.log(`Generating Canva OAuth URL for user: ${userId}, tenant: ${tenantId}`);

    const authUrl = this.canvaService.getAuthUrl(userId, tenantId);
    return { authUrl };
  }

  /**
   * GET /integrations/canva/callback
   * OAuth callback from Canva - validates state and saves tokens
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
    const frontendUrl = process.env.FRONTEND_URL || 'https://app.zanderos.com';

    // Handle OAuth errors
    if (error) {
      this.logger.error(`Canva OAuth error: ${error} - ${errorDescription}`);
      res.redirect(`${frontendUrl}/settings/integrations?canva_error=${encodeURIComponent(errorDescription || error)}`);
      return;
    }

    if (!code || !state) {
      this.logger.error('Missing code or state in Canva callback');
      res.redirect(`${frontendUrl}/settings/integrations?canva_error=missing_params`);
      return;
    }

    try {
      const result = await this.canvaService.handleCallback(code, state);
      this.logger.log(`Canva connected for tenant: ${result.tenantId}`);
      res.redirect(`${frontendUrl}/settings/integrations?canva=connected`);
    } catch (err) {
      this.logger.error(`Canva callback failed: ${err.message}`);
      res.redirect(`${frontendUrl}/settings/integrations?canva_error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * GET /integrations/canva/status
   * Check connection status
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req): Promise<{
    connected: boolean;
    brandId?: string;
    brandName?: string;
    connectedAt?: Date;
    expiresAt?: Date;
  }> {
    const tenantId = req.user.tenantId;
    return this.canvaService.getStatus(tenantId);
  }

  /**
   * DELETE /integrations/canva/disconnect
   * Disconnect Canva integration
   */
  @UseGuards(JwtAuthGuard)
  @Delete('disconnect')
  async disconnect(@Request() req): Promise<{ success: boolean }> {
    const tenantId = req.user.tenantId;
    await this.canvaService.disconnect(tenantId);
    return { success: true };
  }

  /**
   * GET /integrations/canva/designs
   * List user's Canva designs
   */
  @UseGuards(JwtAuthGuard)
  @Get('designs')
  async listDesigns(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('continuation') continuation?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.canvaService.listDesigns(tenantId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      continuation,
    });
  }

  /**
   * POST /integrations/canva/designs
   * Create a new Canva design (opens Canva editor)
   */
  @UseGuards(JwtAuthGuard)
  @Post('designs')
  async createDesign(
    @Request() req,
    @Body()
    body: {
      title: string;
      designType?: 'social_media_graphic' | 'presentation' | 'document' | 'whiteboard';
      width?: number;
      height?: number;
    },
  ) {
    const tenantId = req.user.tenantId;
    return this.canvaService.createDesign(tenantId, body);
  }

  /**
   * POST /integrations/canva/designs/:canvaId/import
   * Import a Canva design as a DesignAsset
   */
  @UseGuards(JwtAuthGuard)
  @Post('designs/:canvaId/import')
  async importDesign(@Request() req, @Param('canvaId') canvaId: string) {
    const tenantId = req.user.tenantId;
    return this.canvaService.importDesign(tenantId, canvaId);
  }
}
