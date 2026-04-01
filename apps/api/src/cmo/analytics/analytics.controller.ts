import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('cmo/analytics')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-content')
  async getTopContent(@Request() req) {
    return this.analyticsService.getTopContent(req.tenantId);
  }
}
