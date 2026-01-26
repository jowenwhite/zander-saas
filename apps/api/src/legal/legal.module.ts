import { Module } from '@nestjs/common';
import { LegalService } from './legal.service';
import { LegalController } from './legal.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [LegalController],
  providers: [LegalService, PrismaService],
  exports: [LegalService],
})
export class LegalModule {}
