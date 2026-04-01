import { Controller, Get, Post, Delete, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TierGuard } from '../common/guards/tier.guard';
import { RequireTier } from '../common/decorators/require-tier.decorator';
import { TwilioCredentialsService } from './twilio-credentials.service';
import { CalendlyCredentialsService } from './calendly-credentials.service';
import { SaveTwilioCredentialsDto } from './dto/save-twilio-credentials.dto';
import { SaveCalendlyCredentialsDto } from './dto/save-calendly-credentials.dto';

@Controller('integrations')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('STARTER')
export class IntegrationsController {
  constructor(
    private readonly twilioService: TwilioCredentialsService,
    private readonly calendlyService: CalendlyCredentialsService,
  ) {}

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
