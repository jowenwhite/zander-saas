import { Module, forwardRef } from '@nestjs/common';
import { SmsMessagesService } from './sms-messages.service';
import { SmsMessagesController } from './sms-messages.controller';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [forwardRef(() => IntegrationsModule)],
  controllers: [SmsMessagesController],
  providers: [SmsMessagesService],
  exports: [SmsMessagesService],
})
export class SmsMessagesModule {}
