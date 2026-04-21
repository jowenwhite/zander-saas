import { Module } from '@nestjs/common';
import { GoogleAnalyticsController } from './google-analytics.controller';
import { GoogleAnalyticsService } from './google-analytics.service';

@Module({
  controllers: [GoogleAnalyticsController],
  providers: [GoogleAnalyticsService],
  exports: [GoogleAnalyticsService],
})
export class GoogleAnalyticsModule {}
