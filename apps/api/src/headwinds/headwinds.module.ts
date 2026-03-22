import { Module } from '@nestjs/common';
import { HeadwindsController } from './headwinds.controller';
import { HeadwindsService } from './headwinds.service';

@Module({
  controllers: [HeadwindsController],
  providers: [HeadwindsService],
  exports: [HeadwindsService],
})
export class HeadwindsModule {}
