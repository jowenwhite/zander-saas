import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { ReorderMilestonesDto } from './dto/reorder-milestones.dto';

@Injectable()
export class LegacyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all milestones for a tenant, ordered by year then sortOrder
   */
  async findAll(tenantId: string) {
    return this.prisma.legacyMilestone.findMany({
      where: { tenantId },
      orderBy: [
        { year: 'asc' },
        { sortOrder: 'asc' },
      ],
    });
  }

  /**
   * Get a single milestone
   */
  async findOne(id: string, tenantId: string) {
    const milestone = await this.prisma.legacyMilestone.findFirst({
      where: { id, tenantId },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    return milestone;
  }

  /**
   * Create a new milestone
   */
  async create(tenantId: string, data: CreateMilestoneDto) {
    // Get max sortOrder for this tenant and year
    const maxOrder = await this.prisma.legacyMilestone.aggregate({
      where: { tenantId, year: data.year },
      _max: { sortOrder: true },
    });

    return this.prisma.legacyMilestone.create({
      data: {
        tenantId,
        year: data.year,
        title: data.title,
        description: data.description,
        goals: (data.goals || []) as any,
        progress: data.progress ?? 0,
        status: data.status ?? 'PLANNED',
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
  }

  /**
   * Update a milestone
   */
  async update(id: string, tenantId: string, data: UpdateMilestoneDto) {
    await this.findOne(id, tenantId);

    const updateData: any = {};

    if (data.year !== undefined) updateData.year = data.year;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.goals !== undefined) updateData.goals = data.goals;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    return this.prisma.legacyMilestone.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a milestone
   */
  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.legacyMilestone.delete({
      where: { id },
    });
  }

  /**
   * Bulk reorder milestones
   */
  async reorder(tenantId: string, data: ReorderMilestonesDto) {
    const updatePromises = data.items.map((item) =>
      this.prisma.legacyMilestone.updateMany({
        where: { id: item.id, tenantId },
        data: { sortOrder: item.sortOrder },
      }),
    );

    await Promise.all(updatePromises);

    return this.findAll(tenantId);
  }

  /**
   * Recalculate progress based on goals completion
   */
  async recalculateProgress(id: string, tenantId: string) {
    const milestone = await this.findOne(id, tenantId);
    const goals = (milestone.goals as any[]) || [];

    if (goals.length === 0) {
      return milestone;
    }

    const completedCount = goals.filter((g) => g.completed).length;
    const progress = Math.round((completedCount / goals.length) * 100);

    return this.prisma.legacyMilestone.update({
      where: { id },
      data: { progress },
    });
  }
}
