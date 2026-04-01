import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { MarketingPlanService } from './marketing-plan.service';
import { UpsertMarketingPlanDto } from './dto/upsert-marketing-plan.dto';

@Controller('cmo/marketing-plan')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
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
    @Body() data: UpsertMarketingPlanDto,
  ) {
    // DIAGNOSTIC: Log what the controller receives after ValidationPipe
    console.log('[MarketingPlanController.upsert] Received body:', {
      tenantId: req.tenantId,
      bodyKeys: Object.keys(data || {}),
      mission: data?.mission?.substring(0, 50),
    });

    return this.marketingPlanService.upsert(req.tenantId, data);
  }

  // Partial update
  @Patch()
  async update(
    @Request() req,
    @Body() data: UpsertMarketingPlanDto,
  ) {
    return this.marketingPlanService.update(req.tenantId, data);
  }
}
