import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, TaskPriority } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: any) {
    const { status, priority, assignedToId, dueBefore, page = 1, limit = 50 } = query;

    const where: any = { tenantId };

    if (status) {
      where.status = status.toUpperCase() as TaskStatus;
    }

    if (priority) {
      where.priority = priority.toUpperCase() as TaskPriority;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (dueBefore) {
      where.dueDate = { lte: new Date(dueBefore) };
    }

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      }),
      this.prisma.task.count({ where })
    ]);

    // Compute days until due for each task
    const now = new Date();
    const tasksWithDaysUntilDue = tasks.map(task => {
      let daysUntilDue: number | null = null;
      if (task.dueDate) {
        const diff = task.dueDate.getTime() - now.getTime();
        daysUntilDue = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }
      return {
        ...task,
        daysUntilDue,
        assignedToName: task.assignedTo
          ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`.trim()
          : null
      };
    });

    return {
      data: tasksWithDaysUntilDue,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  async findOne(id: string, tenantId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, tenantId },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(data: any, tenantId: string, userId: string) {
    const taskData: any = {
      tenantId,
      createdById: userId,
      title: data.title,
      description: data.description || null,
      priority: (data.priority?.toUpperCase() as TaskPriority) || 'MEDIUM',
      status: 'OPEN' as TaskStatus,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assignedToId: data.assignedToId || data.assignedToUserId || null,
      linkedDealId: data.linkedDealId || null,
      linkedContactId: data.linkedContactId || null,
      notes: data.notes || null
    };

    return this.prisma.task.create({
      data: taskData,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
  }

  async update(id: string, data: any, tenantId: string) {
    await this.findOne(id, tenantId);

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;

    if (data.priority !== undefined) {
      updateData.priority = data.priority.toUpperCase() as TaskPriority;
    }

    if (data.status !== undefined) {
      const statusMap: Record<string, TaskStatus> = {
        'open': 'OPEN',
        'in-progress': 'IN_PROGRESS',
        'in_progress': 'IN_PROGRESS',
        'completed': 'COMPLETED',
        'cancelled': 'CANCELLED'
      };
      updateData.status = statusMap[data.status.toLowerCase()] || data.status.toUpperCase();

      // Set completedAt when marking as completed
      if (updateData.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (updateData.status === 'OPEN' || updateData.status === 'IN_PROGRESS') {
        updateData.completedAt = null;
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    // Soft delete by setting status to CANCELLED
    return this.prisma.task.update({
      where: { id },
      data: { status: 'CANCELLED' as TaskStatus }
    });
  }

  async getOverdueTasks(tenantId: string) {
    const now = new Date();
    return this.prisma.task.findMany({
      where: {
        tenantId,
        dueDate: { lt: now },
        status: { in: ['OPEN', 'IN_PROGRESS'] }
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  async getTasksDueToday(tenantId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return this.prisma.task.findMany({
      where: {
        tenantId,
        dueDate: { gte: startOfDay, lt: endOfDay },
        status: { in: ['OPEN', 'IN_PROGRESS'] }
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });
  }
}
