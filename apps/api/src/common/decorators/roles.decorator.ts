import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * HIGH-4: Role-Based Access Control Decorator
 *
 * Use with RolesGuard to restrict endpoint access to specific roles.
 *
 * @example
 * // Require admin or owner role
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'owner')
 * @Delete(':id')
 * async delete() { ... }
 *
 * Valid roles: 'owner', 'admin', 'manager', 'member', 'viewer'
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
