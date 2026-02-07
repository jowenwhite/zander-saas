// MEDIUM-4: Audit log controller for admin access
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditLogService } from '../common/services/audit-log.service';
import { SkipAuditLog } from '../common/interceptors/audit-log.interceptor';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@SkipAuditLog() // Don't audit the audit log queries
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  /**
   * Get audit logs for the tenant
   * Only admins and owners can view audit logs
   */
  @Get()
  @Roles('admin', 'owner')
  async getAuditLogs(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.auditLogService.getLogsForTenant(req.user.tenantId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      action,
      resource,
      userId,
      status,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  /**
   * Get audit log statistics for the tenant
   * Only admins and owners can view stats
   */
  @Get('stats')
  @Roles('admin', 'owner')
  async getAuditStats(
    @Request() req,
    @Query('days') days?: string,
  ) {
    return this.auditLogService.getStats(
      req.user.tenantId,
      days ? parseInt(days, 10) : 30,
    );
  }
}
