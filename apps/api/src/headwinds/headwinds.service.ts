import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HeadwindPriority, HeadwindCategory, HeadwindStatus } from '@prisma/client';

@Injectable()
export class HeadwindsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    priority?: HeadwindPriority;
    status?: HeadwindStatus;
    category?: HeadwindCategory;
    tenantId?: string;
    systemOnly?: boolean;
  }) {
    const where: any = {};
    
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.systemOnly) {
      where.tenantId = null;
    } else if (filters?.tenantId) {
      where.tenantId = filters.tenantId;
    }
    
    return this.prisma.headwind.findMany({
      where,
      include: {
        tenant: { select: { id: true, companyName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        tickets: { select: { id: true, ticketNumber: true, subject: true, status: true } },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const headwind = await this.prisma.headwind.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, companyName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        tickets: {
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            status: true,
            createdAt: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
    
    if (!headwind) {
      throw new NotFoundException(`Headwind with ID ${id} not found`);
    }
    
    return headwind;
  }

  async create(data: {
    title: string;
    description?: string;
    priority?: HeadwindPriority;
    category?: HeadwindCategory;
    tenantId?: string;
    assignedToId?: string;
    gitBranch?: string;
    createdById: string;
  }) {
    return this.prisma.headwind.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'P2',
        category: data.category || 'BUG',
        status: 'OPEN',
        tenantId: data.tenantId || null,
        assignedToId: data.assignedToId || null,
        gitBranch: data.gitBranch,
        createdById: data.createdById,
      },
      include: {
        tenant: { select: { id: true, companyName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    priority?: HeadwindPriority;
    category?: HeadwindCategory;
    status?: HeadwindStatus;
    assignedToId?: string;
    gitCommit?: string;
    gitBranch?: string;
    resolution?: string;
  }) {
    const updateData: any = { ...data };
    
    if (data.status === 'DEPLOYED' || data.status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }
    
    return this.prisma.headwind.update({
      where: { id },
      data: updateData,
      include: {
        tenant: { select: { id: true, companyName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        tickets: { select: { id: true, ticketNumber: true, subject: true, status: true } },
      },
    });
  }

  async delete(id: string) {
    await this.prisma.supportTicket.updateMany({
      where: { linkedHeadwindId: id },
      data: { linkedHeadwindId: null },
    });
    
    return this.prisma.headwind.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, byPriority, byStatus, byCategory] = await Promise.all([
      this.prisma.headwind.count(),
      this.prisma.headwind.groupBy({
        by: ['priority'],
        _count: true,
      }),
      this.prisma.headwind.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.headwind.groupBy({
        by: ['category'],
        _count: true,
      }),
    ]);

    return {
      total,
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
