import { Controller, Get, Req, Res, UseGuards, Query, Logger } from '@nestjs/common';
import { Response } from 'express';
import { GoogleAuthService } from './google-auth.service';
import { Public } from '../jwt-auth.decorator';

@Controller('auth/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Public()
  @Get()
  async googleAuth(@Query('state') state: string, @Res() res: Response) {
    // Manually construct the Google OAuth URL with state parameter
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback');
    const scope = encodeURIComponent([
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/contacts.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ].join(' '));
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
    
    this.logger.log(`Redirecting to Google OAuth with state: ${state}`);
    return res.redirect(authUrl);
  }

  @Public()
  @Get('callback')
  async googleAuthCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      this.logger.log(`Google callback received - code: ${code ? 'present' : 'missing'}, state: ${state}`);

      if (!state) {
        this.logger.error('No state parameter in callback');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?error=no_user`);
      }

      if (!code) {
        this.logger.error('No code parameter in callback');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?error=no_code`);
      }

      // Exchange code for tokens
      const tokens = await this.googleAuthService.exchangeCodeForTokens(code);
      
      this.logger.log(`Tokens received for state/userId: ${state}`);

      // Save tokens to database
      await this.googleAuthService.saveTokens(state, {
        email: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      this.logger.log(`Tokens saved for user: ${state}`);

      // Redirect to frontend with success
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?google=connected`);
    } catch (error) {
      this.logger.error(`Google callback error: ${error.message}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?error=auth_failed`);
    }
  }

  @Public()
  @Get('status')
  async getStatus(@Query('userId') userId: string) {
    if (!userId) {
      return { connected: false };
    }
    const token = await this.googleAuthService.getTokenByUserId(userId);
    return {
      connected: !!token,
      email: token?.email || null,
    };
  }

  @Public()
  @Get('disconnect')
  async disconnect(@Query('userId') userId: string, @Res() res: Response) {
    if (userId) {
      await this.googleAuthService.deleteTokens(userId);
    }
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings?google=disconnected`);
  }
}
