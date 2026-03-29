import { Module } from '@nestjs/common';
import { EmailSignaturesController } from './email-signatures.controller';
import { EmailSignaturesService } from './email-signatures.service';

@Module({
  controllers: [EmailSignaturesController],
  providers: [EmailSignaturesService],
  exports: [EmailSignaturesService],
})
export class EmailSignaturesModule {}
