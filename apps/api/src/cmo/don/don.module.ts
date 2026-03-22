import { Module } from '@nestjs/common';
import { DonController } from './don.controller';
import { DonService } from './don.service';

@Module({
  controllers: [DonController],
  providers: [DonService],
})
export class DonModule {}
