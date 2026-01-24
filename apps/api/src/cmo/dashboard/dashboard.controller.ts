import { Controller, Get, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('cmo/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(@Request() req) {
    return this.dashboardService.getMetrics(req.tenantId);
  }
}
