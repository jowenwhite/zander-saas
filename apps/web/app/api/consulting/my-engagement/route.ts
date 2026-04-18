import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Type definitions for API responses
interface Engagement {
  id: string;
  status: string;
  packageType: string;
  totalHours: number;
  hoursUsed: number;
  billableHours?: number;
  startDate: string;
  endDate?: string;
  notes?: string;
  pillarScores?: Record<string, number>;
  snapshotScores?: Array<{ date: string; scores: Record<string, number> }>;
}

interface Deliverable {
  id: string;
  name: string;
  status?: string;
}

interface Document {
  id: string;
  type: string;
  documentName: string;
  isSigned?: boolean;
}

interface Meeting {
  id: string;
  title: string;
  scheduledAt?: string;
  durationMinutes?: number;
  platform?: string;
  summaryStatus: string;
  summaryText?: string;
  summaryJson?: {
    keyDecisions?: Array<{ decision: string; impact?: string }>;
    actionItems?: Array<{ task: string; assignee?: string; dueDate?: string }>;
    followUps?: string[];
    nextSteps?: string[];
  };
  createdAt: string;
}

/**
 * GET /api/consulting/my-engagement
 *
 * Client-facing endpoint that returns the current tenant's consulting engagement
 * along with documents, deliverables, and time entries.
 *
 * This is a BFF (Backend-For-Frontend) route that aggregates data from
 * multiple backend endpoints into a single response for the client portal.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const tenantId = request.headers.get('x-tenant-id');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const headers = {
      'Authorization': authHeader,
      'x-tenant-id': tenantId || '',
      'Content-Type': 'application/json',
    };

    // Fetch engagement, deliverables, time entries, documents, and meetings in parallel
    const [engagementsRes, deliverablesRes, timeEntriesRes, documentsRes] = await Promise.all([
      fetch(`${API_URL}/consulting/engagements`, { headers }),
      fetch(`${API_URL}/consulting/deliverables`, { headers }),
      fetch(`${API_URL}/consulting/time-entries?limit=20`, { headers }),
      // Documents endpoint - we'll handle this specially since it may be restricted
      fetch(`${API_URL}/consulting/documents`, { headers }).catch(() => null),
    ]);

    // Parse engagement first to get ID for meetings fetch
    let engagement: Engagement | null = null;
    if (engagementsRes.ok) {
      const engagements: Engagement[] = await engagementsRes.json();
      if (Array.isArray(engagements) && engagements.length > 0) {
        engagement = engagements.find((e) => e.status === 'ACTIVE') || engagements[0];
      }
    }

    // Fetch meetings separately after we have the engagement ID
    let meetings: Meeting[] = [];
    if (engagement?.id) {
      try {
        const meetingsRes = await fetch(
          `${API_URL}/meetings?engagementId=${engagement.id}&limit=20`,
          { headers }
        );
        if (meetingsRes.ok) {
          const data = await meetingsRes.json();
          meetings = Array.isArray(data) ? data : [];
        }
      } catch {
        // Meetings endpoint may not be accessible to clients, that's OK
      }
    }

    // Parse deliverables
    let deliverables: Deliverable[] = [];
    if (deliverablesRes.ok) {
      const data = await deliverablesRes.json();
      deliverables = Array.isArray(data) ? data : [];
    }

    // Parse time entries
    let timeEntries: Record<string, unknown>[] = [];
    if (timeEntriesRes.ok) {
      const data = await timeEntriesRes.json();
      timeEntries = Array.isArray(data) ? data : [];
    }

    // Parse documents - may fail if restricted, that's OK
    let documents: Document[] = [];
    if (documentsRes && documentsRes.ok) {
      const data = await documentsRes.json();
      documents = Array.isArray(data) ? data : [];
    }

    // Calculate engagement metrics
    let hoursProgress = 0;
    let hoursRemaining = 0;
    let daysUntilExpiration = null;
    let isExpiringSoon = false;

    if (engagement) {
      const totalHours = engagement.totalHours || 0;
      const hoursUsed = engagement.hoursUsed || 0;
      hoursProgress = totalHours > 0 ? Math.round((hoursUsed / totalHours) * 100) : 0;
      hoursRemaining = Math.max(0, totalHours - hoursUsed);

      // Calculate expiration
      if (engagement.endDate) {
        const endDate = new Date(engagement.endDate);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isExpiringSoon = daysUntilExpiration <= 30 && daysUntilExpiration > 0;
      }
    }

    // Separate pending vs signed documents
    const pendingDocuments = documents.filter((d) => !d.isSigned);
    const signedDocuments = documents.filter((d) => d.isSigned);

    // Count deliverable statuses
    const deliverableStats = {
      pending: deliverables.filter((d) => d.status === 'PENDING').length,
      inProgress: deliverables.filter((d) => d.status === 'IN_PROGRESS').length,
      delivered: deliverables.filter((d) => d.status === 'DELIVERED').length,
    };

    return NextResponse.json({
      success: true,
      engagement: engagement ? {
        id: engagement.id,
        packageType: engagement.packageType,
        status: engagement.status,
        totalHours: engagement.totalHours,
        hoursUsed: engagement.hoursUsed,
        billableHours: engagement.billableHours,
        hoursRemaining,
        hoursProgress,
        startDate: engagement.startDate,
        endDate: engagement.endDate,
        daysUntilExpiration,
        isExpiringSoon,
        notes: engagement.notes,
        pillarScores: engagement.pillarScores,
        snapshotScores: engagement.snapshotScores,
      } : null,
      deliverables,
      deliverableStats,
      timeEntries,
      documents: {
        pending: pendingDocuments,
        signed: signedDocuments,
      },
      meetings,
      meetingStats: {
        total: meetings.length,
        withSummary: meetings.filter((m) => m.summaryStatus === 'completed').length,
        processing: meetings.filter((m) => m.summaryStatus === 'processing').length,
      },
      hasActiveEngagement: engagement?.status === 'ACTIVE',
    });
  } catch (error) {
    console.error('Error fetching client engagement data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engagement data' },
      { status: 500 }
    );
  }
}
