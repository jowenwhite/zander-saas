import { Module } from '@nestjs/common';
import { ConsultingController } from './consulting.controller';
import { ConsultingService } from './consulting.service';
import { ConsultingInquiryController } from './consulting-inquiry.controller';
import { ConsultingLeadController } from './consulting-lead.controller';
import { ConsultingDocumentController } from './consulting-document.controller';
import { ConsultingEventController } from './consulting-event.controller';
import { ConsultingEmailController } from './consulting-email.controller';
import { ConsultingAutomationController } from './consulting-automation.controller';
import { ConsultingEmailService } from './consulting-email.service';
import { ConsultingBriefingService } from './consulting-briefing.service';
import { ConsultingAutomationService } from './consulting-automation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../integrations/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [
    ConsultingController,
    ConsultingInquiryController,
    ConsultingLeadController,
    ConsultingDocumentController,
    ConsultingEventController,
    ConsultingEmailController,
    ConsultingAutomationController,
  ],
  providers: [ConsultingService, ConsultingEmailService, ConsultingBriefingService, ConsultingAutomationService],
  exports: [ConsultingService, ConsultingEmailService, ConsultingBriefingService, ConsultingAutomationService],
})
export class ConsultingModule {}
