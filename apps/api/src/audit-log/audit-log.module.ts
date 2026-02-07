// MEDIUM-4: Audit log feature module
import { Module } from '@nestjs/common';
import { AuditLogController } from './audit-log.controller';

@Module({
  controllers: [AuditLogController],
})
export class AuditLogFeatureModule {}
