import { Module } from '@nestjs/common';
import { MarketingPlanController } from './marketing-plan.controller';
import { MarketingPlanService } from './marketing-plan.service';

@Module({
  controllers: [MarketingPlanController],
  providers: [MarketingPlanService],
  exports: [MarketingPlanService],
})
export class MarketingPlanModule {}
