import { Module } from '@nestjs/common';
import { DonController } from './don.controller';
import { DonService } from './don.service';
import { MeetingIntelligenceModule } from '../../meeting-intelligence/meeting-intelligence.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [MeetingIntelligenceModule, PrismaModule],
  controllers: [DonController],
  providers: [DonService],
})
export class DonModule {}
