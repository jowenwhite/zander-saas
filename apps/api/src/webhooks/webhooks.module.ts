import { Module } from '@nestjs/common';
import { CalendlyWebhookController } from './calendly-webhook.controller';
import { TwilioRecordingWebhookController } from './twilio-recording-webhook.controller';
import { EmailModule } from '../integrations/email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MeetingIntelligenceModule } from '../meeting-intelligence/meeting-intelligence.module';

@Module({
  imports: [EmailModule, PrismaModule, MeetingIntelligenceModule],
  controllers: [CalendlyWebhookController, TwilioRecordingWebhookController],
})
export class WebhooksModule {}
