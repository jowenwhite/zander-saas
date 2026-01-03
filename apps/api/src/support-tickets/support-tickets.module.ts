import { Module } from '@nestjs/common';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SupportTicketsController],
  providers: [SupportTicketsService, PrismaService],
  exports: [SupportTicketsService],
})
export class SupportTicketsModule {}
