import { Module } from '@nestjs/common';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';
import { TicketNotificationService } from './ticket-notification.service';
import { TicketSLAService } from './ticket-sla.service';
import { PrismaService } from '../prisma.service';
import { EmailModule } from '../integrations/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [SupportTicketsController],
  providers: [SupportTicketsService, TicketNotificationService, TicketSLAService, PrismaService],
  exports: [SupportTicketsService, TicketSLAService],
})
export class SupportTicketsModule {}
