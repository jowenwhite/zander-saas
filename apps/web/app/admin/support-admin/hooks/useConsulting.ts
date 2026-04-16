'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

export interface Engagement {
  id: string;
  tenantId: string;
  packageType: string;
  startDate: string;
  endDate?: string;
  status: string;
  totalHours: number;
  hoursUsed: number;
  billableHours: number;
  stripePaymentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tenant: { companyName: string; email?: string };
  _count?: { timeEntries: number; deliverables: number };
}

export interface TimeEntry {
  id: string;
  tenantId: string;
  engagementId: string;
  date: string;
  hours: number;
  billableHours: number;
  description: string;
  category: string;
  createdAt: string;
  tenant?: { companyName: string };
  engagement?: { packageType: string };
}

export interface Deliverable {
  id: string;
  tenantId: string;
  engagementId: string;
  packageTier: string;
  name: string;
  description?: string;
  status: string;
  deliveredAt?: string;
  documentUrl?: string;
  createdAt: string;
  tenant?: { companyName: string };
  engagement?: { packageType: string };
}

export interface ConsultingOverview {
  engagements: Engagement[];
  timeEntries: TimeEntry[];
  deliverables: Deliverable[];
  summary: {
    activeEngagements: number;
    totalHoursLogged: number;
    totalBillableHours: number;
    pendingDeliverables: number;
  };
}

export function useConsulting() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('zander_token');

  const fetchEngagements = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/consulting/engagements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEngagements(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch engagements:', err);
      setError('Failed to fetch engagements');
    }
  }, []);

  const fetchTimeEntries = useCallback(async (engagementId?: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const url = engagementId
        ? `${API_URL}/consulting/time-entries?engagementId=${engagementId}`
        : `${API_URL}/consulting/time-entries`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTimeEntries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch time entries:', err);
    }
  }, []);

  const fetchDeliverables = useCallback(async (engagementId?: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const url = engagementId
        ? `${API_URL}/consulting/deliverables?engagementId=${engagementId}`
        : `${API_URL}/consulting/deliverables`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDeliverables(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch deliverables:', err);
    }
  }, []);

  const createEngagement = useCallback(async (data: {
    tenantId: string;
    packageType: string;
    startDate: string;
    totalHours?: number;
    stripePaymentId?: string;
    notes?: string;
  }) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/consulting/engagements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create engagement');
    }

    await fetchEngagements();
    return res.json();
  }, [fetchEngagements]);

  const updateEngagement = useCallback(async (id: string, data: {
    status?: string;
    hoursUsed?: number;
    notes?: string;
  }) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/consulting/engagements/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update engagement');
    }

    await fetchEngagements();
    return res.json();
  }, [fetchEngagements]);

  const createTimeEntry = useCallback(async (data: {
    tenantId: string;
    engagementId: string;
    date: string;
    hours: number;
    billableHours: number;
    description: string;
    category: string;
  }) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/consulting/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create time entry');
    }

    // Refresh both engagements (for hours update) and time entries
    await Promise.all([fetchEngagements(), fetchTimeEntries()]);
    return res.json();
  }, [fetchEngagements, fetchTimeEntries]);

  const createDeliverable = useCallback(async (data: {
    tenantId: string;
    engagementId: string;
    packageTier: string;
    name: string;
    description?: string;
  }) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/consulting/deliverables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create deliverable');
    }

    await fetchDeliverables();
    return res.json();
  }, [fetchDeliverables]);

  const updateDeliverable = useCallback(async (id: string, data: {
    status?: string;
    documentUrl?: string;
  }) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/consulting/deliverables/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update deliverable');
    }

    await fetchDeliverables();
    return res.json();
  }, [fetchDeliverables]);

  const refetch = useCallback(() => {
    return Promise.all([
      fetchEngagements(),
      fetchTimeEntries(),
      fetchDeliverables(),
    ]);
  }, [fetchEngagements, fetchTimeEntries, fetchDeliverables]);

  useEffect(() => {
    setLoading(true);
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  // Intake methods
  const fetchIntakes = useCallback(async (status?: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const url = status
        ? `${API_URL}/consulting/intakes?status=${status}`
        : `${API_URL}/consulting/intakes`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return res.json();
      }
    } catch (err) {
      console.error('Failed to fetch intakes:', err);
    }
    return [];
  }, []);

  const updateIntake = useCallback(async (id: string, data: {
    status?: string;
    notes?: string;
  }) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/consulting/intakes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update intake');
    }

    return res.json();
  }, []);

  const convertIntakeToEngagement = useCallback(async (intakeId: string, data: {
    packageType: string;
    startDate: string;
    totalHours: number;
  }) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/consulting/intakes/${intakeId}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to convert intake');
    }

    await fetchEngagements();
    return res.json();
  }, [fetchEngagements]);

  return {
    engagements,
    timeEntries,
    deliverables,
    loading,
    error,
    createEngagement,
    updateEngagement,
    createTimeEntry,
    createDeliverable,
    updateDeliverable,
    refetch,
    fetchTimeEntries,
    fetchDeliverables,
    fetchIntakes,
    updateIntake,
    convertIntakeToEngagement,
  };
}
