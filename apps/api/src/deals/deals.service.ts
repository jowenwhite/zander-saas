import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  // Get all deals for a tenant (with search, filters, pagination)
  async findAll(tenantId: string, query: any) {
    const { search, stage, priority, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc', includeArchived, includeLost } = query;

    const where: any = { tenantId };

    // By default, exclude archived and lost deals unless explicitly requested
    if (includeArchived !== true && includeArchived !== "true") {
      where.isArchived = false;
    }
    if (includeLost !== true && includeLost !== "true") {
      where.isLost = false;
    }

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
  // DEBUG: Log stage change attempts
  async updateStage(id: string, stage: string, tenantId: string, userId?: string) {
    console.log(`[STAGE_CHANGE] id=${id}, newStage=${stage}, userId=${userId}`);
    // Get current deal to capture old stage
    const currentDeal = await this.findOne(id, tenantId);
    const oldStage = currentDeal.stage;
    
    // Update the deal
    const updatedDeal = await this.prisma.deal.update({
      where: { id },
      data: {
        stage: stage as any,
        updatedAt: new Date()
      },
      include: {
        contact: true
      }
    });
    
    // Log activity for stage change (if stage actually changed)
    if (oldStage !== stage && userId) {
      await this.prisma.activity.create({
        data: {
          tenantId,
          type: 'stage_change',
          subject: `Moved to ${stage}`,
          description: `Deal moved from ${oldStage} to ${stage}`,
          dealId: id,
          userId,
          date: new Date()
        }
      });
    }
    
    return updatedDeal;
  }

  // Get pipeline view (deals grouped by stage)
  async getPipeline(tenantId: string) {
    // Fetch tenant-specific pipeline stages
    const stages = await this.prisma.pipelineStage.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' }
    });

    // Fetch all active deals for tenant (exclude archived and lost)
    const deals = await this.prisma.deal.findMany({
      where: { tenantId, isArchived: false, isLost: false },
      include: {
        contact: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // If no custom stages configured, use default stage names
    const defaultStages = [
      { name: 'PROSPECT', order: 1, probability: 10 },
      { name: 'QUALIFIED', order: 2, probability: 25 },
      { name: 'PROPOSAL', order: 3, probability: 50 },
      { name: 'NEGOTIATION', order: 4, probability: 75 },
      { name: 'CLOSED_WON', order: 5, probability: 100 },
      { name: 'CLOSED_LOST', order: 6, probability: 0 }
    ];

    const activeStages = stages.length > 0 ? stages : defaultStages;

    // Create mapping from old enum values to new stage names for backward compatibility
    const stageMapping: Record<string, string> = {
      'PROSPECT': 'Lead',
      'LEAD': 'Lead',
      'QUALIFIED': 'Discovery',
      'DISCOVERY': 'Discovery',
      'ESTIMATING': 'Estimating',
      'PROPOSAL': 'Proposal',
      'NEGOTIATION': 'Negotiation',
      'CONTRACT': 'Contract',
      'PRODUCTION': 'Production',
      'CLOSED_WON': 'Complete',
      'COMPLETE': 'Complete',
      'CLOSED_LOST': 'Closed Lost'
    };

    // Group deals by stage dynamically
    const pipeline: Record<string, any[]> = {};
    const stageValues: Record<string, number> = {};

    // Initialize all stages with empty arrays and zero values
    for (const stage of activeStages) {
      pipeline[stage.name] = [];
      stageValues[stage.name] = 0;
    }

    // Assign deals to stages
    for (const deal of deals) {
      const dealStage = deal.stage;
      
      // Try direct match first
      if (pipeline[dealStage] !== undefined) {
        pipeline[dealStage].push(deal);
        stageValues[dealStage] += deal.dealValue;
      } 
      // Try mapped stage name
      else if (stageMapping[dealStage] && pipeline[stageMapping[dealStage]] !== undefined) {
        pipeline[stageMapping[dealStage]].push(deal);
        stageValues[stageMapping[dealStage]] += deal.dealValue;
      }
      // Fallback: assign to first stage
      else if (activeStages.length > 0) {
        pipeline[activeStages[0].name].push(deal);
        stageValues[activeStages[0].name] += deal.dealValue;
      }
    }

    return {
      pipeline,
      stageValues,
      stages: activeStages,
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


  // Archive a deal (excluded from win/loss metrics)
  async archive(id: string, tenantId: string, reason?: string, userId?: string) {
    const deal = await this.findOne(id, tenantId);
    
    const updatedDeal = await this.prisma.deal.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archiveReason: reason || null,
        status: 'archived',
        updatedAt: new Date()
      },
      include: { contact: true }
    });

    // Log activity
    if (userId) {
      await this.prisma.activity.create({
        data: {
          tenantId,
          type: 'deal_archived',
          subject: 'Deal Archived',
          description: reason ? `Deal archived: ${reason}` : 'Deal archived',
          dealId: id,
          userId,
          date: new Date()
        }
      });
    }

    return updatedDeal;
  }

  // Mark deal as lost (counts in win/loss metrics)
  async markLost(id: string, tenantId: string, reason: string, userId?: string) {
    const deal = await this.findOne(id, tenantId);
    
    const updatedDeal = await this.prisma.deal.update({
      where: { id },
      data: {
        isLost: true,
        lostAt: new Date(),
        lossReason: reason,
        stageAtLoss: deal.stage,
        status: 'lost',
        updatedAt: new Date()
      },
      include: { contact: true }
    });

    // Log activity
    if (userId) {
      await this.prisma.activity.create({
        data: {
          tenantId,
          type: 'deal_lost',
          subject: 'Deal Lost',
          description: `Deal marked as lost: ${reason}`,
          dealId: id,
          userId,
          date: new Date()
        }
      });
    }

    return updatedDeal;
  }

  // Restore an archived or lost deal
  async restore(id: string, tenantId: string, userId?: string) {
    const deal = await this.findOne(id, tenantId);
    
    const updatedDeal = await this.prisma.deal.update({
      where: { id },
      data: {
        isArchived: false,
        archivedAt: null,
        archiveReason: null,
        isLost: false,
        lostAt: null,
        lossReason: null,
        stageAtLoss: null,
        status: 'open',
        updatedAt: new Date()
      },
      include: { contact: true }
    });

    // Log activity
    if (userId) {
      await this.prisma.activity.create({
        data: {
          tenantId,
          type: 'deal_restored',
          subject: 'Deal Restored',
          description: 'Deal restored to active pipeline',
          dealId: id,
          userId,
          date: new Date()
        }
      });
    }

    return updatedDeal;
  }

}