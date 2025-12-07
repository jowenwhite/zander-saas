import { APP_GUARD } from '@nestjs/core';
import { PublicGuard } from './auth/public.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { ContactsModule } from './contacts/contacts.module';
import { DealsModule } from './deals/deals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available throughout the app
      envFilePath: '.env',
    }),
    ContactsModule, 
    DealsModule
  ],
  controllers: [AppController, AuthController],
  providers: [
  AppService, 
  PrismaService, 
  AuthService,
  {
    provide: APP_GUARD,
    useClass: PublicGuard,
  },
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  }
],

export class AppModule {}
