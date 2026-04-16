import { Module } from '@nestjs/common';
import { WorkflowsModule } from './workflows/workflows.module';
import { FunnelsModule } from './funnels/funnels.module';
import { PersonasModule } from './personas/personas.module';
import { SegmentsModule } from './segments/segments.module';
import { CmoCalendarModule } from './calendar/cmo-calendar.module';
import { AssetsModule } from './assets/assets.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InsightsModule } from './insights/insights.module';
import { DonModule } from './don/don.module';
import { TemplatesModule } from './templates/templates.module';
import { MarketingPlanModule } from './marketing-plan/marketing-plan.module';
import { SocialModule } from './social/social.module';
import { DesignModule } from './design/design.module';

@Module({
  imports: [
    WorkflowsModule,
    FunnelsModule,
    PersonasModule,
    SegmentsModule,
    CmoCalendarModule,
    AssetsModule,
    DashboardModule,
    AnalyticsModule,
    InsightsModule,
    DonModule,
    TemplatesModule,
    MarketingPlanModule,
    SocialModule,
    DesignModule,
  ],
  exports: [
    WorkflowsModule,
    FunnelsModule,
    PersonasModule,
    SegmentsModule,
    CmoCalendarModule,
    AssetsModule,
    DashboardModule,
    AnalyticsModule,
    InsightsModule,
    DonModule,
    TemplatesModule,
    MarketingPlanModule,
    SocialModule,
    DesignModule,
  ],
})
export class CmoModule {}
