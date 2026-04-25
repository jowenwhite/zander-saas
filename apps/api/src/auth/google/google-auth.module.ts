import { Module } from '@nestjs/common';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';
import { GmailService } from './gmail.service';
import { GmailController } from './gmail.controller';
import { GmailScheduler } from './gmail.scheduler';
import { MicrosoftIntegrationModule } from '../../integrations/microsoft/microsoft.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [MicrosoftIntegrationModule, PrismaModule],
  controllers: [GoogleAuthController, GmailController],
  providers: [GoogleAuthService, GmailService, GmailScheduler],
  exports: [GoogleAuthService, GmailService],
})
export class GoogleAuthModule {}
