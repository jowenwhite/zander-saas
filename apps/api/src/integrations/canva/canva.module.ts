import { Module } from '@nestjs/common';
import { CanvaService } from './canva.service';
import { CanvaController } from './canva.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CanvaController],
  providers: [CanvaService],
  exports: [CanvaService],
})
export class CanvaModule {}
