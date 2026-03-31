import { Module } from '@nestjs/common';
import { KeystonesController } from './keystones.controller';
import { KeystonesService } from './keystones.service';

@Module({
  controllers: [KeystonesController],
  providers: [KeystonesService],
  exports: [KeystonesService],
})
export class KeystonesModule {}
