import { Module } from '@nestjs/common';
import { EmailMessagesService } from './email-messages.service';
import { EmailMessagesController } from './email-messages.controller';
import { EmailModule } from '../integrations/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [EmailMessagesController],
  providers: [EmailMessagesService],
  exports: [EmailMessagesService],
})
export class EmailMessagesModule {}
