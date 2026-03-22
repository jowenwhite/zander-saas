import { Module } from '@nestjs/common';
import { CmoCalendarController } from './cmo-calendar.controller';
import { CmoCalendarService } from './cmo-calendar.service';

@Module({
  controllers: [CmoCalendarController],
  providers: [CmoCalendarService],
  exports: [CmoCalendarService],
})
export class CmoCalendarModule {}
