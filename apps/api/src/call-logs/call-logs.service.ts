import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CallLogsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: {
    contactId?: string;
    dealId?: string;
    userId?: string;
    type: string;
    direction: string;
    fromNumber?: string;
    toNumber?: string;
    platform?: string;
    meetingUrl?: string;
    meetingId?: string;
    duration?: number;
    outcome?: string;
    status?: string;
    scriptId?: string;
    notes?: string;
    recordingUrl?: string;
    transcription?: string;
    aiSummary?: string;
    voicemailTemplateId?: string;
    scheduledAt?: Date;
    startedAt?: Date;
    endedAt?: Date;
  }) {
    return this.prisma.callLog.create({
      data: {
        tenantId,
        ...data,
      },
      include: {
        contact: true,
      },
    });
  }

  async findAll(tenantId: string, filters?: {
    type?: string;
    direction?: string;
    contactId?: string;
    status?: string;
  }) {
    const where: any = { tenantId };
    
    if (filters?.type) where.type = filters.type;
    if (filters?.direction) where.direction = filters.direction;
    if (filters?.contactId) where.contactId = filters.contactId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.callLog.findMany({
      where,
      include: {
        contact: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.callLog.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
      },
    });
  }

  async findByContact(tenantId: string, contactId: string) {
    return this.prisma.callLog.findMany({
      where: { tenantId, contactId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(tenantId: string, id: string, data: {
    duration?: number;
    outcome?: string;
    status?: string;
    notes?: string;
    recordingUrl?: string;
    transcription?: string;
    aiSummary?: string;
    startedAt?: Date;
    endedAt?: Date;
  }) {
    return this.prisma.callLog.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.callLog.deleteMany({
      where: { id, tenantId },
    });
  }
}
