import { Module } from '@nestjs/common';
import { DesignService } from './design.service';
import { DesignAssetsController } from './design.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DesignAssetsController],
  providers: [DesignService],
  exports: [DesignService],
})
export class DesignModule {}
