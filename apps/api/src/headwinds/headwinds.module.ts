import { Module } from '@nestjs/common';
import { HeadwindsController } from './headwinds.controller';
import { HeadwindsService } from './headwinds.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HeadwindsController],
  providers: [HeadwindsService, PrismaService],
  exports: [HeadwindsService],
})
export class HeadwindsModule {}
