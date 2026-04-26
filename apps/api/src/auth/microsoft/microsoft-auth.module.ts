import { Module } from '@nestjs/common';
import { MicrosoftAuthService } from './microsoft-auth.service';
import { OutlookController } from './outlook.controller';
import { OutlookService } from './outlook.service';

@Module({
  controllers: [OutlookController],
  providers: [MicrosoftAuthService, OutlookService],
  exports: [MicrosoftAuthService, OutlookService],
})
export class MicrosoftAuthModule {}
