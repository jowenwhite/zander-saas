import { Module } from '@nestjs/common';
import { DonController } from './don.controller';
import { DonService } from './don.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DonController],
  providers: [DonService, PrismaService],
})
export class DonModule {}
