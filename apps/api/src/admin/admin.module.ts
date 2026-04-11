import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ZanderWorkflowsScheduler } from './zander-workflows.scheduler';

@Module({
  controllers: [AdminController],
  providers: [AdminService, ZanderWorkflowsScheduler],
})
export class AdminModule {}
