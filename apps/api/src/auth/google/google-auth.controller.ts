import { Controller, Get, Req, Res, UseGuards, Query, Request, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { GoogleAuthService } from './google-auth.service';
import { Public } from '../jwt-auth.decorator';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('auth/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {}

  // OAuth initiation - must be public for OAuth flow
  // Security: Validates auth token from query param, generates signed state
  @Public()
  @Get()
  async googleAuth(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

    // Validate the auth token
    if (!token) {
      this.logger.error('No auth token provided for Google OAuth initiation');
      return res.redirect(`${frontendUrl}/settings?error=no_token`);
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      this.logger.error('JWT_SECRET not configured');
      return res.redirect(`${frontendUrl}/settings?error=config_error`);
    }

    // Verify the user's auth token
    let userId: string;
    let tenantId: string;
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      userId = decoded.sub;
      tenantId = decoded.tenantId;

      if (!userId || !tenantId) {
        throw new Error('Token missing required claims');
      }
    } catch (error) {
      this.logger.error(`Invalid auth token for Google OAuth: ${error.message}`);
      return res.redirect(`${frontendUrl}/settings?error=invalid_token`);
    }

    // Generate a short-lived signed state token (10 minutes)
    const stateToken = jwt.sign(
      {
        userId,
        tenantId,
        purpose: 'google-oauth'
      },
      jwtSecret,
      { expiresIn: '10m' }
    );

    // Manually construct the Google OAuth URL with signed state parameter
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

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${encodeURIComponent(stateToken)}`;

    this.logger.log(`Redirecting to Google OAuth for user: ${userId}, tenant: ${tenantId}`);
    return res.redirect(authUrl);
  }

  // OAuth callback - must be public for Google to redirect here
  // Security: Validates signed state token before saving credentials
  @Public()
  @Get('callback')
  async googleAuthCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

    try {
      this.logger.log(`Google callback received - code: ${code ? 'present' : 'missing'}, state: ${state ? 'present' : 'missing'}`);

      if (!state) {
        this.logger.error('No state parameter in callback');
        return res.redirect(`${frontendUrl}/settings?error=invalid_state`);
      }

      if (!code) {
        this.logger.error('No code parameter in callback');
        return res.redirect(`${frontendUrl}/settings?error=no_code`);
      }

      // Verify and decode the state token
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        this.logger.error('JWT_SECRET not configured');
        return res.redirect(`${frontendUrl}/settings?error=config_error`);
      }

      let userId: string;
      let tenantId: string;
      try {
        const decoded = jwt.verify(state, jwtSecret) as any;

        // Validate the purpose claim to prevent token reuse
        if (decoded.purpose !== 'google-oauth') {
          throw new Error('Invalid state token purpose');
        }

        userId = decoded.userId;
        tenantId = decoded.tenantId;

        if (!userId || !tenantId) {
          throw new Error('State token missing required claims');
        }
      } catch (error) {
        this.logger.error(`Invalid state token: ${error.message}`);
        return res.redirect(`${frontendUrl}/settings?error=invalid_state`);
      }

      // Exchange code for tokens
      const tokens = await this.googleAuthService.exchangeCodeForTokens(code);

      this.logger.log(`Tokens received for user: ${userId}, tenant: ${tenantId}`);

      // Save tokens to database with tenant scoping
      await this.googleAuthService.saveTokens(userId, tenantId, {
        email: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      this.logger.log(`Tokens saved for user: ${userId}, tenant: ${tenantId}`);

      // Redirect to frontend with success
      return res.redirect(`${frontendUrl}/settings?google=connected`);
    } catch (error) {
      this.logger.error(`Google callback error: ${error.message}`);
      return res.redirect(`${frontendUrl}/settings?error=auth_failed`);
    }
  }

  // SECURED: Requires authentication - users can only check their own status
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req) {
    const userId = req.user.sub;
    const token = await this.googleAuthService.getTokenByUserId(userId);
    return {
      connected: !!token,
      email: token?.email || null,
    };
  }

  // SECURED: Requires authentication - users can only disconnect their own integration
  @UseGuards(JwtAuthGuard)
  @Get('disconnect')
  async disconnect(@Request() req) {
    const userId = req.user.sub;
    try {
      await this.googleAuthService.deleteTokens(userId);
      return { success: true, message: 'Google account disconnected' };
    } catch (error) {
      this.logger.error(`Failed to disconnect Google for user ${userId}: ${error.message}`);
      throw error;
    }
  }
}
