import { Module } from '@nestjs/common';
import { HQGoalsController } from './hq-goals.controller';
import { HQGoalsService } from './hq-goals.service';

@Module({
  controllers: [HQGoalsController],
  providers: [HQGoalsService],
  exports: [HQGoalsService],
})
export class HQGoalsModule {}
