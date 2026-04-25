import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { MicrosoftOAuthController } from './microsoft-oauth.controller';
import { MicrosoftOAuthService } from './microsoft-oauth.service';
import { MicrosoftGraphService } from './microsoft-graph.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [MicrosoftOAuthController],
  providers: [MicrosoftOAuthService, MicrosoftGraphService],
  exports: [MicrosoftOAuthService, MicrosoftGraphService],
})
export class MicrosoftIntegrationModule {}
