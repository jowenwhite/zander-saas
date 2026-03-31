import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KeystonesService } from '../keystones/keystones.service';
import { FoundingService } from '../founding/founding.service';

interface DashboardSummary {
  activeHeadwinds: number;
  completedThisMonth: number;
  totalVictories: number;
  nextMeeting?: {
    id: string;
    title: string;
    startTime: string;
  };
  campaignProgress: number;
  upcomingMilestoneYear?: number;
}

interface DashboardPayload {
  summary: DashboardSummary;
  keystones: any[];
  headwinds: any[];
  victories: any[];
  horizonItems: any[];
  upcomingMeetings: any[];
  pastMeetings: any[];
  meetingTemplates: any[];
  goals: {
    personal: any[];
    quarterly: any[];
    annual: any[];
  };
  ledgerEntries: any[];
  foundingDocument: any;
  legacyMilestones: any[];
  isEmpty: boolean;
}

@Injectable()
export class HQDashboardService {
  constructor(
    private prisma: PrismaService,
    private keystonesService: KeystonesService,
    private foundingService: FoundingService,
  ) {}

  /**
   * Fetch all HQ data in parallel for dashboard
   */
  async getDashboard(tenantId: string): Promise<DashboardPayload> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Execute all queries in parallel
    const [
      keystones,
      activeHeadwinds,
      completedHeadwinds,
      horizonItems,
      upcomingMeetings,
      pastMeetings,
      meetingTemplates,
      personalGoals,
      quarterlyGoals,
      annualGoals,
      ledgerEntries,
      foundingDocument,
      legacyMilestones,
    ] = await Promise.all([
      // Keystones (with auto-seed)
      this.keystonesService.findAll(tenantId),

      // Active headwinds (OPEN, IN_PROGRESS, TESTING)
      this.prisma.headwind.findMany({
        where: {
          tenantId,
          status: { in: ['OPEN', 'IN_PROGRESS', 'TESTING'] },
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        take: 50,
      }),

      // Victories (CLOSED, DEPLOYED)
      this.prisma.headwind.findMany({
        where: {
          tenantId,
          status: { in: ['CLOSED', 'DEPLOYED'] },
        },
        orderBy: { resolvedAt: 'desc' },
        take: 20,
      }),

      // Horizon items
      this.prisma.horizonItem.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      // Upcoming meetings (future)
      this.prisma.calendarEvent.findMany({
        where: {
          tenantId,
          startTime: { gte: now },
        },
        orderBy: { startTime: 'asc' },
        take: 10,
      }),

      // Past meetings (recent)
      this.prisma.calendarEvent.findMany({
        where: {
          tenantId,
          startTime: { lt: now },
        },
        orderBy: { startTime: 'desc' },
        take: 10,
      }),

      // Meeting templates
      this.prisma.meetingTemplate.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
      }),

      // Personal goals
      this.prisma.hQGoal.findMany({
        where: { tenantId, scope: 'PERSONAL' },
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      }),

      // Quarterly goals
      this.prisma.hQGoal.findMany({
        where: { tenantId, scope: 'QUARTERLY' },
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      }),

      // Annual goals
      this.prisma.hQGoal.findMany({
        where: { tenantId, scope: 'ANNUAL' },
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      }),

      // Ledger entries
      this.prisma.ledgerEntry.findMany({
        where: { tenantId },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      }),

      // Founding document (with auto-create)
      this.foundingService.findOne(tenantId),

      // Legacy milestones
      this.prisma.legacyMilestone.findMany({
        where: { tenantId },
        orderBy: [{ year: 'asc' }, { sortOrder: 'asc' }],
      }),
    ]);

    // Calculate summaries
    const completedThisMonth = completedHeadwinds.filter(
      (h) => h.resolvedAt && new Date(h.resolvedAt) >= startOfMonth,
    ).length;

    const allGoals = [...personalGoals, ...quarterlyGoals, ...annualGoals];
    const campaignProgress =
      allGoals.length > 0
        ? Math.round(
            allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) /
              allGoals.length,
          )
        : 0;

    const upcomingMilestone = legacyMilestones.find(
      (m) => m.status === 'IN_PROGRESS' || m.status === 'PLANNED',
    );

    // Determine if tenant is brand new (empty state)
    const isEmpty =
      activeHeadwinds.length === 0 &&
      completedHeadwinds.length === 0 &&
      horizonItems.length === 0 &&
      personalGoals.length === 0 &&
      quarterlyGoals.length === 0 &&
      annualGoals.length === 0 &&
      ledgerEntries.length === 0 &&
      legacyMilestones.length === 0 &&
      !foundingDocument.vision &&
      !foundingDocument.mission;

    const summary: DashboardSummary = {
      activeHeadwinds: activeHeadwinds.length,
      completedThisMonth,
      totalVictories: completedHeadwinds.length,
      nextMeeting:
        upcomingMeetings.length > 0
          ? {
              id: upcomingMeetings[0].id,
              title: upcomingMeetings[0].title,
              startTime: upcomingMeetings[0].startTime.toISOString(),
            }
          : undefined,
      campaignProgress,
      upcomingMilestoneYear: upcomingMilestone?.year,
    };

    return {
      summary,
      keystones,
      headwinds: activeHeadwinds,
      victories: completedHeadwinds,
      horizonItems,
      upcomingMeetings,
      pastMeetings,
      meetingTemplates,
      goals: {
        personal: personalGoals,
        quarterly: quarterlyGoals,
        annual: annualGoals,
      },
      ledgerEntries,
      foundingDocument,
      legacyMilestones,
      isEmpty,
    };
  }
}
