import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
} from '@nestjs/common';
import { MarketingPlanService } from './marketing-plan.service';

@Controller('cmo/marketing-plan')
export class MarketingPlanController {
  constructor(private readonly marketingPlanService: MarketingPlanService) {}

  // Get the marketing plan for the tenant
  @Get()
  async findOne(@Request() req) {
    const plan = await this.marketingPlanService.findOne(req.tenantId);
    if (!plan) {
      // Return empty default plan structure
      return {
        status: 'draft',
        mission: '',
        vision: '',
        strategy: '',
        goals: [],
        swot: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: [],
        },
        monthlyThemes: [],
        kpis: [],
        budget: null,
        timeline: null,
      };
    }
    return plan;
  }

  // Create or update the marketing plan
  @Post()
  async upsert(
    @Request() req,
    @Body()
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
    return this.marketingPlanService.upsert(req.tenantId, data);
  }

  // Partial update
  @Patch()
  async update(
    @Request() req,
    @Body()
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
    return this.marketingPlanService.update(req.tenantId, data);
  }
}
