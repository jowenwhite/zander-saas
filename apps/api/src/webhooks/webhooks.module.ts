import { Module } from '@nestjs/common';
import { CalendlyWebhookController } from './calendly-webhook.controller';
import { EmailModule } from '../integrations/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [CalendlyWebhookController],
})
export class WebhooksModule {}
