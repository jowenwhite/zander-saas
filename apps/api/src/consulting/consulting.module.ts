import { Module } from '@nestjs/common';
import { ConsultingController } from './consulting.controller';
import { ConsultingService } from './consulting.service';
import { ConsultingInquiryController } from './consulting-inquiry.controller';
import { ConsultingLeadController } from './consulting-lead.controller';
import { ConsultingDocumentController } from './consulting-document.controller';
import { ConsultingEventController } from './consulting-event.controller';
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
  ],
  providers: [ConsultingService],
  exports: [ConsultingService],
})
export class ConsultingModule {}
