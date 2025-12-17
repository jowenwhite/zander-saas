import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PipelineStagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.pipelineStage.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
    });
  }

  async create(tenantId: string, data: {
    name: string;
    order: number;
    probability?: number;
    color?: string;
  }) {
    return this.prisma.pipelineStage.create({
      data: {
        tenantId,
        name: data.name,
        order: data.order,
        probability: data.probability || 0,
        color: data.color || '#6C757D',
      },
    });
  }

  async update(id: string, tenantId: string, data: {
    name?: string;
    order?: number;
    probability?: number;
    color?: string;
  }) {
    const stage = await this.prisma.pipelineStage.findFirst({
      where: { id, tenantId },
    });

    if (!stage) {
      throw new NotFoundException('Pipeline stage not found');
    }

    return this.prisma.pipelineStage.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    const stage = await this.prisma.pipelineStage.findFirst({
      where: { id, tenantId },
    });

    if (!stage) {
      throw new NotFoundException('Pipeline stage not found');
    }

    await this.prisma.pipelineStage.delete({
      where: { id },
    });

    return { success: true, message: 'Stage deleted successfully' };
  }

  async reorder(tenantId: string, stageIds: string[]) {
    const updates = stageIds.map((id, index) =>
      this.prisma.pipelineStage.updateMany({
        where: { id, tenantId },
        data: { order: index },
      })
    );

    await Promise.all(updates);

    return this.findAll(tenantId);
  }

  async seedDefaults(tenantId: string) {
    const existing = await this.prisma.pipelineStage.count({
      where: { tenantId },
    });

    if (existing > 0) {
      return this.findAll(tenantId);
    }

    const defaults = [
      { name: 'Prospect', order: 0, probability: 10, color: '#6C757D' },
      { name: 'Qualified', order: 1, probability: 25, color: '#007BFF' },
      { name: 'Proposal', order: 2, probability: 50, color: '#F0B323' },
      { name: 'Negotiation', order: 3, probability: 75, color: '#17A2B8' },
      { name: 'Closed Won', order: 4, probability: 100, color: '#28A745' },
      { name: 'Closed Lost', order: 5, probability: 0, color: '#DC3545' },
    ];

    await this.prisma.pipelineStage.createMany({
      data: defaults.map(stage => ({ ...stage, tenantId })),
    });

    return this.findAll(tenantId);
  }
}
