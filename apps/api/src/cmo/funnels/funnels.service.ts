import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class FunnelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.funnel.findMany({
      where: { tenantId },
      include: {
        stages: { orderBy: { stageOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const funnel = await this.prisma.funnel.findFirst({
      where: { id, tenantId },
      include: {
        stages: { orderBy: { stageOrder: 'asc' } },
      },
    });
    if (!funnel) {
      throw new NotFoundException('Funnel not found');
    }
    return funnel;
  }

  async create(
    tenantId: string,
    data: {
      name: string;
      description?: string;
      conversionGoal?: string;
      stages?: {
        name: string;
        stageType: string;
        stageOrder: number;
        config?: any;
      }[];
    },
  ) {
    const funnel = await this.prisma.funnel.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        conversionGoal: data.conversionGoal,
        status: 'draft',
      },
    });

    if (data.stages && data.stages.length > 0) {
      await this.prisma.funnelStage.createMany({
        data: data.stages.map((stage) => ({
          funnelId: funnel.id,
          name: stage.name,
          stageType: stage.stageType,
          stageOrder: stage.stageOrder,
          config: stage.config || {},
        })),
      });
    }

    return this.findOne(funnel.id, tenantId);
  }

  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      conversionGoal?: string;
      stages?: {
        id?: string;
        name: string;
        stageType: string;
        stageOrder: number;
        config?: any;
      }[];
    },
  ) {
    const funnel = await this.prisma.funnel.findFirst({
      where: { id, tenantId },
    });
    if (!funnel) {
      throw new NotFoundException('Funnel not found');
    }

    await this.prisma.funnel.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        conversionGoal: data.conversionGoal,
      },
    });

    if (data.stages) {
      await this.prisma.funnelStage.deleteMany({
        where: { funnelId: id },
      });

      if (data.stages.length > 0) {
        await this.prisma.funnelStage.createMany({
          data: data.stages.map((stage) => ({
            funnelId: id,
            name: stage.name,
            stageType: stage.stageType,
            stageOrder: stage.stageOrder,
            config: stage.config || {},
          })),
        });
      }
    }

    return this.findOne(id, tenantId);
  }

  async getOverview(tenantId: string) {
    // Get total contacts for funnel metrics
    const totalContacts = await this.prisma.contact.count({
      where: { tenantId },
    });

    // Get contacts by lifecycle stage if available
    // For now, simulate a funnel with percentages based on contact data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get new contacts (visitors who became leads)
    const newContacts = await this.prisma.contact.count({
      where: {
        tenantId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Get contacts with deals (MQLs)
    const contactsWithDeals = await this.prisma.contact.count({
      where: {
        tenantId,
        deals: { some: {} },
      },
    });

    // Get contacts with closed deals (CRO handoff success)
    const contactsWithClosedDeals = await this.prisma.contact.count({
      where: {
        tenantId,
        deals: {
          some: {
            stage: { in: ['CLOSED_WON', 'NEGOTIATION', 'PROPOSAL'] },
          },
        },
      },
    });

    // Calculate funnel metrics
    // Visitors = estimated at 10x the leads (typical conversion rate)
    const estimatedVisitors = Math.max(totalContacts * 10, 1000);
    const leads = totalContacts;
    const mqls = contactsWithDeals;
    const croHandoff = contactsWithClosedDeals;

    return {
      visitors: {
        count: estimatedVisitors,
        percentage: 100,
      },
      leads: {
        count: leads,
        percentage: estimatedVisitors > 0 ? Math.round((leads / estimatedVisitors) * 100) : 0,
      },
      mqls: {
        count: mqls,
        percentage: leads > 0 ? Math.round((mqls / leads) * 100) : 0,
      },
      croHandoff: {
        count: croHandoff,
        percentage: mqls > 0 ? Math.round((croHandoff / mqls) * 100) : 0,
      },
      period: 'All time',
    };
  }

  async remove(id: string, tenantId: string) {
    const funnel = await this.prisma.funnel.findFirst({
      where: { id, tenantId },
    });
    if (!funnel) {
      throw new NotFoundException('Funnel not found');
    }

    await this.prisma.funnel.delete({ where: { id } });
    return { success: true, message: 'Funnel deleted successfully' };
  }
}
