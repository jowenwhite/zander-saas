import { Module } from '@nestjs/common';
import { SmsMessagesService } from './sms-messages.service';
import { SmsMessagesController } from './sms-messages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SmsMessagesController],
  providers: [SmsMessagesService],
  exports: [SmsMessagesService],
})
export class SmsMessagesModule {}
