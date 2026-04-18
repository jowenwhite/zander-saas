import { Module } from '@nestjs/common';
import { CalendlyWebhookController } from './calendly-webhook.controller';
import { EmailModule } from '../integrations/email/email.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [EmailModule, PrismaModule],
  controllers: [CalendlyWebhookController],
})
export class WebhooksModule {}
