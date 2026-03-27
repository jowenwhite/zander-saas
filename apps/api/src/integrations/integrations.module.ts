import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { TwilioCredentialsService } from './twilio-credentials.service';
import { CalendlyCredentialsService } from './calendly-credentials.service';

@Module({
  controllers: [IntegrationsController],
  providers: [TwilioCredentialsService, CalendlyCredentialsService],
  exports: [TwilioCredentialsService, CalendlyCredentialsService],
})
export class IntegrationsModule {}
