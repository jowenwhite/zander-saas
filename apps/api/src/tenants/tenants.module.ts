import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { AuthService } from '../auth/auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../integrations/email/email.module';

@Module({
  imports: [ConfigModule, PrismaModule, EmailModule],
  controllers: [TenantsController],
  providers: [TenantsService, AuthService],
  exports: [TenantsService],
})
export class TenantsModule {}
