import { Module } from '@nestjs/common';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';
import { TicketNotificationService } from './ticket-notification.service';
import { PrismaService } from '../prisma.service';
import { EmailModule } from '../integrations/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [SupportTicketsController],
  providers: [SupportTicketsService, TicketNotificationService, PrismaService],
  exports: [SupportTicketsService],
})
export class SupportTicketsModule {}
