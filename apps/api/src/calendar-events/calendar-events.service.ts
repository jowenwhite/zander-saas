import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthService } from '../auth/google/google-auth.service';
import { MicrosoftGraphService } from '../integrations/microsoft/microsoft-graph.service';

@Injectable()
export class CalendarEventsService {
  private readonly logger = new Logger(CalendarEventsService.name);

  constructor(
    private prisma: PrismaService,
    private googleAuthService: GoogleAuthService,
    private microsoftGraphService: MicrosoftGraphService,
  ) {}

  async create(tenantId: string, createdById: string, data: {
    title: string;
    description?: string;
    location?: string;
    meetingUrl?: string;
    meetingPlatform?: string;
    startTime: Date;
    endTime: Date;
    allDay?: boolean;
    timezone?: string;
    eventType?: string;
    category?: string;
    priority?: string;
    color?: string;
    willBeRecorded?: boolean;
    contactId?: string;
    dealId?: string;
    agenda?: string;
    attachments?: any;
    prepNotes?: string;
    attachedItems?: any;
    status?: string;
    attendees?: { userId?: string; contactId?: string; email?: string; name?: string }[];
    reminders?: { type: string; timing: number }[];
  }) {
    const { attendees, reminders, ...eventData } = data;

    const event = await this.prisma.calendarEvent.create({
      data: {
        tenant: { connect: { id: tenantId } },
        createdBy: { connect: { id: createdById } },
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        meetingUrl: eventData.meetingUrl,
        meetingPlatform: eventData.meetingPlatform,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        allDay: eventData.allDay,
        timezone: eventData.timezone,
        eventType: eventData.eventType,
        category: eventData.category,
        priority: eventData.priority,
        color: eventData.color,
        willBeRecorded: eventData.willBeRecorded,
        recordingConsentStatus: eventData.willBeRecorded ? 'pending' : null,
        agenda: eventData.agenda,
        attachments: eventData.attachments,
        prepNotes: eventData.prepNotes,
        attachedItems: eventData.attachedItems,
        status: eventData.status,
        contact: eventData.contactId ? { connect: { id: eventData.contactId } } : undefined,
      },
      include: {
        contact: true,
        createdBy: true,
      },
    });

    // Create attendees if provided
    if (attendees && attendees.length > 0) {
      await this.prisma.eventAttendee.createMany({
        data: attendees.map(a => ({
          eventId: event.id,
          userId: a.userId,
          contactId: a.contactId,
          email: a.email,
          name: a.name,
          recordingConsentStatus: data.willBeRecorded ? 'pending' : null,
        })),
      });
    }

    // Create reminders if provided
    if (reminders && reminders.length > 0) {
      await this.prisma.eventReminder.createMany({
        data: reminders.map(r => ({
          eventId: event.id,
          type: r.type,
          timing: r.timing,
        })),
      });
    }

    // Sync to Google Calendar if user has connected Google
    try {
      const googleToken = await this.googleAuthService.getTokenByUserId(createdById);
      if (googleToken) {
        const calendar = await this.googleAuthService.getCalendarClient(createdById);

        const googleEvent = await calendar.events.insert({
          calendarId: 'primary',
          conferenceDataVersion: 1,
          requestBody: {
            summary: eventData.title,
            description: eventData.description || '',
            start: {
              dateTime: eventData.startTime.toISOString(),
              timeZone: eventData.timezone || 'America/New_York',
            },
            end: {
              dateTime: eventData.endTime.toISOString(),
              timeZone: eventData.timezone || 'America/New_York',
            },
            conferenceData: {
              createRequest: {
                requestId: event.id,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            },
          },
        });

        // Update internal record with Google Calendar data
        const hangoutLink = googleEvent.data.hangoutLink;
        await this.prisma.calendarEvent.update({
          where: { id: event.id },
          data: {
            externalEventId: googleEvent.data.id,
            externalCalendar: 'google',
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            meetingUrl: hangoutLink || null,
            meetingPlatform: hangoutLink ? 'Google Meet' : null,
          },
        });

        this.logger.log(`Event ${event.id} synced to Google Calendar: ${googleEvent.data.id}`);
      }
    } catch (error) {
      // Google Calendar sync failed - update status but don't fail the create
      this.logger.error(`Failed to sync event ${event.id} to Google Calendar: ${error.message}`);
      await this.prisma.calendarEvent.update({
        where: { id: event.id },
        data: { syncStatus: 'failed' },
      });
    }

    // Sync to Outlook Calendar if tenant has Microsoft connected (only if Google not already synced)
    try {
      const isMicrosoftConnected = await this.microsoftGraphService.isConnected(tenantId);
      const googleToken = await this.googleAuthService.getTokenByUserId(createdById);

      if (isMicrosoftConnected && !googleToken) {
        const tz = eventData.timezone || 'America/New_York';
        const attendeeEmails = attendees?.map((a) => a.email).filter(Boolean) || [];

        const graphEvent = await this.microsoftGraphService.createEvent(tenantId, {
          subject: eventData.title,
          body: eventData.description,
          start: { dateTime: eventData.startTime.toISOString(), timeZone: tz },
          end: { dateTime: eventData.endTime.toISOString(), timeZone: tz },
          location: eventData.location,
          attendees: attendeeEmails,
          isOnlineMeeting: true,
        });

        await this.prisma.calendarEvent.update({
          where: { id: event.id },
          data: {
            externalEventId: graphEvent.id,
            externalCalendar: 'microsoft',
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
            meetingUrl: graphEvent.onlineMeeting?.joinUrl || null,
            meetingPlatform: graphEvent.onlineMeeting?.joinUrl ? 'Microsoft Teams' : null,
          },
        });

        this.logger.log(`Event ${event.id} synced to Outlook Calendar: ${graphEvent.id}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync event ${event.id} to Outlook Calendar: ${error.message}`);
    }

    return this.findOne(tenantId, event.id);
  }

  async findAll(tenantId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    category?: string;
    status?: string;
    contactId?: string;
    createdById?: string;
  }) {
    const where: any = { tenantId };

    if (filters?.startDate && filters?.endDate) {
      where.startTime = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    } else if (filters?.startDate) {
      where.startTime = { gte: filters.startDate };
    } else if (filters?.endDate) {
      where.startTime = { lte: filters.endDate };
    }

    if (filters?.eventType) where.eventType = filters.eventType;
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;
    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.createdById) where.createdById = filters.createdById;

    return this.prisma.calendarEvent.findMany({
      where,
      include: {
        contact: true,
        createdBy: true,
        attendees: {
          include: {
            user: true,
            contact: true,
          },
        },
        reminders: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.calendarEvent.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        createdBy: true,
        attendees: {
          include: {
            user: true,
            contact: true,
          },
        },
        reminders: true,
      },
    });
  }

