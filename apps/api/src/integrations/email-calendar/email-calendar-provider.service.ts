import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GmailService } from '../../auth/google/gmail.service';
import { GoogleAuthService } from '../../auth/google/google-auth.service';
import { MicrosoftGraphService } from '../microsoft/microsoft-graph.service';

export type EmailProvider = 'microsoft' | 'google' | null;

@Injectable()
export class EmailCalendarProviderService {
  private readonly logger = new Logger(EmailCalendarProviderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gmailService: GmailService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly microsoftGraphService: MicrosoftGraphService,
  ) {}

  /**
   * Returns the active email/calendar provider for a tenant.
   * Microsoft IntegrationConnection takes priority.
   * Falls back to checking if the user has a GoogleToken.
   */
  async getActiveProvider(tenantId: string, userId: string): Promise<EmailProvider> {
    const msConnection = await this.prisma.integrationConnection.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'microsoft' } },
    });

    if (msConnection?.status === 'active') {
      return 'microsoft';
    }

    const googleToken = await this.googleAuthService.getTokenByUserId(userId);
    if (googleToken) {
      return 'google';
    }

    return null;
  }

  /**
   * Returns the connected email address for the active provider, or null.
   */
  async getConnectedEmail(tenantId: string, userId: string): Promise<string | null> {
    const provider = await this.getActiveProvider(tenantId, userId);

    if (provider === 'microsoft') {
      const connection = await this.prisma.integrationConnection.findUnique({
        where: { tenantId_provider: { tenantId, provider: 'microsoft' } },
      });
      const meta = connection?.metadata as { email?: string } | null;
      return meta?.email || null;
    }

    if (provider === 'google') {
      const token = await this.googleAuthService.getTokenByUserId(userId);
      return token?.email || null;
    }

    return null;
  }

  /**
   * Sync inbox for the tenant — routes to the correct provider automatically.
   * Returns { synced, errors, provider } so callers can log which provider was used.
   */
  async syncInbox(
    userId: string,
    tenantId: string,
    maxResults = 50,
  ): Promise<{ synced: number; errors: number; provider: EmailProvider }> {
    const provider = await this.getActiveProvider(tenantId, userId);

    if (provider === 'microsoft') {
      this.logger.log(`Syncing inbox via Microsoft Graph for tenant: ${tenantId}`);
      const result = await this.microsoftGraphService.syncInbox(tenantId, maxResults);
      return { ...result, provider: 'microsoft' };
    }

    if (provider === 'google') {
      this.logger.log(`Syncing inbox via Gmail for user: ${userId}`);
      const result = await this.gmailService.syncEmails(userId, maxResults);
      return { ...result, provider: 'google' };
    }

    this.logger.log(`No email provider connected for tenant: ${tenantId}`);
    return { synced: 0, errors: 0, provider: null };
  }

  /**
   * Sync a calendar event to the active provider's external calendar.
   * Called after creating an internal Zander CalendarEvent.
   */
  async syncCalendarEvent(
    userId: string,
    tenantId: string,
    event: {
      title: string;
      description?: string;
      location?: string;
      startTime: Date;
      endTime: Date;
      attendees?: string[];
      timeZone?: string;
    },
  ): Promise<{ externalEventId: string | null; meetingUrl: string | null; platform: string | null }> {
    const provider = await this.getActiveProvider(tenantId, userId);
    const tz = event.timeZone || 'UTC';

    if (provider === 'microsoft') {
      try {
        const graphEvent = await this.microsoftGraphService.createEvent(tenantId, {
          subject: event.title,
          body: event.description,
          start: { dateTime: event.startTime.toISOString(), timeZone: tz },
          end: { dateTime: event.endTime.toISOString(), timeZone: tz },
          location: event.location,
          attendees: event.attendees,
          isOnlineMeeting: true,
        });

        return {
          externalEventId: graphEvent.id,
          meetingUrl: graphEvent.onlineMeeting?.joinUrl || null,
          platform: graphEvent.onlineMeeting?.joinUrl ? 'Microsoft Teams' : null,
        };
      } catch (err) {
        this.logger.error(`Failed to sync event to Outlook Calendar: ${err.message}`);
        return { externalEventId: null, meetingUrl: null, platform: null };
      }
    }

    // Google Calendar sync is handled directly inside CalendarEventsService — no-op here
    return { externalEventId: null, meetingUrl: null, platform: null };
  }
}
