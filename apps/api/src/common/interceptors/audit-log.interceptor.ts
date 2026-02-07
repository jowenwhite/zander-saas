// MEDIUM-4: Audit log interceptor for automatic operation logging
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditLogService, AuditAction } from '../services/audit-log.service';
import { Reflector } from '@nestjs/core';

export const AUDIT_LOG_KEY = 'auditLog';
export const SKIP_AUDIT_LOG_KEY = 'skipAuditLog';

/**
 * Decorator to specify the resource name for audit logging
 * @example @AuditLog('deals')
 */
export const AuditLog = (resource: string) =>
  SetMetadata(AUDIT_LOG_KEY, resource);

/**
 * Decorator to skip audit logging for specific endpoints
 * @example @SkipAuditLog()
 */
export const SkipAuditLog = () => SetMetadata(SKIP_AUDIT_LOG_KEY, true);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private auditLogService: AuditLogService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit mutating operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Check if audit logging should be skipped
    const skipAudit = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUDIT_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipAudit) {
      return next.handle();
    }

    // Get resource name from decorator or derive from controller name
    const resource =
      this.reflector.get<string>(AUDIT_LOG_KEY, context.getHandler()) ||
      this.reflector.get<string>(AUDIT_LOG_KEY, context.getClass()) ||
      this.deriveResourceName(context.getClass().name);

    const user = request.user;
    const resourceId = request.params?.id;
    const startTime = Date.now();
    const action = this.methodToAction(method);

    return next.handle().pipe(
      tap((response) => {
        // Only log if we have tenant context
        if (user?.tenantId) {
          this.auditLogService.log({
            tenantId: user.tenantId,
            userId: user.userId || user.sub,
            action,
            resource,
            resourceId: resourceId || response?.id || response?.data?.id,
            details: {
              body: this.sanitizeBody(request.body),
              duration: Date.now() - startTime,
              responseId: response?.id || response?.data?.id,
            },
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'],
            status: 'success',
          });
        }
      }),
      catchError((error) => {
        // Log failed operations
        if (user?.tenantId) {
          this.auditLogService.log({
            tenantId: user.tenantId,
            userId: user.userId || user.sub,
            action,
            resource,
            resourceId,
            details: {
              body: this.sanitizeBody(request.body),
              duration: Date.now() - startTime,
            },
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'],
            status: 'failure',
            errorMessage: error.message,
          });
        }
        throw error;
      }),
    );
  }

  private methodToAction(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.UPDATE;
    }
  }

  private deriveResourceName(controllerName: string): string {
    // DealsController -> deals
    // EmailMessagesController -> email-messages
    return controllerName
      .replace('Controller', '')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  private getClientIp(request: any): string | undefined {
    return (
      request.ip ||
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.connection?.remoteAddress
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    const sanitized = { ...body };

    // SECURITY: Remove sensitive fields - never log passwords or tokens
    const sensitiveFields = [
      'password',
      'currentPassword',
      'newPassword',
      'confirmPassword',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'apiSecret',
      'twoFactorSecret',
      'resetToken',
      'stripeToken',
      'cardNumber',
      'cvv',
      'ssn',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field] !== undefined) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Recursively sanitize nested objects (one level deep)
    for (const key of Object.keys(sanitized)) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sensitiveFields.forEach((field) => {
          if (sanitized[key][field] !== undefined) {
            sanitized[key][field] = '[REDACTED]';
          }
        });
      }
    }

    return sanitized;
  }
}
