// MEDIUM-4: Audit log module
import { Module, Global } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditLogService } from './services/audit-log.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

@Global()
@Module({
  providers: [PrismaService, AuditLogService, AuditLogInterceptor],
  exports: [AuditLogService, AuditLogInterceptor],
})
export class AuditLogModule {}
