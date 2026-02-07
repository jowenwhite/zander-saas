// MEDIUM-4: Audit logging service for forensics and compliance
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  INVITE_USER = 'INVITE_USER',
  CHANGE_ROLE = 'CHANGE_ROLE',
  EXPORT_DATA = 'EXPORT_DATA',
  IMPORT_DATA = 'IMPORT_DATA',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_ENABLE = 'TWO_FACTOR_ENABLE',
  TWO_FACTOR_DISABLE = 'TWO_FACTOR_DISABLE',
}

export interface AuditLogEntry {
  tenantId: string;
  userId?: string;
  action: AuditAction | string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failure';
  errorMessage?: string;
}

export interface AuditLogQueryOptions {
  startDate?: Date;
  endDate?: Date;
  action?: string;
  resource?: string;
  userId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log an audit event
   * Never throws - audit logging should never break the main flow
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: entry.details || null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent ? entry.userAgent.substring(0, 500) : null, // Truncate long user agents
          status: entry.status || 'success',
          errorMessage: entry.errorMessage,
        },
      });
    } catch (error) {
      // Never let audit logging break the main flow
      this.logger.error('Failed to write audit log', {
        error: error instanceof Error ? error.message : String(error),
        entry: { ...entry, details: '[REDACTED]' }, // Don't log full details
      });
    }
  }

  /**
   * Query audit logs for a tenant
   * Only admins/owners should call this (enforced by controller)
   */
  async getLogsForTenant(
    tenantId: string,
    options?: AuditLogQueryOptions,
  ) {
    const where: any = { tenantId };

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }
    if (options?.action) where.action = options.action;
    if (options?.resource) where.resource = options.resource;
    if (options?.userId) where.userId = options.userId;
    if (options?.status) where.status = options.status;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 100,
        skip: options?.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        limit: options?.limit || 100,
        offset: options?.offset || 0,
        hasMore: (options?.offset || 0) + logs.length < total,
      },
    };
  }

  /**
   * Get audit log statistics for a tenant
   */
  async getStats(tenantId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalLogs,
      actionCounts,
      resourceCounts,
      failureCounts,
    ] = await Promise.all([
      this.prisma.auditLog.count({
        where: { tenantId, createdAt: { gte: startDate } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { tenantId, createdAt: { gte: startDate } },
        _count: { action: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['resource'],
        where: { tenantId, createdAt: { gte: startDate } },
        _count: { resource: true },
      }),
      this.prisma.auditLog.count({
        where: { tenantId, status: 'failure', createdAt: { gte: startDate } },
      }),
    ]);

    return {
      period: { days, startDate },
      totalLogs,
      failureCount: failureCounts,
      failureRate: totalLogs > 0 ? (failureCounts / totalLogs * 100).toFixed(2) : '0',
      byAction: actionCounts.map(a => ({ action: a.action, count: a._count.action })),
      byResource: resourceCounts.map(r => ({ resource: r.resource, count: r._count.resource })),
    };
  }
}
