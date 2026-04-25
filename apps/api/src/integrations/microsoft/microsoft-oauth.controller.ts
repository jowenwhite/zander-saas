import { Controller, Get, Delete, Query, Request, Res, UseGuards, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/jwt-auth.decorator';
import { MicrosoftOAuthService } from './microsoft-oauth.service';

@Controller('integrations/microsoft')
export class MicrosoftOAuthController {
  private readonly logger = new Logger(MicrosoftOAuthController.name);

  constructor(
    private readonly microsoftOAuthService: MicrosoftOAuthService,
    private readonly config: ConfigService,
  ) {}

  /**
   * GET /integrations/microsoft/auth
   * Initiates Microsoft OAuth — validates user JWT, then redirects to Microsoft consent screen.
   * Same security pattern as Google auth controller.
   */
  @Public()
  @Get('auth')
  async initiateOAuth(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

    if (!token) {
      this.logger.error('No auth token provided for Microsoft OAuth initiation');
      return res.redirect(`${frontendUrl}/settings/integrations?error=no_token`);
    }

    const jwtSecret = this.config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      this.logger.error('JWT_SECRET not configured');
      return res.redirect(`${frontendUrl}/settings/integrations?error=config_error`);
    }

    let userId: string;
    let tenantId: string;
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      userId = decoded.sub;
      tenantId = decoded.tenantId;
      if (!userId || !tenantId) throw new Error('Token missing required claims');
    } catch (error) {
      this.logger.error(`Invalid auth token for Microsoft OAuth: ${error.message}`);
      return res.redirect(`${frontendUrl}/settings/integrations?error=invalid_token`);
    }

    const authUrl = this.microsoftOAuthService.getAuthUrl(userId, tenantId);
    this.logger.log(`Redirecting to Microsoft OAuth for user: ${userId}, tenant: ${tenantId}`);
    return res.redirect(authUrl);
  }

  /**
   * GET /integrations/microsoft/callback
   * Handles OAuth callback from Microsoft. Verifies JWT state, exchanges code, saves connection.
   */
  @Public()
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') oauthError: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

    if (oauthError) {
      this.logger.error(`Microsoft OAuth error: ${oauthError}`);
      return res.redirect(`${frontendUrl}/settings/integrations?error=${encodeURIComponent(oauthError)}`);
    }

    if (!code || !state) {
      this.logger.error('Missing code or state in Microsoft callback');
      return res.redirect(`${frontendUrl}/settings/integrations?error=missing_params`);
    }

    try {
      const { userId, tenantId } = this.microsoftOAuthService.decodeState(state);
      this.logger.log(`Microsoft callback for user: ${userId}, tenant: ${tenantId}`);

      const tokens = await this.microsoftOAuthService.exchangeCodeForTokens(code);
      await this.microsoftOAuthService.saveConnection(tenantId, userId, tokens);

      this.logger.log(`Microsoft connected for tenant: ${tenantId} (${tokens.email})`);
      return res.redirect(`${frontendUrl}/settings/integrations?microsoft=connected`);
    } catch (error) {
      this.logger.error(`Microsoft callback failed: ${error.message}`);
      return res.redirect(`${frontendUrl}/settings/integrations?error=auth_failed`);
    }
  }

  /**
   * GET /integrations/microsoft/status
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.microsoftOAuthService.getStatus(tenantId);
  }

  /**
   * DELETE /integrations/microsoft/disconnect
   */
  @UseGuards(JwtAuthGuard)
  @Delete('disconnect')
  async disconnect(@Request() req) {
    const tenantId = req.user.tenantId;
    await this.microsoftOAuthService.disconnect(tenantId);
    return { success: true };
  }
}
