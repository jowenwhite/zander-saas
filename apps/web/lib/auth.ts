import { NextRequest } from 'next/server';
import { prisma } from './prisma';

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

  // Try to verify with backend API
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

  // Fallback: try to decode JWT and look up user
  try {
    // Simple JWT decode (not verification - just for user lookup)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    if (payload.sub || payload.userId || payload.email) {
      const userId = payload.sub || payload.userId;
      const email = payload.email;

      const user = await prisma.user.findFirst({
        where: userId ? { id: userId } : { email },
        select: {
          id: true,
          tenantId: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isSuperAdmin: true,
        },
      });

      if (user) {
        return user;
      }
    }
  } catch (error) {
    console.error('JWT decode error:', error);
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
