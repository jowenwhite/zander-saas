import { Module } from '@nestjs/common';
import { MeetingIntelligenceController } from './meeting-intelligence.controller';
import { MeetingIntelligenceService } from './meeting-intelligence.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../common/s3/s3.service';

@Module({
  controllers: [MeetingIntelligenceController],
  providers: [MeetingIntelligenceService, PrismaService, S3Service],
  exports: [MeetingIntelligenceService],
})
export class MeetingIntelligenceModule {}
