import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KeystonesModule } from '../keystones/keystones.module';
import { FoundingModule } from '../founding/founding.module';
import { HQDashboardController } from './hq-dashboard.controller';
import { HQDashboardService } from './hq-dashboard.service';

@Module({
  imports: [PrismaModule, KeystonesModule, FoundingModule],
  controllers: [HQDashboardController],
  providers: [HQDashboardService],
  exports: [HQDashboardService],
})
export class HQDashboardModule {}
