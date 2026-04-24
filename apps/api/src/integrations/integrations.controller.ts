import { Controller, Get, Post, Delete, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TwilioCredentialsService } from './twilio-credentials.service';
import { CalendlyCredentialsService } from './calendly-credentials.service';
import { SaveTwilioCredentialsDto } from './dto/save-twilio-credentials.dto';
import { SaveCalendlyCredentialsDto } from './dto/save-calendly-credentials.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(
    private readonly twilioService: TwilioCredentialsService,
    private readonly calendlyService: CalendlyCredentialsService,
    private readonly prisma: PrismaService,
  ) {}

  // ==================== ALL INTEGRATIONS ====================

  /**
   * GET /integrations/all
   * Returns the status of all marketing platform integrations for a tenant
   */
  @Get('all')
  async getAllIntegrations(@Request() req) {
    const tenantId = req.user.tenantId;

    // Define all supported integrations
    const platforms = [
      {
        provider: 'google-analytics',
        name: 'Google Analytics',
        description: 'Track website traffic, user behavior, and conversions',
        icon: 'analytics',
        category: 'analytics',
        connectPath: '/integrations/google-analytics/connect',
        disconnectPath: '/integrations/google-analytics/disconnect',
      },
      {
        provider: 'meta',
        name: 'Meta (Facebook & Instagram)',
        description: 'Connect Facebook Pages and Instagram for social publishing',
        icon: 'meta',
        category: 'social',
        connectPath: '/integrations/meta/connect',
        disconnectPath: '/integrations/meta/disconnect',
      },
      {
        provider: 'linkedin',
        name: 'LinkedIn',
        description: 'Publish posts to your LinkedIn company page',
        icon: 'linkedin',
        category: 'social',
        comingSoon: true,
      },
      {
        provider: 'twitter',
        name: 'Twitter/X',
        description: 'Share updates and engage with your X audience',
        icon: 'twitter',
        category: 'social',
        comingSoon: true,
      },
      {
        provider: 'canva',
        name: 'Canva',
        description: 'Import designs and graphics for your marketing',
        icon: 'canva',
        category: 'design',
        connectPath: '/integrations/canva/connect',
        disconnectPath: '/integrations/canva/disconnect',
      },
      {
        provider: 'resend',
        name: 'Resend',
        description: 'Send transactional and marketing emails with analytics',
        icon: 'resend',
        category: 'email',
        isSystemManaged: true, // Configured at system level, not per-tenant OAuth
      },
    ];

    // Fetch existing connections for this tenant
    const connections = await this.prisma.integrationConnection.findMany({
      where: { tenantId },
      select: {
        provider: true,
        status: true,
        connectedAt: true,
        updatedAt: true,
        metadata: true,
      },
    });

    // Build connection map
    const connectionMap = new Map(
      connections.map((c) => [c.provider, c]),
    );

    // Merge platform definitions with actual connection status
    const integrations = platforms.map((platform) => {
      const connection = connectionMap.get(platform.provider);

      if (platform.comingSoon) {
        return {
          ...platform,
          connected: false,
          status: 'coming_soon',
        };
      }

      if (platform.isSystemManaged) {
        // Resend is always "connected" at system level
        return {
          ...platform,
          connected: true,
          status: 'active',
          connectedAt: null,
          metadata: { note: 'System-managed integration' },
        };
      }

      if (!connection) {
        return {
          ...platform,
          connected: false,
          status: 'disconnected',
        };
      }

      return {
        ...platform,
        connected: connection.status === 'active',
        status: connection.status,
        connectedAt: connection.connectedAt,
        updatedAt: connection.updatedAt,
        metadata: connection.metadata,
      };
    });

    return {
      integrations,
      summary: {
        total: platforms.length,
        connected: integrations.filter((i) => i.connected).length,
        comingSoon: integrations.filter((i) => i.status === 'coming_soon').length,
      },
    };
  }

  // ==================== TWILIO ====================

  @Get('twilio/status')
  async getTwilioStatus(@Request() req) {
    return this.twilioService.getStatus(req.user.tenantId);
  }

  @Post('twilio/connect')
  async connectTwilio(@Request() req, @Body() body: SaveTwilioCredentialsDto) {
    try {
      await this.twilioService.saveCredentials(req.user.tenantId, {
        accountSid: body.accountSid,
        authToken: body.authToken,
        phoneNumber: body.phoneNumber,
      });
      return { success: true, message: 'Twilio connected successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete('twilio/disconnect')
  async disconnectTwilio(@Request() req) {
    return this.twilioService.deleteCredentials(req.user.tenantId);
  }

  // ==================== CALENDLY ====================

  @Get('calendly/status')
  async getCalendlyStatus(@Request() req) {
    return this.calendlyService.getStatus(req.user.tenantId);
  }

  @Post('calendly/connect')
  async connectCalendly(@Request() req, @Body() body: SaveCalendlyCredentialsDto) {
    try {
      await this.calendlyService.saveCredentials(req.user.tenantId, body.apiKey);
      return { success: true, message: 'Calendly connected successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete('calendly/disconnect')
  async disconnectCalendly(@Request() req) {
    return this.calendlyService.deleteCredentials(req.user.tenantId);
  }

  @Get('calendly/events')
  async getCalendlyEvents(@Request() req) {
    try {
      const events = await this.calendlyService.getScheduledEvents(req.user.tenantId);
      return { success: true, events };
    } catch (error) {
      return { success: false, error: error.message, events: [] };
    }
  }

  @Get('calendly/event-types')
  async getCalendlyEventTypes(@Request() req) {
    try {
      const eventTypes = await this.calendlyService.getEventTypes(req.user.tenantId);
      return { success: true, eventTypes };
    } catch (error) {
      return { success: false, error: error.message, eventTypes: [] };
    }
  }
}
