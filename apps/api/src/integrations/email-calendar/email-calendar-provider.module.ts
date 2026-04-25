import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GoogleAuthModule } from '../../auth/google/google-auth.module';
import { MicrosoftIntegrationModule } from '../microsoft/microsoft.module';
import { EmailCalendarProviderService } from './email-calendar-provider.service';

@Module({
  imports: [PrismaModule, GoogleAuthModule, MicrosoftIntegrationModule],
  providers: [EmailCalendarProviderService],
  exports: [EmailCalendarProviderService],
})
export class EmailCalendarProviderModule {}
