import { Module } from '@nestjs/common';
import { MicrosoftAuthController } from './microsoft-auth.controller';
import { MicrosoftAuthService } from './microsoft-auth.service';
import { OutlookController } from './outlook.controller';
import { OutlookService } from './outlook.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [MicrosoftAuthController, OutlookController],
  providers: [MicrosoftAuthService, OutlookService, PrismaService],
  exports: [MicrosoftAuthService, OutlookService],
})
export class MicrosoftAuthModule {}
