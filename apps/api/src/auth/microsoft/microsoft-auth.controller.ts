import { Controller, Get, Res, Query, Logger } from '@nestjs/common';
import { Response } from 'express';
import { MicrosoftAuthService } from './microsoft-auth.service';
import { Public } from '../jwt-auth.decorator';

@Controller('auth/microsoft')
export class MicrosoftAuthController {
  private readonly logger = new Logger(MicrosoftAuthController.name);

  constructor(private readonly microsoftAuthService: MicrosoftAuthService) {}

  @Public()
  @Get()
  async microsoftAuth(@Query('state') state: string, @Res() res: Response) {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3001/auth/microsoft/callback'
    );
    const scope = encodeURIComponent([
      'User.Read',
      'openid',
      'profile',
      'email',
      'offline_access',
      'Mail.Read',
      'Mail.Send',
      'Mail.ReadWrite',
      'Calendars.ReadWrite',
      'Contacts.Read',
    ].join(' '));

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;

    this.logger.log(`Redirecting to Microsoft OAuth with state: ${state}`);
    return res.redirect(authUrl);
  }

  @Public()
  @Get('callback')
  async microsoftAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response
  ) {
    try {
      this.logger.log(`Microsoft callback received - code: ${code ? 'present' : 'missing'}, state: ${state}`);

      if (!state) {
        this.logger.error('No state parameter in callback');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?error=no_user`);
      }

      if (!code) {
        this.logger.error('No code parameter in callback');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?error=no_code`);
      }

      // Exchange code for tokens
      const tokens = await this.microsoftAuthService.exchangeCodeForTokens(code);
      this.logger.log(`Tokens received for state/userId: ${state}`);

      // Save tokens to database
      await this.microsoftAuthService.saveTokens(state, {
        email: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      this.logger.log(`Microsoft tokens saved for user: ${state}`);

      // Redirect to frontend with success
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?microsoft=connected`);
    } catch (error) {
      this.logger.error(`Microsoft callback error: ${error.message}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?error=auth_failed`);
    }
  }

  @Public()
  @Get('status')
  async getStatus(@Query('userId') userId: string) {
    if (!userId) {
      return { connected: false };
    }
    const token = await this.microsoftAuthService.getTokenByUserId(userId);
    return {
      connected: !!token,
      email: token?.email || null,
    };
  }

  @Public()
  @Get('disconnect')
  async disconnect(@Query('userId') userId: string, @Res() res: Response) {
    if (userId) {
      await this.microsoftAuthService.deleteTokens(userId);
    }
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?microsoft=disconnected`);
  }
}
