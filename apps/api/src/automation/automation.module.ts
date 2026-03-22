import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { EmailModule } from '../integrations/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [AutomationController],
  providers: [AutomationService],
})
export class AutomationModule {}
