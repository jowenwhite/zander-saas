import { Module } from '@nestjs/common';
import { MarketingPlanController } from './marketing-plan.controller';
import { MarketingPlanService } from './marketing-plan.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [MarketingPlanController],
  providers: [MarketingPlanService, PrismaService],
  exports: [MarketingPlanService],
})
export class MarketingPlanModule {}
