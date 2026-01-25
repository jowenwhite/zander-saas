import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { PublicGuard } from './auth/public.guard';
import { S3Module } from './common/s3/s3.module';
import { StorageModule } from './common/storage/storage.module';
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
import { CalendarEventsModule } from './calendar-events/calendar-events.module';
import { GoogleAuthModule } from './auth/google/google-auth.module';
import { MicrosoftAuthModule } from './auth/microsoft/microsoft-auth.module';
import { ProductsModule } from './products/products.module';
import { BillingModule } from './billing/billing.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { TreasuryModule } from './treasury/treasury.module';
import { HeadwindsModule } from './headwinds/headwinds.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { CmoModule } from './cmo/cmo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    S3Module,
    StorageModule,
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
    CallLogsModule,
    CalendarEventsModule,
    GoogleAuthModule,
    MicrosoftAuthModule,
    ProductsModule,
    BillingModule,
    CampaignsModule,
    TreasuryModule,
    HeadwindsModule,
    SupportTicketsModule,
    KnowledgeModule,
    CmoModule,
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
