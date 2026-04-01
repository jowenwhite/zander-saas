import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { DashboardService } from './dashboard.service';

@Controller('cmo/dashboard')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(@Request() req) {
    return this.dashboardService.getMetrics(req.tenantId);
  }
}
