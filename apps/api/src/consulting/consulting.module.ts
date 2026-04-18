import { Module } from '@nestjs/common';
import { ConsultingController } from './consulting.controller';
import { ConsultingService } from './consulting.service';
import { ConsultingInquiryController } from './consulting-inquiry.controller';
import { ConsultingLeadController } from './consulting-lead.controller';
import { ConsultingDocumentController } from './consulting-document.controller';
import { ConsultingEventController } from './consulting-event.controller';
import { ConsultingEmailController } from './consulting-email.controller';
import { ConsultingEmailService } from './consulting-email.service';
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
  ],
  providers: [ConsultingService, ConsultingEmailService],
  exports: [ConsultingService, ConsultingEmailService],
})
export class ConsultingModule {}
