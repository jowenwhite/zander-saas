import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CalendarEventsService {
  constructor(private prisma: PrismaService) {}

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

  async updateAttendeeResponse(eventId: string, attendeeId: string, responseStatus: string) {
    return this.prisma.eventAttendee.update({
      where: { id: attendeeId },
      data: {
        responseStatus,
        respondedAt: new Date(),
      },
    });
  }

  async updateAttendeeRecordingConsent(eventId: string, attendeeId: string, consented: boolean) {
    return this.prisma.eventAttendee.update({
      where: { id: attendeeId },
      data: {
        recordingConsentStatus: consented ? 'consented' : 'declined',
        recordingConsentAt: new Date(),
      },
    });
  }

  async removeAttendee(eventId: string, attendeeId: string) {
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

}