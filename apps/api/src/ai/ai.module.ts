import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MeetingIntelligenceModule } from '../meeting-intelligence/meeting-intelligence.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [MeetingIntelligenceModule, PrismaModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
