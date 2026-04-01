import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TierGuard } from '../common/guards/tier.guard';
import { RequireTier } from '../common/decorators/require-tier.decorator';
import { HQDashboardService } from './hq-dashboard.service';

@Controller('hq/dashboard')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('STARTER')
export class HQDashboardController {
  constructor(private readonly hqDashboardService: HQDashboardService) {}

  /**
   * GET /hq/dashboard
   * Single aggregated endpoint for all HQ data
   */
  @Get()
  async getDashboard(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.hqDashboardService.getDashboard(tenantId);
  }
}
