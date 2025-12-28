import { Module } from '@nestjs/common';
import { MicrosoftAuthController } from './microsoft-auth.controller';
import { MicrosoftAuthService } from './microsoft-auth.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [MicrosoftAuthController],
  providers: [MicrosoftAuthService, PrismaService],
  exports: [MicrosoftAuthService],
})
export class MicrosoftAuthModule {}
