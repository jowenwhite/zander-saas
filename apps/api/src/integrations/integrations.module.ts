import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { TwilioCredentialsService } from './twilio-credentials.service';
import { CalendlyCredentialsService } from './calendly-credentials.service';
import { GoogleAnalyticsModule } from './google-analytics/google-analytics.module';
import { MetaModule } from './meta/meta.module';
import { CanvaModule } from './canva/canva.module';
import { MicrosoftIntegrationModule } from './microsoft/microsoft.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [GoogleAnalyticsModule, MetaModule, CanvaModule, MicrosoftIntegrationModule, PrismaModule],
  controllers: [IntegrationsController],
  providers: [TwilioCredentialsService, CalendlyCredentialsService],
  exports: [
    TwilioCredentialsService,
    CalendlyCredentialsService,
    GoogleAnalyticsModule,
    MetaModule,
    CanvaModule,
    MicrosoftIntegrationModule,
  ],
})
export class IntegrationsModule {}
