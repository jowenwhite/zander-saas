import { Module } from '@nestjs/common';
import { LegacyService } from './legacy.service';
import { LegacyController } from './legacy.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LegacyController],
  providers: [LegacyService],
  exports: [LegacyService],
})
export class LegacyModule {}
