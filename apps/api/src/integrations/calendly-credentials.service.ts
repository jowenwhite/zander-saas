import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendlyCredentialsService {
  private readonly logger = new Logger(CalendlyCredentialsService.name);
  private readonly CALENDLY_API_BASE = 'https://api.calendly.com';

  constructor(private prisma: PrismaService) {}

  async getCredentials(tenantId: string) {
    return this.prisma.calendlyCredential.findUnique({
      where: { tenantId },
    });
  }

  async saveCredentials(tenantId: string, apiKey: string) {
    // Validate API key by fetching current user
    try {
      const response = await fetch(`${this.CALENDLY_API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      const data = await response.json();
      const userUri = data.resource?.uri;

      this.logger.log(`Calendly credentials validated for tenant: ${tenantId}`);

      return this.prisma.calendlyCredential.upsert({
        where: { tenantId },
        update: {
          apiKey,
          userUri,
        },
        create: {
          tenantId,
          apiKey,
          userUri,
        },
      });
    } catch (error) {
      this.logger.error(`Invalid Calendly credentials: ${error.message}`);
      throw new Error('Invalid Calendly API key. Please verify your Personal Access Token.');
    }
  }

  async deleteCredentials(tenantId: string) {
    try {
      await this.prisma.calendlyCredential.delete({
        where: { tenantId },
      });
      return { success: true };
    } catch (error) {
      this.logger.warn(`No Calendly credentials to delete for tenant: ${tenantId}`);
      return { success: false, error: 'No credentials found' };
    }
  }

  async getStatus(tenantId: string) {
    const credentials = await this.getCredentials(tenantId);
    return {
      connected: !!credentials,
      connectedAt: credentials?.createdAt || null,
    };
  }

  async getScheduledEvents(tenantId: string, options?: { minStartTime?: string; maxStartTime?: string; count?: number }) {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials) {
      throw new Error('Calendly not connected');
    }

    const params = new URLSearchParams({
      user: credentials.userUri || '',
      count: String(options?.count || 20),
    });

    if (options?.minStartTime) {
      params.append('min_start_time', options.minStartTime);
    }
    if (options?.maxStartTime) {
      params.append('max_start_time', options.maxStartTime);
    }

    const response = await fetch(`${this.CALENDLY_API_BASE}/scheduled_events?${params}`, {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Calendly events');
    }

    const data = await response.json();
    return data.collection || [];
  }

  async getEventTypes(tenantId: string) {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials) {
      throw new Error('Calendly not connected');
    }

    const response = await fetch(`${this.CALENDLY_API_BASE}/event_types?user=${credentials.userUri}`, {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Calendly event types');
    }

    const data = await response.json();
    return data.collection || [];
  }

  async createSchedulingLink(tenantId: string, eventTypeUri: string) {
    const credentials = await this.getCredentials(tenantId);
    if (!credentials) {
      throw new Error('Calendly not connected');
    }

    const response = await fetch(`${this.CALENDLY_API_BASE}/scheduling_links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_event_count: 1,
        owner: eventTypeUri,
        owner_type: 'EventType',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Calendly scheduling link');
    }

    const data = await response.json();
    return data.resource;
  }
}
