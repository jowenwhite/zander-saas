import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { InsightsService } from './insights.service';

@Controller('cmo/insights')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('recommendations')
  async getRecommendations(@Request() req) {
    return this.insightsService.getRecommendations(req.tenantId);
  }
}
