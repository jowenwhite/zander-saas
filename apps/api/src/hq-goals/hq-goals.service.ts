import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHQGoalDto } from './dto/create-hq-goal.dto';
import { UpdateHQGoalDto } from './dto/update-hq-goal.dto';

@Injectable()
export class HQGoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters?: {
      scope?: string;
      status?: string;
      quarter?: string;
      year?: number;
      priority?: string;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.scope) where.scope = filters.scope;
    if (filters?.status) where.status = filters.status;
    if (filters?.quarter) where.quarter = filters.quarter;
    if (filters?.year) where.year = filters.year;
    if (filters?.priority) where.priority = filters.priority;

    return this.prisma.hQGoal.findMany({
      where,
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, tenantId: string) {
    const goal = await this.prisma.hQGoal.findFirst({
      where: { id, tenantId },
    });

    if (!goal) {
      throw new NotFoundException(`HQ Goal with ID ${id} not found`);
    }

    return goal;
  }

  async create(tenantId: string, data: CreateHQGoalDto) {
    return this.prisma.hQGoal.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        scope: data.scope,
        priority: data.priority,
        progress: data.progress || 0,
        targetValue: data.targetValue,
        currentValue: data.currentValue,
        ownerId: data.ownerId,
        ownerName: data.ownerName,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        quarter: data.quarter,
        year: data.year,
        status: 'ACTIVE',
      },
    });
  }

  async update(id: string, tenantId: string, data: UpdateHQGoalDto) {
    // Verify goal exists and belongs to tenant
    await this.findOne(id, tenantId);

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.targetValue !== undefined) updateData.targetValue = data.targetValue;
    if (data.currentValue !== undefined) updateData.currentValue = data.currentValue;
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;
    if (data.ownerName !== undefined) updateData.ownerName = data.ownerName;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.quarter !== undefined) updateData.quarter = data.quarter;
    if (data.year !== undefined) updateData.year = data.year;

    // Auto-set progress to 100 when marking as COMPLETED
    if (data.status === 'COMPLETED' && data.progress === undefined) {
      updateData.progress = 100;
    }

    return this.prisma.hQGoal.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, tenantId: string) {
    // Verify goal exists and belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.hQGoal.delete({
      where: { id },
    });
  }

  async getStats(tenantId: string) {
    const [personal, quarterly, annual] = await Promise.all([
      this.prisma.hQGoal.groupBy({
        by: ['status'],
        where: { tenantId, scope: 'PERSONAL' },
        _count: true,
      }),
      this.prisma.hQGoal.groupBy({
        by: ['status'],
        where: { tenantId, scope: 'QUARTERLY' },
        _count: true,
      }),
      this.prisma.hQGoal.groupBy({
        by: ['status'],
        where: { tenantId, scope: 'ANNUAL' },
        _count: true,
      }),
    ]);

    const formatStats = (data: Array<{ status: string; _count: number }>) => {
      const result: Record<string, number> = {
        active: 0,
        completed: 0,
        deferred: 0,
        cancelled: 0,
        total: 0,
      };
      data.forEach((item) => {
        const key = item.status.toLowerCase();
        result[key] = item._count;
        result.total += item._count;
      });
      return result;
    };

    return {
      personal: formatStats(personal),
      quarterly: formatStats(quarterly),
      annual: formatStats(annual),
    };
  }
}
