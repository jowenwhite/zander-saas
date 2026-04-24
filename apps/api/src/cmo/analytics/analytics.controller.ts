import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('cmo/analytics')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(
    @Request() req,
    @Query('dateRange') dateRange?: '7d' | '30d' | '90d',
  ) {
    return this.analyticsService.getOverview(
      req.tenantId,
      dateRange || '30d',
    );
  }

  @Get('top-content')
  async getTopContent(@Request() req) {
    return this.analyticsService.getTopContent(req.tenantId);
  }

  @Get('email')
  async getEmailAnalytics(
    @Request() req,
    @Query('dateRange') dateRange?: '7d' | '30d' | '90d',
  ) {
    return this.analyticsService.getEmailAnalytics(
      req.tenantId,
      dateRange || '30d',
    );
  }
}
