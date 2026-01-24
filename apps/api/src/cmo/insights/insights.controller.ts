import { Controller, Get, Request } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('cmo/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('recommendations')
  async getRecommendations(@Request() req) {
    return this.insightsService.getRecommendations(req.tenantId);
  }
}
