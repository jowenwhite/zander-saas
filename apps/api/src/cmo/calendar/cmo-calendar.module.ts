import { Module } from '@nestjs/common';
import { CmoCalendarController } from './cmo-calendar.controller';
import { CmoCalendarService } from './cmo-calendar.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [CmoCalendarController],
  providers: [CmoCalendarService, PrismaService],
  exports: [CmoCalendarService],
})
export class CmoCalendarModule {}
