import { Module } from '@nestjs/common';
import { ConsultingController } from './consulting.controller';
import { ConsultingService } from './consulting.service';
import { ConsultingInquiryController } from './consulting-inquiry.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../integrations/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [ConsultingController, ConsultingInquiryController],
  providers: [ConsultingService],
  exports: [ConsultingService],
})
export class ConsultingModule {}
