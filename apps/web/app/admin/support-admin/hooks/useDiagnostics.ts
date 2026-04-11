'use client';

import { useState, useEffect, useCallback } from 'react';

export interface HealthHistoryPoint {
  timestamp: string;
  apiResponseTime: number;
  databaseLatency: number;
  p95ResponseTime: number;
  errorRate: number;
  overallStatus: string;
  apiHealthy: boolean;
  databaseHealthy: boolean;
  emailHealthy: boolean;
  stripeHealthy: boolean;
}

interface HealthHistoryResponse {
  success: boolean;
  hours: number;
  count: number;
  data: HealthHistoryPoint[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'zander-support-2025';

export function useDiagnostics(days: number = 7) {
  const [history, setHistory] = useState<HealthHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const hours = days * 24;

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/admin/health/history?hours=${hours}`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch health history: ${response.status}`);
      }

      const data: HealthHistoryResponse = await response.json();

      if (data.success) {
        setHistory(data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch health history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health history');
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Compute aggregated statistics
  const stats = {
    avgApiResponseTime:
      history.length > 0
        ? Math.round(history.reduce((sum, h) => sum + h.apiResponseTime, 0) / history.length)
        : 0,
    avgDbLatency:
      history.length > 0
        ? Math.round(history.reduce((sum, h) => sum + h.databaseLatency, 0) / history.length)
        : 0,
    avgErrorRate:
      history.length > 0
        ? (history.reduce((sum, h) => sum + h.errorRate, 0) / history.length).toFixed(2)
        : '0.00',
    maxApiResponseTime: history.length > 0 ? Math.max(...history.map((h) => h.apiResponseTime)) : 0,
    maxErrorRate: history.length > 0 ? Math.max(...history.map((h) => h.errorRate)) : 0,
    healthyCount: history.filter((h) => h.overallStatus === 'HEALTHY').length,
    degradedCount: history.filter((h) => h.overallStatus === 'DEGRADED').length,
    downCount: history.filter((h) => h.overallStatus === 'DOWN').length,
    uptimePercent:
      history.length > 0
        ? ((history.filter((h) => h.overallStatus === 'HEALTHY').length / history.length) * 100).toFixed(1)
        : '100.0',
  };

  return {
    history,
    stats,
    loading,
    error,
    lastUpdated,
    refresh: fetchHistory,
  };
}