  async findByDateRange(tenantId: string, startDate: Date, endDate: Date) {
    return this.prisma.calendarEvent.findMany({
      where: {
        tenantId,
        OR: [
          {
            startTime: { gte: startDate, lte: endDate },
          },
          {
            endTime: { gte: startDate, lte: endDate },
          },
          {
            AND: [
              { startTime: { lte: startDate } },
              { endTime: { gte: endDate } },
            ],
          },
        ],
      },
      include: {
        contact: true,
        createdBy: true,
        attendees: {
          include: {
            user: true,
            contact: true,
          },
        },
        reminders: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findToday(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findByDateRange(tenantId, today, tomorrow);
  }

  async findUpcoming(tenantId: string, limit: number = 10) {
    const now = new Date();

    return this.prisma.calendarEvent.findMany({
      where: {
        tenantId,
        startTime: { gte: now },
        status: { not: 'cancelled' },
      },
      include: {
        contact: true,
        createdBy: true,
        attendees: {
          include: {
            user: true,
            contact: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
    });
  }

  async update(tenantId: string, id: string, data: {
    title?: string;
    description?: string;
    location?: string;
    meetingUrl?: string;
    meetingPlatform?: string;
    startTime?: Date;
    endTime?: Date;
    allDay?: boolean;
    eventType?: string;
    category?: string;
    priority?: string;
    color?: string;
    willBeRecorded?: boolean;
    recordingConsentStatus?: string;
    recordingConsentAt?: Date;
    recordingDisclosureSent?: boolean;
    contactId?: string;
    dealId?: string;
    agenda?: string;
    attachments?: any;
    prepNotes?: string;
    status?: string;
  }) {
    await this.prisma.calendarEvent.updateMany({
      where: { id, tenantId },
      data,
    });

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    // Attendees and reminders will cascade delete
    return this.prisma.calendarEvent.deleteMany({
      where: { id, tenantId },
    });
  }

  // Attendee management
  async addAttendee(tenantId: string, eventId: string, data: {
    userId?: string;
    contactId?: string;
    email?: string;
    name?: string;
  }) {
    const event = await this.findOne(tenantId, eventId);
    if (!event) throw new Error('Event not found');

    return this.prisma.eventAttendee.create({
      data: {
        eventId,
        ...data,
        recordingConsentStatus: event.willBeRecorded ? 'pending' : null,
      },
      include: {
        user: true,
        contact: true,
      },
    });
  }

  // SECURED: Requires tenant validation to prevent cross-tenant access
  async updateAttendeeResponse(tenantId: string, eventId: string, attendeeId: string, responseStatus: string) {
    // Verify event belongs to this tenant
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id: eventId, tenantId },
    });
    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    // Verify attendee belongs to this event and update
    const attendee = await this.prisma.eventAttendee.findFirst({
      where: { id: attendeeId, eventId: event.id },
    });
    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }

    return this.prisma.eventAttendee.update({
      where: { id: attendeeId },
      data: {
        responseStatus,
        respondedAt: new Date(),
      },
    });
  }

  // SECURED: Requires tenant validation to prevent cross-tenant access
  async updateAttendeeRecordingConsent(tenantId: string, eventId: string, attendeeId: string, consented: boolean) {
    // Verify event belongs to this tenant
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id: eventId, tenantId },
    });
    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    // Verify attendee belongs to this event and update
    const attendee = await this.prisma.eventAttendee.findFirst({
      where: { id: attendeeId, eventId: event.id },
    });
    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }

