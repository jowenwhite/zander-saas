'use client';

import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
  tenantId: string;
  tenantName: string | null;
  tenantTier: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    roleOptions: Array<{ role: string; count: number }>;
  };
}

interface UseAllUsersParams {
  tenantId?: string;
  search?: string;
  role?: string;
  limit?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || '803cbd7661ec10912c7772ed12c094afbe6023ea07d1ab2c53791e8b1682501c';

export function useAllUsers(params: UseAllUsersParams = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsersResponse['pagination'] | null>(null);
  const [roleOptions, setRoleOptions] = useState<Array<{ role: string; count: number }>>([]);

  const fetchUsers = useCallback(async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params.tenantId) queryParams.set('tenantId', params.tenantId);
      if (params.search) queryParams.set('search', params.search);
      if (params.role) queryParams.set('role', params.role);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      queryParams.set('offset', offset.toString());

      const response = await fetch(`${API_URL}/admin/all-users?${queryParams.toString()}`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data: UsersResponse = await response.json();
      if (data.success) {
        if (offset === 0) {
          setUsers(data.data);
        } else {
          setUsers(prev => [...prev, ...data.data]);
        }
        setPagination(data.pagination);
        setRoleOptions(data.filters.roleOptions);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [params.tenantId, params.search, params.role, params.limit]);

  useEffect(() => {
    fetchUsers(0);
  }, [fetchUsers]);

  const loadMore = () => {
    if (pagination?.hasMore) {
      fetchUsers(pagination.offset + pagination.limit);
    }
  };

  const updateUser = async (
    userId: string,
    data: { tenantId?: string; role?: string }
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update user');
      }

      // Refresh the list
      await fetchUsers(0);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    pagination,
    roleOptions,
    refresh: () => fetchUsers(0),
    loadMore,
    updateUser,
  };
}
