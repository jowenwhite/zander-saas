'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ActivityEvent {
  id: string;
  type: 'signup' | 'tier_change' | 'token_spike' | 'error' | 'zander_action' | 'tenant_management';
  timestamp: string;
  tenantId: string | null;
  tenantName: string | null;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  metadata: Record<string, any>;
}

interface ActivityFeedResponse {
  success: boolean;
  data: ActivityEvent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    eventTypes: string[];
    typeCounts: Record<string, number>;
  };
  timeRange: {
    hours: number;
    startDate: string;
    endDate: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || '803cbd7661ec10912c7772ed12c094afbe6023ea07d1ab2c53791e8b1682501c';

export function useActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFeedResponse['filters'] | null>(null);
  const [pagination, setPagination] = useState<ActivityFeedResponse['pagination'] | null>(null);
  const [timeRange, setTimeRange] = useState<ActivityFeedResponse['timeRange'] | null>(null);

  // Filter state
  const [eventType, setEventType] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [hours, setHours] = useState(24);

  const fetchActivities = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('hours', hours.toString());
      params.set('limit', '50');
      if (eventType) params.set('eventType', eventType);
      if (tenantId) params.set('tenantId', tenantId);
      if (!reset && pagination) {
        params.set('offset', (pagination.offset + pagination.limit).toString());
      }

      const response = await fetch(`${API_URL}/admin/activity-feed?${params.toString()}`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activity feed: ${response.status}`);
      }

      const data: ActivityFeedResponse = await response.json();
      if (data.success) {
        if (reset || !pagination) {
          setActivities(data.data);
        } else {
          setActivities(prev => [...prev, ...data.data]);
        }
        setFilters(data.filters);
        setPagination(data.pagination);
        setTimeRange(data.timeRange);
      } else {
        throw new Error('Failed to fetch activity feed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity feed');
    } finally {
      setLoading(false);
    }
  }, [eventType, tenantId, hours, pagination]);

  // Initial fetch
  useEffect(() => {
    fetchActivities(true);
  }, [eventType, tenantId, hours]);

  const refresh = useCallback(() => {
    fetchActivities(true);
  }, [fetchActivities]);

  const loadMore = useCallback(() => {
    if (pagination?.hasMore) {
      fetchActivities(false);
    }
  }, [pagination, fetchActivities]);

  return {
    activities,
    loading,
    error,
    filters,
    pagination,
    timeRange,
    eventType,
    setEventType,
    tenantId,
    setTenantId,
    hours,
    setHours,
    refresh,
    loadMore,
  };
}
