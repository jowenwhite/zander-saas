import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}
  async findAll(tenantId: string, query: any) {
    const { contactId, dealId, type, page = 1, limit = 50 } = query;
    const where: any = { tenantId };
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (type) where.type = type;
    const skip = (page - 1) * limit;
    const take = parseInt(limit);
    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { contact: true, deal: true, user: true }
      }),
      this.prisma.activity.count({ where })
    ]);
    return {
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }
  async findOne(id: string, tenantId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId },
      include: { contact: true, deal: true, user: true }
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }
  async create(data: any, tenantId: string, userId: string) {
    return this.prisma.activity.create({
      data: { ...data, tenantId, userId },
      include: { contact: true, deal: true, user: true }
    });
  }
  async update(id: string, data: any, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.activity.update({
      where: { id },
      data,
      include: { contact: true, deal: true, user: true }
    });
  }
  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.activity.delete({ where: { id } });
  }
  async getTimeline(tenantId: string, query: { contactId?: string; dealId?: string; limit?: number }) {
    const { contactId, dealId, limit = 50 } = query;
    
    if (!contactId && !dealId) {
      return { data: [], total: 0 };
    }

    const baseWhere: any = { tenantId };
    if (contactId) baseWhere.contactId = contactId;
    if (dealId) baseWhere.dealId = dealId;

    const [activities, emails, calls, smsMessages] = await Promise.all([
      this.prisma.activity.findMany({
        where: baseWhere,
        include: { user: true, deal: true },
        orderBy: { date: 'desc' },
        take: limit
      }),
      this.prisma.emailMessage.findMany({
        where: baseWhere,
        orderBy: { sentAt: 'desc' },
        take: limit
      }),
      this.prisma.callLog.findMany({
        where: baseWhere,
        include: { contact: true },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      this.prisma.smsMessage.findMany({
        where: baseWhere,
        orderBy: { sentAt: 'desc' },
        take: limit
      })
    ]);

    const timelineItems: any[] = [];

    activities.forEach(a => {
      timelineItems.push({
        id: a.id,
        type: a.type,
        source: 'activity',
        title: a.subject || a.type,
        description: a.description,
        date: a.date.toISOString(),
        direction: null,
        dealId: a.dealId,
        dealName: a.deal?.dealName || null,
        userId: a.userId,
        userName: a.user ? ((a.user.firstName || '') + ' ' + (a.user.lastName || '')).trim() : null
      });
    });

    emails.forEach(e => {
      timelineItems.push({
        id: e.id,
        type: 'email',
        source: 'email',
        title: e.subject,
        description: e.body ? (e.body.substring(0, 200) + (e.body.length > 200 ? '...' : '')) : '',
        date: e.sentAt.toISOString(),
        direction: e.direction,
        dealId: e.dealId,
        dealName: null,
        userId: null,
        userName: null,
        fromAddress: e.fromAddress,
        toAddress: e.toAddress,
        status: e.status
      });
    });

    calls.forEach(c => {
      timelineItems.push({
        id: c.id,
        type: 'call',
        source: 'call',
        title: c.outcome ? ('Call - ' + c.outcome) : 'Call',
        description: (c.notes || '') + (c.duration ? (' ' + Math.round(c.duration / 60) + ' min') : '') + (c.platform ? (' - ' + c.platform) : ''),
        date: (c.startedAt || c.createdAt).toISOString(),
        direction: c.direction,
        dealId: c.dealId,
        dealName: null,
        userId: c.userId,
        userName: null,
        duration: c.duration,
        outcome: c.outcome
      });
    });

    smsMessages.forEach(s => {
      timelineItems.push({
        id: s.id,
        type: 'sms',
        source: 'sms',
        title: 'Text Message',
        description: s.body ? (s.body.substring(0, 200) + (s.body.length > 200 ? '...' : '')) : '',
        date: s.sentAt.toISOString(),
        direction: s.direction,
        dealId: s.dealId,
        dealName: null,
        userId: null,
        userName: null,
        fromNumber: s.fromNumber,
        toNumber: s.toNumber,
        status: s.status
      });
    });

    timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      data: timelineItems.slice(0, limit),
      total: timelineItems.length,
      counts: {
        activities: activities.length,
        emails: emails.length,
        calls: calls.length,
        sms: smsMessages.length
      }
    };
  }
}
