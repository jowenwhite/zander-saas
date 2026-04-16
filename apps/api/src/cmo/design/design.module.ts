import { Module } from '@nestjs/common';
import { DesignService } from './design.service';

@Module({
  providers: [DesignService],
  exports: [DesignService],
})
export class DesignModule {}
