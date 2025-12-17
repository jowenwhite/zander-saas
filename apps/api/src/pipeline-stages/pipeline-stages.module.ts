import { Module } from '@nestjs/common';
import { PipelineStagesController } from './pipeline-stages.controller';
import { PipelineStagesService } from './pipeline-stages.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PipelineStagesController],
  providers: [PipelineStagesService, PrismaService],
  exports: [PipelineStagesService],
})
export class PipelineStagesModule {}
