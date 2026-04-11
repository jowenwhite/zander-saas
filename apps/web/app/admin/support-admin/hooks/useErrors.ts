'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  stack: string | null;
  endpoint: string | null;
  tenantId: string | null;
  userId: string | null;
  metadata: Record<string, any> | null;
  statusCode: number | null;
  method: string | null;
  responseTime: number | null;
}

export interface ErrorFilters {
  level: 'ALL' | 'ERROR' | 'WARN' | 'INFO';
  tenantId: string | null;
  statusCode: number | null;
  timeRange: '24h' | '7d' | '30d';
  search: string;
}

interface ErrorsResponse {
  success: boolean;
  data: ErrorLog[];
  total: number;
  limit: number;
  offset: number;
  byLevel: Record<string, number>;
  statusCodes: number[];
  hours: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'zander-support-2025';

const getHours = (timeRange: string): number => {
  switch (timeRange) {
    case '7d':
      return 168;
    case '30d':
      return 720;
    default:
      return 24;
  }
};

export function useErrors(filters: ErrorFilters, autoRefreshMs: number = 30000) {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [total, setTotal] = useState(0);
  const [byLevel, setByLevel] = useState<Record<string, number>>({});
  const [availableStatusCodes, setAvailableStatusCodes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchErrors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.level !== 'ALL') params.set('level', filters.level);
      if (filters.tenantId) params.set('tenantId', filters.tenantId);
      if (filters.statusCode) params.set('statusCode', filters.statusCode.toString());
      params.set('hours', getHours(filters.timeRange).toString());
      if (filters.search) params.set('search', filters.search);
      params.set('limit', '100');

      const response = await fetch(`${API_URL}/admin/errors?${params}`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch errors: ${response.status}`);
      }

      const data: ErrorsResponse = await response.json();

      if (data.success) {
        setErrors(data.data);
        setTotal(data.total);
        setByLevel(data.byLevel);
        setAvailableStatusCodes(data.statusCodes);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch errors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch errors');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchErrors();

    if (autoRefreshMs > 0) {
      const interval = setInterval(fetchErrors, autoRefreshMs);
      return () => clearInterval(interval);
    }
  }, [fetchErrors, autoRefreshMs]);

  return {
    errors,
    total,
    byLevel,
    availableStatusCodes,
    loading,
    error,
    lastUpdated,
    refresh: fetchErrors,
  };
}
