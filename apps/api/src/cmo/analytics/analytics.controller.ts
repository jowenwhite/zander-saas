import { Controller, Get, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('cmo/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-content')
  async getTopContent(@Request() req) {
    return this.analyticsService.getTopContent(req.tenantId);
  }
}
