import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { WebhookController } from './webhook.controller';
import { EmailModule } from '../integrations/email/email.module';
import { ConsultingModule } from '../consulting/consulting.module';

@Module({
  imports: [EmailModule, ConsultingModule],
  controllers: [BillingController, WebhookController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
