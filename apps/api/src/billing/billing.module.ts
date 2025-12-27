import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { WebhookController } from './webhook.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BillingController, WebhookController],
  providers: [BillingService, PrismaService],
  exports: [BillingService],
})
export class BillingModule {}
