import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FunnelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    try {
      return await this.prisma.funnel.findMany({
        where: { tenantId },
        include: {
          stages: { orderBy: { stageOrder: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching funnels:', error);
      // Return empty array if table doesn't exist or query fails
      return [];
    }
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
    // Log incoming data for debugging
    console.log('[FunnelsService.create] Input data:', JSON.stringify({
      name: data.name,
      description: data.description,
      conversionGoal: data.conversionGoal,
      stagesProvided: !!data.stages,
      stagesCount: data.stages?.length || 0,
      stages: data.stages,
    }, null, 2));

    const funnel = await this.prisma.funnel.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        conversionGoal: data.conversionGoal,
        status: 'draft',
      },
    });

    console.log('[FunnelsService.create] Funnel created:', funnel.id);

    // Create stages if provided - matching update_funnel pattern
    if (data.stages && Array.isArray(data.stages) && data.stages.length > 0) {
      console.log(`[FunnelsService.create] Creating ${data.stages.length} stages`);
      await this.prisma.funnelStage.createMany({
        data: data.stages.map((stage) => ({
          funnelId: funnel.id,
          name: stage.name,
          stageType: stage.stageType,
          stageOrder: stage.stageOrder,
          config: stage.config || {},
        })),
      });
      console.log('[FunnelsService.create] Stages created successfully');
    } else {
      console.log('[FunnelsService.create] No stages to create');
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

    // Check if GA4 is connected to get real visitor data
    const ga4Connection = await this.prisma.integrationConnection.findFirst({
      where: {
        tenantId,
        provider: 'google_analytics',
        status: 'active',
      },
    });

    // Real data only - no fake visitors
    // Visitors come from GA4 if connected, otherwise show 0 with guidance
    const visitors = 0; // TODO: Pull from GA4 integration when connected
    const leads = totalContacts;
    const mqls = contactsWithDeals;
    const croHandoff = contactsWithClosedDeals;

    // Calculate real conversion percentages (0 if no data)
    const leadsPercentage = visitors > 0 ? Math.round((leads / visitors) * 100) : 0;
    const mqlsPercentage = leads > 0 ? Math.round((mqls / leads) * 100) : 0;
    const croPercentage = mqls > 0 ? Math.round((croHandoff / mqls) * 100) : 0;

    return {
      visitors: {
        count: visitors,
        percentage: 100,
        source: ga4Connection ? 'google_analytics' : null,
        guidance: !ga4Connection ? 'Connect Google Analytics to track visitors' : null,
      },
      leads: {
        count: leads,
        percentage: leadsPercentage,
      },
      mqls: {
        count: mqls,
        percentage: mqlsPercentage,
      },
      croHandoff: {
        count: croHandoff,
        percentage: croPercentage,
      },
      period: 'All time',
      hasData: leads > 0 || mqls > 0 || croHandoff > 0,
      integrations: {
        ga4Connected: !!ga4Connection,
      },
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
