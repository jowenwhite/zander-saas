'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || '';

export interface ServiceHealth {
  healthy: boolean;
  responseTime?: number;
  uptime?: number;
  lastChecked?: string;
  latency?: number;
  connections?: number;
  maxConnections?: number;
  lastTestAt?: string;
  deliveryRate?: number;
}

export interface HealthAlert {
  level: 'WARNING' | 'ERROR' | 'CRITICAL';
  service: string;
  message: string;
}

export interface HealthMetrics {
  totalTenants: number;
  totalActiveUsers: number;
  totalRequests: number;
  totalTokensUsed: number;
  p95ResponseTime: number;
  errorRatePercent: number;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  checkDurationMs: number;
  services: {
    api: ServiceHealth;
    database: ServiceHealth;
    email: ServiceHealth;
    stripe: ServiceHealth;
  };
  metrics: HealthMetrics;
  alerts: HealthAlert[];
}

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

export function useHealth(pollInterval: number = 5000) {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [history, setHistory] = useState<HealthHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/health/system`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setHealth(data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error(data.error || 'Health check failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health');
      // Keep previous health data if available, just mark as potentially stale
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/health/history?hours=24`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET,
        },
      });

      if (!response.ok) {
        return; // Silently fail history fetch
      }

      const data = await response.json();
      if (data.success && data.data) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch health history:', err);
    }
  }, []);

  // Format lastUpdated as relative time
  const getRelativeTime = useCallback(() => {
    if (!lastUpdated) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 5) return 'Just now';
    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} minutes ago`;
    return lastUpdated.toLocaleTimeString();
  }, [lastUpdated]);

  useEffect(() => {
    // Initial fetch
    fetchHealth();
    fetchHistory();

    // Set up polling
    const healthInterval = setInterval(fetchHealth, pollInterval);
    const historyInterval = setInterval(fetchHistory, 60000); // History every minute

    return () => {
      clearInterval(healthInterval);
      clearInterval(historyInterval);
    };
  }, [fetchHealth, fetchHistory, pollInterval]);

  return {
    health,
    history,
    loading,
    error,
    lastUpdated,
    getRelativeTime,
    refresh: fetchHealth,
  };
}
