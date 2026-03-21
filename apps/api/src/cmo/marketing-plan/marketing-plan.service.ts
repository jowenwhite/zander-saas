import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MarketingPlanService {
  constructor(private prisma: PrismaService) {}

  async findOne(tenantId: string) {
    return this.prisma.marketingPlan.findUnique({
      where: { tenantId },
    });
  }

  async upsert(
    tenantId: string,
    data: {
      status?: string;
      mission?: string;
      vision?: string;
      strategy?: string;
      goals?: string[];
      swot?: {
        strengths: Array<{ id: string; text: string }>;
        weaknesses: Array<{ id: string; text: string }>;
        opportunities: Array<{ id: string; text: string }>;
        threats: Array<{ id: string; text: string }>;
      };
      monthlyThemes?: string[];
      kpis?: Array<{ name: string; target: string }>;
      budget?: string;
      timeline?: string;
    },
  ) {
    const existingPlan = await this.prisma.marketingPlan.findUnique({
      where: { tenantId },
    });

    if (existingPlan) {
      return this.prisma.marketingPlan.update({
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
    }

    return this.prisma.marketingPlan.create({
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
  }

  async update(
    tenantId: string,
    data: {
      status?: string;
      mission?: string;
      vision?: string;
      strategy?: string;
      goals?: string[];
      swot?: object;
      monthlyThemes?: string[];
      kpis?: object[];
      budget?: string;
      timeline?: string;
    },
  ) {
    return this.prisma.marketingPlan.upsert({
      where: { tenantId },
      update: data,
      create: {
        tenantId,
        ...data,
      },
    });
  }
}
