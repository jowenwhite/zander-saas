import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MicrosoftOAuthService } from './microsoft-oauth.service';

const GRAPH = 'https://graph.microsoft.com/v1.0';

export interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  body: { contentType: string; content: string };
  from: { emailAddress: { address: string; name: string } };
  toRecipients: { emailAddress: { address: string; name: string } }[];
  receivedDateTime: string;
  sentDateTime: string;
  conversationId: string;
  isRead: boolean;
}

export interface GraphEvent {
  id: string;
  subject: string;
  body: { contentType: string; content: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location: { displayName: string };
  attendees: { emailAddress: { address: string; name: string }; type: string }[];
  onlineMeeting: { joinUrl: string } | null;
  webLink: string;
}

@Injectable()
export class MicrosoftGraphService {
  private readonly logger = new Logger(MicrosoftGraphService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly microsoftOAuthService: MicrosoftOAuthService,
  ) {}

  // ─── Internal helpers ───────────────────────────────────────────────────────

  private async fetch<T>(tenantId: string, path: string, options: RequestInit = {}): Promise<T> {
    const accessToken = await this.microsoftOAuthService.getValidAccessToken(tenantId);

    const res = await fetch(`${GRAPH}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      // Token may have just expired — force refresh by invalidating cached expiry
      await this.prisma.integrationConnection.updateMany({
        where: { tenantId, provider: 'microsoft' },
        data: { expiresAt: new Date(0) },
      });
      const freshToken = await this.microsoftOAuthService.getValidAccessToken(tenantId);
      const retryRes = await fetch(`${GRAPH}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${freshToken}`,
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      if (!retryRes.ok) {
        const err = await retryRes.text();
        throw new Error(`Graph API error after token refresh: ${err}`);
      }
      return retryRes.json() as Promise<T>;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Graph API error ${res.status}: ${err}`);
    }

    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
  }

  // ─── Mail ────────────────────────────────────────────────────────────────────

  async listInbox(tenantId: string, limit = 50): Promise<GraphMessage[]> {
    const data = await this.fetch<{ value: GraphMessage[] }>(
      tenantId,
      `/me/mailFolders/inbox/messages?$top=${limit}&$orderby=receivedDateTime desc`,
    );
    return data.value;
  }

  async getMessage(tenantId: string, messageId: string): Promise<GraphMessage> {
    return this.fetch<GraphMessage>(tenantId, `/me/messages/${messageId}`);
  }

  async sendEmail(
    tenantId: string,
    email: {
      to: string[];
      cc?: string[];
      subject: string;
      body: string;
      isHtml?: boolean;
    },
  ): Promise<{ success: boolean }> {
    await this.fetch(tenantId, '/me/sendMail', {
      method: 'POST',
      body: JSON.stringify({
        message: {
          subject: email.subject,
          body: { contentType: email.isHtml ? 'HTML' : 'Text', content: email.body },
          toRecipients: email.to.map((addr) => ({ emailAddress: { address: addr } })),
          ccRecipients: (email.cc || []).map((addr) => ({ emailAddress: { address: addr } })),
        },
      }),
    });
    return { success: true };
  }

  async searchMessages(tenantId: string, query: string, limit = 20): Promise<GraphMessage[]> {
    const encoded = encodeURIComponent(query);
    const data = await this.fetch<{ value: GraphMessage[] }>(
      tenantId,
      `/me/messages?$search="${encoded}"&$top=${limit}`,
    );
    return data.value;
  }

  // ─── Sync Outlook inbox into Zander EmailMessage table ──────────────────────

  async syncInbox(tenantId: string, maxResults = 50): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;

