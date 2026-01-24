import { Module } from '@nestjs/common';
import { WorkflowsModule } from './workflows/workflows.module';
import { FunnelsModule } from './funnels/funnels.module';
import { PersonasModule } from './personas/personas.module';
import { SegmentsModule } from './segments/segments.module';
import { CmoCalendarModule } from './calendar/cmo-calendar.module';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [
    WorkflowsModule,
    FunnelsModule,
    PersonasModule,
    SegmentsModule,
    CmoCalendarModule,
    AssetsModule,
  ],
  exports: [
    WorkflowsModule,
    FunnelsModule,
    PersonasModule,
    SegmentsModule,
    CmoCalendarModule,
    AssetsModule,
  ],
})
export class CmoModule {}
