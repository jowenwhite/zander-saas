import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MeetingIntelligenceModule } from '../meeting-intelligence/meeting-intelligence.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConsultingModule } from '../consulting/consulting.module';

@Module({
  imports: [MeetingIntelligenceModule, PrismaModule, ConsultingModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
