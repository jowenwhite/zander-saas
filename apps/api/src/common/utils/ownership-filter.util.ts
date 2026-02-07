/**
 * HIGH-3: User-Level Data Isolation Utilities
 *
 * Provides helper functions to filter queries based on user role and ownership.
 *
 * Role hierarchy:
 * - owner/admin: See all tenant data
 * - manager: See team data (future enhancement - currently treated as member)
 * - member: See only owned/assigned records
 */

export type OwnershipFilterOptions = {
  tenantId: string;
  userId: string;
  userRole: string;
};

export type OwnershipFields = {
  ownerField?: string;
  assignedField?: string;
};

/**
 * Get Prisma where clause for ownership-based filtering
 *
 * @param options - User context (tenantId, userId, role)
 * @param fields - Ownership field configuration
 * @returns Prisma where clause
 *
 * @example
 * // For deals (has ownerId and assignedToId)
 * const where = getOwnershipFilter(
 *   { tenantId: 'abc', userId: '123', userRole: 'member' },
 *   { ownerField: 'ownerId', assignedField: 'assignedToId' }
 * );
 * // Returns: { tenantId: 'abc', OR: [{ ownerId: '123' }, { assignedToId: '123' }] }
 *
 * // For emails (has userId only)
 * const where = getOwnershipFilter(
 *   { tenantId: 'abc', userId: '123', userRole: 'member' },
 *   { ownerField: 'userId' }
 * );
 * // Returns: { tenantId: 'abc', userId: '123' }
 */
export function getOwnershipFilter(
  options: OwnershipFilterOptions,
  fields: OwnershipFields = {}
): Record<string, any> {
  const { tenantId, userId, userRole } = options;
  const { ownerField, assignedField } = fields;

  // Admin and owner roles see all tenant data
  const adminRoles = ['admin', 'owner'];
  if (adminRoles.includes(userRole?.toLowerCase())) {
    return { tenantId };
  }

  // Manager role - for now, treat as member (team filtering is future enhancement)
  // Member role - see only owned/assigned records
  const ownershipFilters: Record<string, string>[] = [];

  if (ownerField) {
    ownershipFilters.push({ [ownerField]: userId });
  }

  if (assignedField) {
    ownershipFilters.push({ [assignedField]: userId });
  }

  // If no ownership fields specified, fall back to tenant only
  // This maintains backward compatibility for services without ownership fields
  if (ownershipFilters.length === 0) {
    return { tenantId };
  }

  // Single ownership field - simple filter
  if (ownershipFilters.length === 1) {
    return {
      tenantId,
      ...ownershipFilters[0],
    };
  }

  // Multiple ownership fields - use OR (owner OR assigned)
  return {
    tenantId,
    OR: ownershipFilters,
  };
}

/**
 * Check if user has permission to access a specific record
 *
 * @param record - The record to check (must have tenantId and ownership fields)
 * @param options - User context
 * @param fields - Ownership field names
 * @returns true if user can access the record
 */
export function canAccessRecord(
  record: Record<string, any>,
  options: OwnershipFilterOptions,
  fields: OwnershipFields = {}
): boolean {
  const { tenantId, userId, userRole } = options;
  const { ownerField, assignedField } = fields;

  // Check tenant isolation first - this is mandatory
  if (record.tenantId !== tenantId) {
    return false;
  }

  // Admin and owner can access all tenant records
  const adminRoles = ['admin', 'owner'];
  if (adminRoles.includes(userRole?.toLowerCase())) {
    return true;
  }

  // Check ownership - user must be owner OR assigned
  if (ownerField && record[ownerField] === userId) {
    return true;
  }

  if (assignedField && record[assignedField] === userId) {
    return true;
  }

  // If no ownership fields defined, allow access (backward compatibility)
  if (!ownerField && !assignedField) {
    return true;
  }

  return false;
}

/**
 * Merge ownership filter with additional query filters
 * Handles the case where query might already have OR conditions
 *
 * @param ownershipWhere - Result from getOwnershipFilter
 * @param additionalFilters - Additional Prisma where conditions
 * @returns Merged where clause
 */
export function mergeFilters(
  ownershipWhere: Record<string, any>,
  additionalFilters: Record<string, any>
): Record<string, any> {
  // If additional filters have OR and ownership also has OR, combine with AND
  if (ownershipWhere.OR && additionalFilters.OR) {
    const { OR: ownershipOR, ...ownershipRest } = ownershipWhere;
    const { OR: additionalOR, ...additionalRest } = additionalFilters;

    return {
      ...ownershipRest,
      ...additionalRest,
      AND: [
        { OR: ownershipOR },
        { OR: additionalOR }
      ]
    };
  }

  // Simple merge for non-conflicting cases
  return {
    ...ownershipWhere,
    ...additionalFilters
  };
}
