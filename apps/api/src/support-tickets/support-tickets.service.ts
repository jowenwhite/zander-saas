import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TicketSource, TicketCategory, TicketStatus, HeadwindPriority } from '@prisma/client';

@Injectable()
export class SupportTicketsService {
  constructor(private prisma: PrismaService) {}

  private async generateTicketNumber(): Promise<string> {
    const count = await this.prisma.supportTicket.count();
    const nextNumber = count + 1;
    return `TICK-${String(nextNumber).padStart(4, '0')}`;
  }

  async findAll(filters?: {
    tenantId?: string;
    tenantIds?: string[];
    userId?: string;
    status?: TicketStatus;
    priority?: HeadwindPriority;
    category?: TicketCategory;
    createdVia?: TicketSource;
  }) {
    const where: any = {};
    
    if (filters?.tenantIds && filters.tenantIds.length > 0) {
      where.tenantId = { in: filters.tenantIds };
    } else if (filters?.tenantId) {
      where.tenantId = filters.tenantId;
    }
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;
    if (filters?.createdVia) where.createdVia = filters.createdVia;
    
    return this.prisma.supportTicket.findMany({
      where,
      include: {
        tenant: { select: { id: true, companyName: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        linkedHeadwind: { select: { id: true, title: true, status: true, priority: true } },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, companyName: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        linkedHeadwind: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            resolution: true,
          },
        },
      },
    });
    
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    
    return ticket;
  }

  async findByTicketNumber(ticketNumber: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { ticketNumber },
      include: {
        tenant: { select: { id: true, companyName: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        linkedHeadwind: { select: { id: true, title: true, status: true, priority: true } },
      },
    });
    
    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketNumber} not found`);
    }
    
    return ticket;
  }

  async create(data: {
    tenantId: string;
    userId: string;
    subject: string;
    description: string;
    category?: TicketCategory;
    priority?: HeadwindPriority;
    createdVia?: TicketSource;
  }) {
    const ticketNumber = await this.generateTicketNumber();
    
    return this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        tenantId: data.tenantId,
        userId: data.userId,
        subject: data.subject,
        description: data.description,
        category: data.category || 'OTHER',
        priority: data.priority || 'P3',
        createdVia: data.createdVia || 'MANUAL',
        status: 'NEW',
      },
      include: {
        tenant: { select: { id: true, companyName: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async update(id: string, data: {
    subject?: string;
    description?: string;
    category?: TicketCategory;
    priority?: HeadwindPriority;
    status?: TicketStatus;
    aiSummary?: string;
    aiResponse?: string;
    linkedHeadwindId?: string;
    resolution?: string;
  }) {
    const updateData: any = { ...data };
    
    if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }
    
    return this.prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        tenant: { select: { id: true, companyName: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        linkedHeadwind: { select: { id: true, title: true, status: true, priority: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.supportTicket.delete({
      where: { id },
    });
  }

  async linkToHeadwind(ticketId: string, headwindId: string) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { linkedHeadwindId: headwindId },
      include: {
        linkedHeadwind: { select: { id: true, title: true, status: true, priority: true } },
      },
    });
  }

  async getStats(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};
    
    const [total, byStatus, byPriority, byCategory, bySource] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.supportTicket.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      this.prisma.supportTicket.groupBy({
        by: ['category'],
        where,
        _count: true,
      }),
      this.prisma.supportTicket.groupBy({
        by: ['createdVia'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {} as Record<string, number>),
      bySource: bySource.reduce((acc, item) => {
        acc[item.createdVia] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