    return this.prisma.eventAttendee.update({
      where: { id: attendeeId },
      data: {
        recordingConsentStatus: consented ? 'consented' : 'declined',
        recordingConsentAt: new Date(),
      },
    });
  }

  // SECURED: Requires tenant validation to prevent cross-tenant access
  async removeAttendee(tenantId: string, eventId: string, attendeeId: string) {
    // Verify event belongs to this tenant
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id: eventId, tenantId },
    });
    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    // Verify attendee belongs to this event before deleting
    const attendee = await this.prisma.eventAttendee.findFirst({
      where: { id: attendeeId, eventId: event.id },
    });
    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }

    return this.prisma.eventAttendee.delete({
      where: { id: attendeeId },
    });
  }

  // Recording compliance helpers
  async markDisclosureSent(tenantId: string, eventId: string) {
    return this.prisma.calendarEvent.updateMany({
      where: { id: eventId, tenantId },
      data: { recordingDisclosureSent: true },
    });
  }

  async updateRecordingConsent(tenantId: string, eventId: string, status: string) {
    return this.prisma.calendarEvent.updateMany({
      where: { id: eventId, tenantId },
      data: {
        recordingConsentStatus: status,
        recordingConsentAt: status === 'obtained' ? new Date() : null,
      },
    });
  }

  // Get events needing recording disclosure
  async getEventsNeedingDisclosure(tenantId: string) {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.prisma.calendarEvent.findMany({
      where: {
        tenantId,
        willBeRecorded: true,
        recordingDisclosureSent: false,
        startTime: { gte: now, lte: in24Hours },
        status: { not: 'cancelled' },
      },
      include: {
        contact: true,
        attendees: {
          include: {
            user: true,
            contact: true,
          },
        },
      },
    });
  }

  // Multi-tenant calendar for SuperAdmin
  async findAllTenantsToday(tenantIds: string[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.calendarEvent.findMany({
      where: {
        tenantId: { in: tenantIds },
        startTime: { gte: today, lt: tomorrow },
        status: { not: 'cancelled' },
      },
      include: {
        contact: true,
        createdBy: true,
        tenant: {
          select: {
            id: true,
            companyName: true,
            subdomain: true,
          },
        },
        attendees: {
          include: {
            user: true,
            contact: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findAllTenantsRange(tenantIds: string[], startDate: Date, endDate: Date) {
    return this.prisma.calendarEvent.findMany({
      where: {
        tenantId: { in: tenantIds },
        startTime: { gte: startDate, lt: endDate },
        status: { not: 'cancelled' },
      },
      include: {
        contact: true,
        createdBy: true,
        tenant: {
          select: {
            id: true,
            companyName: true,
            subdomain: true,
          },
        },
        attendees: {
          include: {
            user: true,
            contact: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // Sync events FROM Google Calendar into Zander
  async syncFromGoogleCalendar(userId: string, tenantId: string): Promise<{ synced: number; created: number; updated: number }> {
    const googleToken = await this.googleAuthService.getTokenByUserId(userId);
    if (!googleToken) {
      throw new Error('Google Calendar not connected. Connect in Settings > Integrations.');
    }

    const calendar = await this.googleAuthService.getCalendarClient(userId);

    // Fetch upcoming events from Google Calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const googleEvents = response.data.items || [];
    let created = 0;
    let updated = 0;

    for (const gEvent of googleEvents) {
      if (!gEvent.id || !gEvent.start) continue;

      const startTime = gEvent.start.dateTime
        ? new Date(gEvent.start.dateTime)
        : new Date(gEvent.start.date || '');
      const endTime = gEvent.end?.dateTime
        ? new Date(gEvent.end.dateTime)
        : new Date(gEvent.end?.date || startTime);

      // Check if event already exists in Zander
      const existing = await this.prisma.calendarEvent.findFirst({
        where: { externalEventId: gEvent.id, tenantId },
      });

      const eventData = {
        title: gEvent.summary || 'Untitled Event',
        description: gEvent.description || null,
        location: gEvent.location || null,
        startTime,
        endTime,
        allDay: !gEvent.start.dateTime,
        timezone: gEvent.start.timeZone || 'America/New_York',
        meetingUrl: gEvent.hangoutLink || null,
        meetingPlatform: gEvent.hangoutLink ? 'Google Meet' : null,
        externalEventId: gEvent.id,
        externalCalendar: 'google',
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
        status: gEvent.status === 'cancelled' ? 'cancelled' : 'scheduled',
      };

      if (existing) {
        // Update existing event
        await this.prisma.calendarEvent.update({
          where: { id: existing.id },
          data: eventData,
        });
        updated++;
      } else {
        // Create new event
        await this.prisma.calendarEvent.create({
          data: {
            ...eventData,
            tenantId,
            createdById: userId,
            eventType: 'meeting',
          },
        });
        created++;
      }
    }

    this.logger.log(`Google Calendar sync complete: ${created} created, ${updated} updated`);
    return { synced: created + updated, created, updated };
  }

}