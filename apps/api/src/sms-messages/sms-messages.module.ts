import { Module } from '@nestjs/common';
import { SmsMessagesService } from './sms-messages.service';
import { SmsMessagesController } from './sms-messages.controller';

@Module({
  controllers: [SmsMessagesController],
  providers: [SmsMessagesService],
  exports: [SmsMessagesService],
})
export class SmsMessagesModule {}
