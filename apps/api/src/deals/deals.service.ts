import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  // Get all deals for a tenant (with search, filters, pagination)
  async findAll(tenantId: string, query: any) {
    const { search, stage, priority, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = { tenantId };

    // Search filter
    if (search) {
      where.OR = [
        { dealName: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Stage filter
    if (stage) {
      where.stage = stage;
    }

    // Priority filter
    if (priority) {
      where.priority = priority;
    }

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          contact: true
        }
      }),
      this.prisma.deal.count({ where })
    ]);

    return {
      data: deals,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  // Get single deal by ID (with tenant check)
  async findOne(id: string, tenantId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, tenantId },
      include: {
        contact: true
      }
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  // Create new deal
  async create(data: any, tenantId: string) {
    return this.prisma.deal.create({
      data: {
        ...data,
        tenantId
      },
      include: {
        contact: true
      }
    });
  }

  // Update deal
  async update(id: string, data: any, tenantId: string) {
    // Verify deal belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.deal.update({
      where: { id },
      data,
      include: {
        contact: true
      }
    });
  }

  // Delete deal
  async delete(id: string, tenantId: string) {
    // Verify deal belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.deal.delete({
      where: { id }
    });
  }

  // Move deal to different stage
  async updateStage(id: string, stage: string, tenantId: string) {
    // Verify deal belongs to tenant
    await this.findOne(id, tenantId);

    return this.prisma.deal.update({
      where: { id },
      data: { 
        stage: stage as any,
        updatedAt: new Date()
      },
      include: {
        contact: true
      }
    });
  }

  // Get pipeline view (deals grouped by stage)
  async getPipeline(tenantId: string) {
    const deals = await this.prisma.deal.findMany({
      where: { tenantId },
      include: {
        contact: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group deals by stage
    const pipeline = {
      PROSPECT: deals.filter(d => d.stage === 'PROSPECT'),
      QUALIFIED: deals.filter(d => d.stage === 'QUALIFIED'),
      PROPOSAL: deals.filter(d => d.stage === 'PROPOSAL'),
      NEGOTIATION: deals.filter(d => d.stage === 'NEGOTIATION'),
      CLOSED_WON: deals.filter(d => d.stage === 'CLOSED_WON'),
      CLOSED_LOST: deals.filter(d => d.stage === 'CLOSED_LOST')
    };

    // Calculate stage values
    const stageValues = {
      PROSPECT: pipeline.PROSPECT.reduce((sum, d) => sum + d.dealValue, 0),
      QUALIFIED: pipeline.QUALIFIED.reduce((sum, d) => sum + d.dealValue, 0),
      PROPOSAL: pipeline.PROPOSAL.reduce((sum, d) => sum + d.dealValue, 0),
      NEGOTIATION: pipeline.NEGOTIATION.reduce((sum, d) => sum + d.dealValue, 0),
      CLOSED_WON: pipeline.CLOSED_WON.reduce((sum, d) => sum + d.dealValue, 0),
      CLOSED_LOST: pipeline.CLOSED_LOST.reduce((sum, d) => sum + d.dealValue, 0)
    };

    return {
      pipeline,
      stageValues,
      totalValue: Object.values(stageValues).reduce((sum, val) => sum + val, 0),
      totalDeals: deals.length
    };
  }

  // Bulk import deals
  async bulkImport(deals: any[], tenantId: string) {
    const created = [];
    const errors = [];

    for (const deal of deals) {
      try {
        const newDeal = await this.create(deal, tenantId);
        created.push(newDeal);
      } catch (error) {
        errors.push({ deal, error: error.message });
      }
    }

    return { created, errors };
  }
}
