import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * HIGH-4: Role-Based Access Control Guard
 *
 * Validates that the authenticated user has one of the required roles.
 * Must be used after JwtAuthGuard which populates req.user.role.
 *
 * Role hierarchy (highest to lowest privilege):
 * - owner: Full access, billing management
 * - admin: User management, all CRUD operations
 * - manager: Team oversight, approvals
 * - member: Standard user, own data access
 * - viewer: Read-only access
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'owner')
 * @Delete(':id')
 * async delete() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles specified, allow access (use JwtAuthGuard alone for auth-only)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request (populated by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's role (default to 'member' if not set)
    const userRole = (user.role || 'member').toLowerCase();

    // Check if user has one of the required roles
    const hasRole = requiredRoles.some(
      (role) => role.toLowerCase() === userRole,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required role: ${requiredRoles.join(' or ')}. Your role: ${userRole}`,
      );
    }

    return true;
  }
}
