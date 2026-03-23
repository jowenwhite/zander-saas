import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertMarketingPlanDto } from './dto/upsert-marketing-plan.dto';

@Injectable()
export class MarketingPlanService {
  constructor(private prisma: PrismaService) {}

  async findOne(tenantId: string) {
    return this.prisma.marketingPlan.findUnique({
      where: { tenantId },
    });
  }

  async upsert(tenantId: string, data: UpsertMarketingPlanDto) {
    // DIAGNOSTIC: Log incoming data
    console.log('[MarketingPlanService.upsert] Received data:', {
      tenantId,
      dataKeys: Object.keys(data || {}),
      dataIsEmpty: !data || Object.keys(data).length === 0,
      mission: data?.mission?.substring(0, 50),
      vision: data?.vision?.substring(0, 50),
    });

    if (!data || Object.keys(data).length === 0) {
      console.error('[MarketingPlanService.upsert] ERROR: Data is empty!');
    }

    try {
      const existingPlan = await this.prisma.marketingPlan.findUnique({
        where: { tenantId },
      });

      if (existingPlan) {
        console.log('[MarketingPlanService.upsert] Updating existing plan:', existingPlan.id);
        const updated = await this.prisma.marketingPlan.update({
          where: { tenantId },
          data: {
            status: data.status ?? existingPlan.status,
            mission: data.mission ?? existingPlan.mission,
            vision: data.vision ?? existingPlan.vision,
            strategy: data.strategy ?? existingPlan.strategy,
            goals: data.goals ?? existingPlan.goals,
            swot: data.swot ?? existingPlan.swot,
            monthlyThemes: data.monthlyThemes ?? existingPlan.monthlyThemes,
            kpis: data.kpis ?? existingPlan.kpis,
            budget: data.budget ?? existingPlan.budget,
            timeline: data.timeline ?? existingPlan.timeline,
          },
        });
        console.log('[MarketingPlanService.upsert] SUCCESS - Updated plan:', updated.id);
        return updated;
      }

      console.log('[MarketingPlanService.upsert] Creating new plan for tenant:', tenantId);
      const created = await this.prisma.marketingPlan.create({
        data: {
          tenantId,
          status: data.status || 'draft',
          mission: data.mission || null,
          vision: data.vision || null,
          strategy: data.strategy || null,
          goals: data.goals || [],
          swot: data.swot || {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: [],
          },
          monthlyThemes: data.monthlyThemes || [],
          kpis: data.kpis || [],
          budget: data.budget || null,
          timeline: data.timeline || null,
        },
      });
      console.log('[MarketingPlanService.upsert] SUCCESS - Created plan:', created.id);
      return created;
    } catch (error) {
      console.error('[MarketingPlanService.upsert] PRISMA ERROR:', error);
      throw error;
    }
  }

  async update(tenantId: string, data: UpsertMarketingPlanDto) {
    // Build plain object for Prisma (avoid class instance issues)
    const updateData: Record<string, any> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.mission !== undefined) updateData.mission = data.mission;
    if (data.vision !== undefined) updateData.vision = data.vision;
    if (data.strategy !== undefined) updateData.strategy = data.strategy;
    if (data.goals !== undefined) updateData.goals = data.goals;
    if (data.swot !== undefined) updateData.swot = data.swot;
    if (data.monthlyThemes !== undefined) updateData.monthlyThemes = data.monthlyThemes;
    if (data.kpis !== undefined) updateData.kpis = data.kpis;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.timeline !== undefined) updateData.timeline = data.timeline;

    return this.prisma.marketingPlan.upsert({
      where: { tenantId },
      update: updateData,
      create: {
        tenantId,
        status: data.status || 'draft',
        mission: data.mission || null,
        vision: data.vision || null,
        strategy: data.strategy || null,
        goals: data.goals || [],
        swot: data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        monthlyThemes: data.monthlyThemes || [],
        kpis: data.kpis || [],
        budget: data.budget || null,
        timeline: data.timeline || null,
      },
    });
  }
}
