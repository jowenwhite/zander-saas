import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [ConfigModule],
  controllers: [TenantsController],
  providers: [TenantsService, PrismaService, AuthService],
  exports: [TenantsService],
})
export class TenantsModule {}
