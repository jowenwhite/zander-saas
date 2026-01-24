import { Module } from '@nestjs/common';
import { FunnelsController } from './funnels.controller';
import { FunnelsService } from './funnels.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [FunnelsController],
  providers: [FunnelsService, PrismaService],
  exports: [FunnelsService],
})
export class FunnelsModule {}
