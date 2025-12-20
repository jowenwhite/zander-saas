import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { PublicGuard } from './auth/public.guard';
import { ContactsModule } from './contacts/contacts.module';
import { DealsModule } from './deals/deals.module';
import { ActivitiesModule } from './activities/activities.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { PipelineStagesModule } from './pipeline-stages/pipeline-stages.module';
import { FormsModule } from './forms/forms.module';
import { AutomationModule } from './automation/automation.module';
import { AiModule } from './ai/ai.module';
import { EmailModule } from './integrations/email/email.module';
import { EmailMessagesModule } from './email-messages/email-messages.module';
import { SmsMessagesModule } from './sms-messages/sms-messages.module';
import { CallLogsModule } from './call-logs/call-logs.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ContactsModule,
    DealsModule,
    ActivitiesModule,
    TenantsModule,
    UsersModule,
    PipelineStagesModule,
    FormsModule,
    AutomationModule,
    AiModule,
    EmailModule,
    EmailMessagesModule,
    SmsMessagesModule,
    CallLogsModule
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    PrismaService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: PublicGuard,
    }
  ],
})
export class AppModule {}