    const connection = await this.prisma.integrationConnection.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'microsoft' } },
    });

    if (!connection || connection.status !== 'active') {
      throw new Error('Microsoft Outlook not connected for this tenant');
    }

    const meta = connection.metadata as { email?: string } | null;
    const outlookAddress = (meta?.email || '').toLowerCase();

    const messages = await this.listInbox(tenantId, maxResults);
    this.logger.log(`Found ${messages.length} Outlook messages for tenant ${tenantId}`);

    for (const msg of messages) {
      try {
        const existing = await this.prisma.emailMessage.findFirst({
          where: { messageId: msg.id },
        });
        if (existing) continue;

        const fromAddress = msg.from?.emailAddress?.address || '';
        const toAddresses = msg.toRecipients?.map((r) => r.emailAddress?.address).filter(Boolean) || [];
        const toAddress = toAddresses.join(', ');
        const isOutbound = fromAddress.toLowerCase() === outlookAddress;
        const contactEmail = isOutbound ? toAddresses[0] : fromAddress;

        const contact = contactEmail
          ? await this.prisma.contact.findFirst({
              where: {
                tenantId,
                email: { equals: contactEmail, mode: 'insensitive' },
              },
            })
          : null;

        const activeDeal = contact
          ? await this.prisma.deal.findFirst({
              where: { contactId: contact.id, status: { notIn: ['won', 'lost'] } },
              orderBy: { updatedAt: 'desc' },
            })
          : null;

        await this.prisma.emailMessage.create({
          data: {
            tenantId,
            contactId: contact?.id || null,
            dealId: activeDeal?.id || null,
            direction: isOutbound ? 'outbound' : 'inbound',
            fromAddress,
            toAddress,
            subject: msg.subject || '(No Subject)',
            body: msg.bodyPreview || '',
            htmlBody: msg.body?.contentType === 'html' ? msg.body?.content : null,
            messageId: msg.id,
            inReplyTo: msg.conversationId || null,
            threadId: msg.conversationId || null,
            status: isOutbound ? 'sent' : 'received',
            sentAt: new Date(msg.receivedDateTime || msg.sentDateTime || Date.now()),
          },
        });
        synced++;
      } catch (err) {
        this.logger.error(`Error syncing Outlook message ${msg.id}: ${err.message}`);
        errors++;
      }
    }

    this.logger.log(`Outlook sync complete for tenant ${tenantId}: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  }

  // ─── Calendar ────────────────────────────────────────────────────────────────

  async listEvents(
    tenantId: string,
    options: { startDate?: string; endDate?: string; limit?: number } = {},
  ): Promise<GraphEvent[]> {
    const limit = options.limit || 50;
    let url = `/me/events?$top=${limit}&$orderby=start/dateTime`;

    if (options.startDate && options.endDate) {
      url += `&$filter=start/dateTime ge '${options.startDate}' and end/dateTime le '${options.endDate}'`;
    }

    const data = await this.fetch<{ value: GraphEvent[] }>(tenantId, url);
    return data.value;
  }

  async createEvent(
    tenantId: string,
    event: {
      subject: string;
      body?: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
      location?: string;
      attendees?: string[];
      isOnlineMeeting?: boolean;
    },
  ): Promise<GraphEvent> {
    return this.fetch<GraphEvent>(tenantId, '/me/events', {
      method: 'POST',
      body: JSON.stringify({
        subject: event.subject,
        body: event.body ? { contentType: 'Text', content: event.body } : undefined,
        start: event.start,
        end: event.end,
        location: event.location ? { displayName: event.location } : undefined,
        attendees: (event.attendees || []).map((addr) => ({
          emailAddress: { address: addr },
          type: 'required',
        })),
        isOnlineMeeting: event.isOnlineMeeting ?? false,
      }),
    });
  }

  async updateEvent(
    tenantId: string,
    eventId: string,
    updates: Partial<{ subject: string; body: string; start: object; end: object; location: string }>,
  ): Promise<GraphEvent> {
    return this.fetch<GraphEvent>(tenantId, `/me/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(tenantId: string, eventId: string): Promise<void> {
    await this.fetch<null>(tenantId, `/me/events/${eventId}`, { method: 'DELETE' });
  }

  // ─── Utility ─────────────────────────────────────────────────────────────────

  async isConnected(tenantId: string): Promise<boolean> {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: { tenantId_provider: { tenantId, provider: 'microsoft' } },
    });
    return !!connection && connection.status === 'active';
  }
}
