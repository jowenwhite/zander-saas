import { Module } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEventsController } from './calendar-events.controller';
import { GoogleAuthModule } from '../auth/google/google-auth.module';
import { MicrosoftIntegrationModule } from '../integrations/microsoft/microsoft.module';

@Module({
  imports: [GoogleAuthModule, MicrosoftIntegrationModule],
  controllers: [CalendarEventsController],
  providers: [CalendarEventsService],
  exports: [CalendarEventsService],
})
export class CalendarEventsModule {}
