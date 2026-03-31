import { Module } from '@nestjs/common';
import { FoundingService } from './founding.service';
import { FoundingController } from './founding.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FoundingController],
  providers: [FoundingService],
  exports: [FoundingService],
})
export class FoundingModule {}
