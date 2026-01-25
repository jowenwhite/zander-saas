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
  ],
})
export class CmoModule {}
