import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule } from '@sentry/nestjs/setup';
import { ThrottleExceptionFilter } from './common/filters/throttle-exception.filter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { TwoFactorService } from './auth/two-factor.service';
import { TwoFactorController } from './auth/two-factor.controller';
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
import { AdminModule } from './admin/admin.module';
import { LegalModule } from './legal/legal.module';
import { AuditLogModule } from './common/audit-log.module';
import { AuditLogFeatureModule } from './audit-log/audit-log.module';
import { TasksModule } from './tasks/tasks.module';
import { AssemblyModule } from './assembly/assembly.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    // Sentry must be first for proper instrumentation
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 60 seconds
      limit: 60,   // 60 requests per minute (global default - generous for authenticated users)
    }]),
    PrismaModule,  // Global database connection - singleton for all modules
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
    AdminModule,
    LegalModule,
    AuditLogModule,        // MEDIUM-4: Global audit logging service
    AuditLogFeatureModule, // MEDIUM-4: Audit log API endpoints
    TasksModule,           // EA Module: Task management for Pam
    AssemblyModule,        // HQ Module: Assembly document generation
    IntegrationsModule,    // Tenant-scoped integration credentials (Twilio, Calendly)
  ],
  controllers: [AppController, AuthController, TwoFactorController],
  providers: [
    AppService,
    AuthService,
    TwoFactorService,
    {
      provide: APP_GUARD,
      useClass: PublicGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottleExceptionFilter,
    },
  ],
})
export class AppModule {}
