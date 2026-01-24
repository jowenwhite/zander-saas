import { Module } from '@nestjs/common';
import { PersonasController } from './personas.controller';
import { PersonasService } from './personas.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PersonasController],
  providers: [PersonasService, PrismaService],
  exports: [PersonasService],
})
export class PersonasModule {}
