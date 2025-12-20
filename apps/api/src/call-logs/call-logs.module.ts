import { Module } from '@nestjs/common';
import { CallLogsService } from './call-logs.service';
import { CallLogsController } from './call-logs.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CallLogsController],
  providers: [CallLogsService, PrismaService],
  exports: [CallLogsService],
})
export class CallLogsModule {}
