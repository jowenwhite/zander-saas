import { NextRequest } from 'next/server';

interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isSuperAdmin: boolean;
}

/**
 * Get authenticated user from request.
 * This extracts user info from the Authorization header by verifying
 * the token with the backend API.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  // Verify with backend API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

  try {
    const response = await fetch(`${apiUrl}/users/me`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        id: userData.id,
        tenantId: userData.tenantId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isSuperAdmin: userData.isSuperAdmin || false,
      };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
  }

  return null;
}

/**
 * Get tenant ID from request headers or auth user
 */
export async function getTenantId(request: NextRequest): Promise<string | null> {
  // First check header
  const tenantHeader = request.headers.get('x-tenant-id');
  if (tenantHeader) {
    return tenantHeader;
  }

  // Then check auth user
  const user = await getAuthUser(request);
  if (user) {
    return user.tenantId;
  }

  return null;
}
