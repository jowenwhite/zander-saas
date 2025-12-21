import { Module } from '@nestjs/common';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';
import { GmailService } from './gmail.service';
import { GmailController } from './gmail.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [GoogleAuthController, GmailController],
  providers: [GoogleAuthService, GmailService, PrismaService],
  exports: [GoogleAuthService, GmailService],
})
export class GoogleAuthModule {}
