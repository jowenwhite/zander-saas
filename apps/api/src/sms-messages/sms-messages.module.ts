import { Module } from '@nestjs/common';
import { SmsMessagesService } from './sms-messages.service';
import { SmsMessagesController } from './sms-messages.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SmsMessagesController],
  providers: [SmsMessagesService, PrismaService],
  exports: [SmsMessagesService],
})
export class SmsMessagesModule {}
