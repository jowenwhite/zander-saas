import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * D-2/D-3/D-5/D-7: Consulting Automation Service
 * Handles automated generation of proposals, progress reports, renewal reminders, and satisfaction surveys.
 * All outbound communications are L3 DRAFT - created as ScheduledCommunication with needsApproval=true
 */
@Injectable()
export class ConsultingAutomationService {
  private readonly logger = new Logger(ConsultingAutomationService.name);

  // Package configurations for proposal generation
  private readonly packageConfigs = {
    BUSINESS_ANALYSIS: {
      name: 'Business Analysis Session',
      price: 2500,
      hours: 10,
      description: 'A focused 2-hour deep-dive session with comprehensive analysis and actionable recommendations.',
      deliverables: [
        'Business Scorecard Assessment',
        '10-Pillar Analysis',
        'Priority Recommendations Report',
        '30-Day Action Plan',
      ],
    },
    COMPASS: {
      name: 'Compass Package',
      price: 4500,
      hours: 20,
      description: 'Strategic direction setting with ongoing support to ensure implementation success.',
      deliverables: [
        'Strategic Direction Document',
        'Priority Matrix',
        'Implementation Timeline',
        'Weekly Check-in Calls (4 weeks)',
        'Resource Library Access',
      ],
    },
    FOUNDATION: {
      name: 'Foundation Package',
      price: 7500,
      hours: 40,
      description: 'Comprehensive foundation building with hands-on implementation support.',
      deliverables: [
        'Complete 10-Pillar Assessment',
        'Custom Strategy Document',
        'Process Optimization Guide',
        'Monthly Strategy Sessions (3 months)',
        'Email Support',
        'Template Library',
      ],
    },
    BLUEPRINT: {
      name: 'Blueprint Package',
      price: 15000,
      hours: 80,
      description: 'Full-service business transformation with ongoing strategic partnership.',
      deliverables: [
        'Executive Strategic Blueprint',
        'Operational Excellence Framework',
        'Growth Strategy & Roadmap',
        'Weekly Strategy Calls (6 months)',
        'Priority Slack Access',
        'Quarterly Business Reviews',
        'Custom Tool Development',
      ],
    },
  };

  constructor(private prisma: PrismaService) {}

  /**
   * D-2: Generate a proposal for a consulting lead
   * Creates an L3 DRAFT ScheduledCommunication for Jonathan's approval
   */
  async generateProposal(
    leadId: string,
    packageType: string,
    options: {
      customNotes?: string;
      discountPercent?: number;
      validDays?: number;
    } = {},
  ) {
    const lead = await this.prisma.consultingLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }

    const config = this.packageConfigs[packageType as keyof typeof this.packageConfigs];
    if (!config) {
      throw new NotFoundException(`Package type ${packageType} not found`);
    }

    const { customNotes, discountPercent = 0, validDays = 14 } = options;

    // Calculate pricing
    const originalPrice = config.price;
    const discountAmount = Math.round(originalPrice * (discountPercent / 100));
    const finalPrice = originalPrice - discountAmount;
    const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    // Generate proposal content
    const proposalContent = this.buildProposalContent({
      lead,
      config,
      originalPrice,
      discountPercent,
      discountAmount,
      finalPrice,
      validUntil,
      customNotes,
    });

    // Create proposal record
    const proposal = await this.prisma.consultingProposal.create({
      data: {
        leadId,
        packageType,
        totalAmount: finalPrice,
        status: 'DRAFT',
        validUntil,
        content: proposalContent,
        metadata: {
          originalPrice,
          discountPercent,
          discountAmount,
          generatedAt: new Date().toISOString(),
          customNotes,
        },
      },
    });

    // Create L3 DRAFT ScheduledCommunication for approval
    const scheduledComm = await this.prisma.scheduledCommunication.create({
      data: {
        tenantId: process.env.ZANDER_TENANT_ID || 'zander-consulting',
        type: 'proposal_email',
        subject: `Proposal: ${config.name} for ${lead.company || lead.name}`,
        body: JSON.stringify({
          action: 'send_proposal',
          proposalId: proposal.id,
          leadId: lead.id,
          leadName: lead.name,
          leadEmail: lead.email,
          company: lead.company,
          package: packageType,
          amount: finalPrice,
          proposalContent,
        }),
        recipientEmail: lead.email,
        scheduledFor: new Date(),
        status: 'pending',
        needsApproval: true,
        metadata: {
          proposalId: proposal.id,
          packageType,
          amount: finalPrice,
        },
      },
    });

    this.logger.log(`Generated proposal ${proposal.id} for lead ${leadId} (L3 DRAFT)`);

    // Log the event
    await this.prisma.consultingEvent.create({
      data: {
        type: 'PROPOSAL_DRAFTED',
        leadId,
        description: `Proposal generated: ${config.name} - $${finalPrice.toLocaleString()}`,
        metadata: {
          proposalId: proposal.id,
          scheduledCommId: scheduledComm.id,
          packageType,
          amount: finalPrice,
        },
        actorType: 'system',
      },
    });

    return {
      proposal,
      scheduledCommunication: scheduledComm,
      message: `Proposal drafted for ${lead.name}. Awaiting Jonathan's approval before sending.`,
      status: 'pending_approval',
    };
  }

  /**
   * D-3: Generate a progress report for an active engagement
   * Creates an L3 DRAFT ScheduledCommunication for Jonathan's approval
   */
  async generateProgressReport(
    engagementId: string,
    options: {
      periodStart?: Date;
      periodEnd?: Date;
      includeHoursBreakdown?: boolean;
      customSummary?: string;
    } = {},
  ) {
    const engagement = await this.prisma.consultingEngagement.findUnique({
      where: { id: engagementId },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        timeEntries: {
          where: options.periodStart && options.periodEnd ? {
            date: { gte: options.periodStart, lte: options.periodEnd },
          } : undefined,
          orderBy: { date: 'desc' },
          take: 50,
        },
        deliverables: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${engagementId} not found`);
    }

    const {
      periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd = new Date(),
      includeHoursBreakdown = true,
      customSummary,
    } = options;

    // Calculate metrics
    const hoursThisPeriod = engagement.timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const hoursRemaining = engagement.totalHours - engagement.hoursUsed;
    const completedDeliverables = engagement.deliverables.filter(d =>
      d.status === 'COMPLETED' || d.status === 'DELIVERED'
    );
    const pendingDeliverables = engagement.deliverables.filter(d =>
      d.status === 'PENDING' || d.status === 'IN_PROGRESS'
    );

    // Group hours by category
    const hoursByCategory = engagement.timeEntries.reduce((acc, entry) => {
      const cat = entry.category || 'General';
      acc[cat] = (acc[cat] || 0) + entry.hours;
      return acc;
    }, {} as Record<string, number>);

    // Build report content
    const reportContent = this.buildProgressReportContent({
      engagement,
      periodStart,
      periodEnd,
      hoursThisPeriod,
      hoursRemaining,
      hoursByCategory,
      completedDeliverables,
      pendingDeliverables,
      includeHoursBreakdown,
      customSummary,
    });

    const recipientEmail = engagement.tenant?.users?.[0]?.email || engagement.tenant?.email;
    const recipientName = engagement.tenant?.users?.[0]?.firstName || engagement.tenant?.companyName || 'Client';

    // Create L3 DRAFT ScheduledCommunication for approval
    const scheduledComm = await this.prisma.scheduledCommunication.create({
      data: {
        tenantId: engagement.tenantId,
        type: 'progress_report',
        subject: `Progress Report: ${engagement.packageType} Engagement - ${new Date().toLocaleDateString()}`,
        body: JSON.stringify({
          action: 'send_progress_report',
          engagementId: engagement.id,
          recipientEmail,
          recipientName,
          company: engagement.tenant?.companyName,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          reportContent,
          metrics: {
            hoursThisPeriod,
            hoursRemaining,
            totalHours: engagement.totalHours,
            completedDeliverables: completedDeliverables.length,
            pendingDeliverables: pendingDeliverables.length,
          },
        }),
        recipientEmail: recipientEmail || 'unknown@example.com',
        scheduledFor: new Date(),
        status: 'pending',
        needsApproval: true,
        metadata: {
          engagementId: engagement.id,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
        },
      },
    });

    this.logger.log(`Generated progress report for engagement ${engagementId} (L3 DRAFT)`);

    return {
      scheduledCommunication: scheduledComm,
      reportContent,
      metrics: {
        hoursThisPeriod,
        hoursRemaining,
        totalHours: engagement.totalHours,
        completedDeliverables: completedDeliverables.length,
        pendingDeliverables: pendingDeliverables.length,
      },
      message: `Progress report drafted for ${engagement.tenant?.companyName || 'client'}. Awaiting Jonathan's approval before sending.`,
      status: 'pending_approval',
    };
  }

  /**
   * D-5: Check for engagements approaching renewal and create reminders
   * Creates L3 DRAFT communications for engagement renewals
   */
  async checkEngagementRenewals(daysAhead: number = 14) {
    const targetDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

    // Find engagements that:
    // 1. Are ACTIVE
    // 2. Have endDate approaching within daysAhead
    // OR have less than 20% hours remaining
    const engagements = await this.prisma.consultingEngagement.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { endDate: { lte: targetDate } },
        ],
      },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    // Also check for low hours (< 20% remaining)
    const lowHoursEngagements = await this.prisma.consultingEngagement.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    }).then(results => results.filter(e => {
      const percentRemaining = ((e.totalHours - e.hoursUsed) / e.totalHours) * 100;
      return percentRemaining < 20 && percentRemaining > 0;
    }));

    // Combine and deduplicate
    const allEngagements = [...engagements, ...lowHoursEngagements];
    const uniqueEngagements = allEngagements.filter((e, i, arr) =>
      arr.findIndex(x => x.id === e.id) === i
    );

    const renewalReminders: any[] = [];

    for (const engagement of uniqueEngagements) {
      const hoursRemaining = engagement.totalHours - engagement.hoursUsed;
      const percentRemaining = Math.round((hoursRemaining / engagement.totalHours) * 100);
      const daysToEnd = engagement.endDate
        ? Math.ceil((new Date(engagement.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : null;

      const recipientEmail = engagement.tenant?.users?.[0]?.email || engagement.tenant?.email;
      const recipientName = engagement.tenant?.users?.[0]?.firstName || engagement.tenant?.companyName || 'Client';

      // Check if we already have a pending renewal reminder
      const existingReminder = await this.prisma.scheduledCommunication.findFirst({
        where: {
          type: 'renewal_reminder',
          status: 'pending',
          metadata: {
            path: ['engagementId'],
            equals: engagement.id,
          },
        },
      });

      if (existingReminder) {
        continue; // Skip if we already have a pending reminder
      }

      // Build renewal message
      const renewalReason = daysToEnd && daysToEnd <= daysAhead
        ? `engagement ending in ${daysToEnd} days`
        : `only ${percentRemaining}% of hours remaining (${hoursRemaining.toFixed(1)} hrs)`;

      // Create L3 DRAFT renewal reminder
      const scheduledComm = await this.prisma.scheduledCommunication.create({
        data: {
          tenantId: engagement.tenantId,
          type: 'renewal_reminder',
          subject: `Engagement Renewal: ${engagement.tenant?.companyName || 'Your'} ${engagement.packageType} Package`,
          body: JSON.stringify({
            action: 'send_renewal_reminder',
            engagementId: engagement.id,
            recipientEmail,
            recipientName,
            company: engagement.tenant?.companyName,
            packageType: engagement.packageType,
            hoursRemaining,
            percentRemaining,
            daysToEnd,
            renewalReason,
          }),
          recipientEmail: recipientEmail || 'unknown@example.com',
          scheduledFor: new Date(),
          status: 'pending',
          needsApproval: true,
          metadata: {
            engagementId: engagement.id,
            renewalReason,
          },
        },
      });

      renewalReminders.push({
        engagementId: engagement.id,
        company: engagement.tenant?.companyName,
        package: engagement.packageType,
        renewalReason,
        scheduledCommId: scheduledComm.id,
      });

      this.logger.log(`Created renewal reminder for engagement ${engagement.id} (L3 DRAFT)`);
    }

    return {
      checked: uniqueEngagements.length,
      remindersCreated: renewalReminders.length,
      reminders: renewalReminders,
      message: `Checked ${uniqueEngagements.length} engagements, created ${renewalReminders.length} renewal reminder(s)`,
    };
  }

  /**
   * D-4: Submit a deliverable for client review
   * Creates an L3 DRAFT notification for client approval
   */
  async submitDeliverableForReview(
    deliverableId: string,
    options: {
      reviewNotes?: string;
      documentUrl?: string;
    } = {},
  ) {
    const deliverable = await this.prisma.consultingDeliverable.findUnique({
      where: { id: deliverableId },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        engagement: { select: { packageType: true } },
      },
    });

    if (!deliverable) {
      throw new NotFoundException(`Deliverable ${deliverableId} not found`);
    }

    const { reviewNotes, documentUrl } = options;

    // Update deliverable status and URL if provided
    await this.prisma.consultingDeliverable.update({
      where: { id: deliverableId },
      data: {
        status: 'REVIEW',
        documentUrl: documentUrl || deliverable.documentUrl,
      },
    });

    const recipientEmail = deliverable.tenant?.users?.[0]?.email || deliverable.tenant?.email;
    const recipientName = deliverable.tenant?.users?.[0]?.firstName || deliverable.tenant?.companyName || 'Client';

    // Create L3 DRAFT approval request
    const scheduledComm = await this.prisma.scheduledCommunication.create({
      data: {
        tenantId: deliverable.tenantId,
        type: 'deliverable_review',
        subject: `Deliverable Ready for Review: ${deliverable.name}`,
        body: JSON.stringify({
          action: 'send_deliverable_review',
          deliverableId: deliverable.id,
          deliverableName: deliverable.name,
          recipientEmail,
          recipientName,
          company: deliverable.tenant?.companyName,
          packageType: deliverable.engagement?.packageType,
          documentUrl: documentUrl || deliverable.documentUrl,
          reviewNotes,
        }),
        recipientEmail: recipientEmail || 'unknown@example.com',
        scheduledFor: new Date(),
        status: 'pending',
        needsApproval: true,
        metadata: {
          deliverableId: deliverable.id,
          deliverableName: deliverable.name,
        },
      },
    });

    this.logger.log(`Submitted deliverable ${deliverableId} for review (L3 DRAFT)`);

    return {
      deliverable: {
        id: deliverable.id,
        name: deliverable.name,
        status: 'REVIEW',
      },
      scheduledCommunication: scheduledComm,
      message: `Deliverable "${deliverable.name}" submitted for client review. Notification pending Jonathan's approval.`,
      status: 'pending_approval',
    };
  }

  /**
   * D-4: Process client response to deliverable (approve or request revision)
   */
  async processDeliverableResponse(
    deliverableId: string,
    response: 'APPROVED' | 'REVISION_REQUESTED',
    feedback?: string,
  ) {
    const deliverable = await this.prisma.consultingDeliverable.findUnique({
      where: { id: deliverableId },
      include: {
        tenant: { select: { companyName: true } },
      },
    });

    if (!deliverable) {
      throw new NotFoundException(`Deliverable ${deliverableId} not found`);
    }

    const newStatus = response === 'APPROVED' ? 'DELIVERED' : 'REVISION_REQUESTED';

    await this.prisma.consultingDeliverable.update({
      where: { id: deliverableId },
      data: {
        status: newStatus,
        deliveredAt: response === 'APPROVED' ? new Date() : null,
      },
    });

    // Create internal notification for Jonathan about the response
    await this.prisma.scheduledCommunication.create({
      data: {
        tenantId: deliverable.tenantId,
        type: 'deliverable_response',
        subject: `Deliverable ${response === 'APPROVED' ? 'Approved' : 'Revision Requested'}: ${deliverable.name}`,
        body: JSON.stringify({
          action: 'notify_deliverable_response',
          deliverableId: deliverable.id,
          deliverableName: deliverable.name,
          company: deliverable.tenant?.companyName,
          response,
          feedback,
        }),
        recipientEmail: 'jonathan@zanderos.com',
        scheduledFor: new Date(),
        status: 'pending',
        needsApproval: false, // Auto-send internal notifications
        metadata: {
          deliverableId: deliverable.id,
          response,
          feedback,
        },
      },
    });

    this.logger.log(`Processed deliverable ${deliverableId} response: ${response}`);

    return {
      deliverable: {
        id: deliverable.id,
        name: deliverable.name,
        status: newStatus,
      },
      response,
      feedback,
      message: response === 'APPROVED'
        ? `Deliverable "${deliverable.name}" has been approved and marked as delivered.`
        : `Revision requested for "${deliverable.name}". Feedback recorded.`,
    };
  }

  // ============================================
  // D-7: CLIENT SATISFACTION SURVEYS
  // ============================================

  /**
   * D-7: Schedule a satisfaction survey for a client
   * Triggered after deliverable completion or at periodic intervals
   * Creates an L3 DRAFT communication for Jonathan's approval
   */
  async scheduleSatisfactionSurvey(
    engagementId: string,
    options: {
      trigger: 'DELIVERABLE_COMPLETE' | 'MILESTONE' | 'PERIODIC' | 'ENGAGEMENT_END';
      deliverableId?: string;
      delayDays?: number;
    } = { trigger: 'PERIODIC' },
  ) {
    const engagement = await this.prisma.consultingEngagement.findUnique({
      where: { id: engagementId },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${engagementId} not found`);
    }

    const { trigger, deliverableId, delayDays = 1 } = options;

    const recipientEmail = engagement.tenant?.users?.[0]?.email || engagement.tenant?.email;
    const recipientName = engagement.tenant?.users?.[0]?.firstName || engagement.tenant?.companyName || 'Client';
    const companyName = engagement.tenant?.companyName || 'your company';

    // Check for existing pending survey
    const existingSurvey = await this.prisma.scheduledCommunication.findFirst({
      where: {
        type: 'satisfaction_survey',
        status: 'pending',
        metadata: {
          path: ['engagementId'],
          equals: engagementId,
        },
      },
    });

    if (existingSurvey) {
      this.logger.log(`Skipping survey - pending survey ${existingSurvey.id} already exists for engagement ${engagementId}`);
      return {
        skipped: true,
        existingSurveyId: existingSurvey.id,
        message: 'A pending satisfaction survey already exists for this engagement.',
      };
    }

    // Calculate scheduled time
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + delayDays);

    // Build survey content based on trigger type
    const surveyContent = this.buildSurveyContent({
      trigger,
      recipientName,
      companyName,
      packageType: engagement.packageType,
      engagementId,
    });

    const surveySubject = this.getSurveySubject(trigger, engagement.packageType);

    // Create L3 DRAFT satisfaction survey
    const scheduledComm = await this.prisma.scheduledCommunication.create({
      data: {
        tenantId: engagement.tenantId,
        type: 'satisfaction_survey',
        subject: surveySubject,
        body: JSON.stringify({
          action: 'send_satisfaction_survey',
          engagementId: engagement.id,
          trigger,
          deliverableId,
          recipientEmail,
          recipientName,
          company: companyName,
          packageType: engagement.packageType,
          surveyContent,
          surveyUrl: `https://app.zanderos.com/feedback/${engagement.id}`,
        }),
        recipientEmail: recipientEmail || 'unknown@example.com',
        recipientName,
        scheduledFor,
        status: 'DRAFT',
        needsApproval: true, // L3 DRAFT - requires Jonathan's approval
        metadata: {
          engagementId: engagement.id,
          trigger,
          deliverableId,
          surveyType: 'satisfaction',
        },
      },
    });

    this.logger.log(`D-7: Scheduled satisfaction survey for engagement ${engagementId} (L3 DRAFT)`);

    // Log the event
    await this.prisma.consultingEvent.create({
      data: {
        type: 'SURVEY_SCHEDULED',
        engagementId,
        description: `Satisfaction survey scheduled (trigger: ${trigger})`,
        metadata: {
          scheduledCommId: scheduledComm.id,
          trigger,
          deliverableId,
          scheduledFor: scheduledFor.toISOString(),
        },
        actorType: 'system',
      },
    });

    return {
      scheduledCommunication: scheduledComm,
      trigger,
      scheduledFor,
      message: `Satisfaction survey scheduled for ${recipientName} (${trigger}). Awaiting Jonathan's approval.`,
      status: 'pending_approval',
    };
  }

  /**
   * D-7: Check engagements and schedule periodic satisfaction surveys
   * Run this on a schedule (e.g., weekly) to ensure ongoing feedback
   */
  async checkAndSchedulePeriodicSurveys(daysInterval: number = 30) {
    const cutoffDate = new Date(Date.now() - daysInterval * 24 * 60 * 60 * 1000);

    // Find active engagements that haven't had a survey recently
    const engagements = await this.prisma.consultingEngagement.findMany({
      where: {
        status: 'ACTIVE',
        hoursUsed: { gt: 0 }, // Only if they've used some hours
      },
      include: {
        tenant: {
          include: {
            users: {
              take: 1,
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    const scheduledSurveys: any[] = [];
    const skippedEngagements: any[] = [];

    for (const engagement of engagements) {
      // Check for recent survey (sent or pending)
      const recentSurvey = await this.prisma.scheduledCommunication.findFirst({
        where: {
          type: 'satisfaction_survey',
          metadata: {
            path: ['engagementId'],
            equals: engagement.id,
          },
          createdAt: { gte: cutoffDate },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentSurvey) {
        skippedEngagements.push({
          engagementId: engagement.id,
          company: engagement.tenant?.companyName,
          reason: 'Recent survey exists',
          lastSurveyDate: recentSurvey.createdAt,
        });
        continue;
      }

      // Schedule periodic survey
      const result = await this.scheduleSatisfactionSurvey(engagement.id, {
        trigger: 'PERIODIC',
        delayDays: 0, // Send now (subject to approval)
      });

      if (!result.skipped) {
        scheduledSurveys.push({
          engagementId: engagement.id,
          company: engagement.tenant?.companyName,
          scheduledCommId: result.scheduledCommunication?.id,
        });
      }
    }

    this.logger.log(`D-7: Checked ${engagements.length} engagements, scheduled ${scheduledSurveys.length} surveys`);

    return {
      checkedEngagements: engagements.length,
      surveysScheduled: scheduledSurveys.length,
      surveysSkipped: skippedEngagements.length,
      scheduled: scheduledSurveys,
      skipped: skippedEngagements,
      message: `Checked ${engagements.length} active engagements, scheduled ${scheduledSurveys.length} satisfaction survey(s)`,
    };
  }

  /**
   * D-7: Schedule survey after deliverable completion
   * Called when a deliverable is marked as DELIVERED
   */
  async scheduleDeliverableFeedbackSurvey(deliverableId: string) {
    const deliverable = await this.prisma.consultingDeliverable.findUnique({
      where: { id: deliverableId },
      include: {
        engagement: { select: { id: true } },
      },
    });

    if (!deliverable || !deliverable.engagement) {
      throw new NotFoundException(`Deliverable ${deliverableId} or its engagement not found`);
    }

    return this.scheduleSatisfactionSurvey(deliverable.engagement.id, {
      trigger: 'DELIVERABLE_COMPLETE',
      deliverableId,
      delayDays: 2, // Wait 2 days for them to review the deliverable
    });
  }

  /**
   * D-7: Schedule survey at engagement end
   * Called when an engagement is about to complete
   */
  async scheduleEndOfEngagementSurvey(engagementId: string) {
    return this.scheduleSatisfactionSurvey(engagementId, {
      trigger: 'ENGAGEMENT_END',
      delayDays: 0, // Send immediately (subject to approval)
    });
  }

  /**
   * D-7: Record survey response
   * Stores feedback and triggers follow-up actions if needed
   */
  async recordSurveyResponse(
    engagementId: string,
    response: {
      overallRating: number; // 1-5
      npsScore?: number; // 0-10
      wouldRecommend: boolean;
      feedback?: string;
      improvementAreas?: string[];
      highlightedStrengths?: string[];
    },
  ) {
    const engagement = await this.prisma.consultingEngagement.findUnique({
      where: { id: engagementId },
      include: {
        tenant: { select: { companyName: true } },
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${engagementId} not found`);
    }

    const {
      overallRating,
      npsScore,
      wouldRecommend,
      feedback,
      improvementAreas,
      highlightedStrengths,
    } = response;

    // Log the survey response as an event
    const event = await this.prisma.consultingEvent.create({
      data: {
        type: 'SURVEY_RESPONSE',
        engagementId,
        description: `Client satisfaction survey received: ${overallRating}/5 stars${npsScore ? `, NPS: ${npsScore}` : ''}`,
        metadata: {
          overallRating,
          npsScore,
          wouldRecommend,
          feedback,
          improvementAreas,
          highlightedStrengths,
          receivedAt: new Date().toISOString(),
        },
        actorType: 'client',
      },
    });

    // Create internal notification for Jonathan (auto-send, no approval needed)
    const ratingEmoji = this.getRatingEmoji(overallRating);
    await this.prisma.scheduledCommunication.create({
      data: {
        tenantId: engagement.tenantId,
        type: 'survey_response_notification',
        subject: `${ratingEmoji} Survey Response: ${engagement.tenant?.companyName || 'Client'} - ${overallRating}/5`,
        body: JSON.stringify({
          action: 'notify_survey_response',
          engagementId: engagement.id,
          company: engagement.tenant?.companyName,
          packageType: engagement.packageType,
          ...response,
        }),
        recipientEmail: 'jonathan@zanderos.com',
        scheduledFor: new Date(),
        status: 'pending',
        needsApproval: false, // Auto-send internal notifications
        metadata: {
          engagementId: engagement.id,
          eventId: event.id,
          responseType: 'satisfaction_survey',
        },
      },
    });

    // If rating is low (1-2), create a follow-up task
    if (overallRating <= 2) {
      await this.prisma.consultingEvent.create({
        data: {
          type: 'FOLLOW_UP_NEEDED',
          engagementId,
          description: `Low satisfaction score (${overallRating}/5) requires follow-up call`,
          metadata: {
            priority: 'HIGH',
            reason: 'low_satisfaction',
            originalRating: overallRating,
            feedback,
          },
          actorType: 'system',
        },
      });
      this.logger.warn(`D-7: Low satisfaction score (${overallRating}/5) for engagement ${engagementId} - follow-up needed`);
    }

    this.logger.log(`D-7: Recorded survey response for engagement ${engagementId}: ${overallRating}/5`);

    return {
      success: true,
      eventId: event.id,
      rating: overallRating,
      npsScore,
      requiresFollowUp: overallRating <= 2,
      message: `Survey response recorded (${overallRating}/5 stars)${overallRating <= 2 ? ' - Follow-up recommended' : ''}`,
    };
  }

  private getSurveySubject(trigger: string, packageType: string): string {
    switch (trigger) {
      case 'DELIVERABLE_COMPLETE':
        return `Quick feedback on your recent deliverable?`;
      case 'MILESTONE':
        return `How's your ${packageType} experience going?`;
      case 'ENGAGEMENT_END':
        return `We'd love your feedback on our work together`;
      case 'PERIODIC':
      default:
        return `Quick check-in: How are we doing?`;
    }
  }

  private buildSurveyContent(data: {
    trigger: string;
    recipientName: string;
    companyName: string;
    packageType: string;
    engagementId: string;
  }): string {
    const { trigger, recipientName, companyName, packageType, engagementId } = data;
    const firstName = recipientName.split(' ')[0];
    const surveyUrl = `https://app.zanderos.com/feedback/${engagementId}`;

    let intro = '';
    switch (trigger) {
      case 'DELIVERABLE_COMPLETE':
        intro = `I hope you've had a chance to review the recent deliverable we completed for ${companyName}. I'd love to hear your thoughts!`;
        break;
      case 'MILESTONE':
        intro = `We've reached an exciting milestone in our ${packageType} engagement, and I wanted to check in on how things are going.`;
        break;
      case 'ENGAGEMENT_END':
        intro = `As we wrap up our work together on the ${packageType} engagement, I'd really value your feedback on the experience.`;
        break;
      case 'PERIODIC':
      default:
        intro = `I hope our ${packageType} engagement is delivering value for ${companyName}. I'd love to hear how things are going from your perspective.`;
        break;
    }

    return `Hi ${firstName},

${intro}

Would you mind taking 2 minutes to share your feedback? Your honest input helps me improve and ensures I'm delivering the best possible experience.

**[Share Your Feedback](${surveyUrl})**

The survey is quick - just a few questions about:
- Overall satisfaction with our work
- What's working well
- Areas where we could improve

Your feedback is invaluable, and I read every response personally.

Thank you for your partnership!

Best,
Jonathan

P.S. If you'd prefer to share feedback over a quick call instead, just reply and we can schedule one.`;
  }

  private getRatingEmoji(rating: number): string {
    if (rating >= 5) return '🌟';
    if (rating >= 4) return '👍';
    if (rating >= 3) return '😐';
    if (rating >= 2) return '⚠️';
    return '🚨';
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private buildProposalContent(data: {
    lead: any;
    config: any;
    originalPrice: number;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
    validUntil: Date;
    customNotes?: string;
  }): string {
    const { lead, config, originalPrice, discountPercent, discountAmount, finalPrice, validUntil, customNotes } = data;

    let content = `
# Consulting Proposal

## Prepared for: ${lead.company || lead.name}
**Contact:** ${lead.name} (${lead.email})
**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

---

## ${config.name}

${config.description}

### What's Included:

${config.deliverables.map((d: string) => `- ${d}`).join('\n')}

### Investment:

`;

    if (discountPercent > 0) {
      content += `
- Original Price: $${originalPrice.toLocaleString()}
- Discount (${discountPercent}%): -$${discountAmount.toLocaleString()}
- **Your Investment: $${finalPrice.toLocaleString()}**
`;
    } else {
      content += `
- **Investment: $${finalPrice.toLocaleString()}**
`;
    }

    content += `
- Hours Included: ${config.hours} hours

### Proposal Valid Until:
${validUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

`;

    if (customNotes) {
      content += `
### Additional Notes:
${customNotes}

`;
    }

    content += `
---

## Next Steps:

1. Review this proposal
2. Reply to this email or schedule a call to discuss any questions
3. Sign the agreement to get started

We're excited about the opportunity to work together!

---
*Zander Consulting | Helping businesses build their future*
`;

    return content;
  }

  private buildProgressReportContent(data: {
    engagement: any;
    periodStart: Date;
    periodEnd: Date;
    hoursThisPeriod: number;
    hoursRemaining: number;
    hoursByCategory: Record<string, number>;
    completedDeliverables: any[];
    pendingDeliverables: any[];
    includeHoursBreakdown: boolean;
    customSummary?: string;
  }): string {
    const {
      engagement,
      periodStart,
      periodEnd,
      hoursThisPeriod,
      hoursRemaining,
      hoursByCategory,
      completedDeliverables,
      pendingDeliverables,
      includeHoursBreakdown,
      customSummary,
    } = data;

    let content = `
# Progress Report

**Client:** ${engagement.tenant?.companyName || 'Client'}
**Package:** ${engagement.packageType}
**Report Period:** ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}

---

## Summary

`;

    if (customSummary) {
      content += `${customSummary}\n\n`;
    }

    content += `
### Hours Overview

- **Hours Used This Period:** ${hoursThisPeriod.toFixed(1)} hrs
- **Total Hours Used:** ${engagement.hoursUsed.toFixed(1)} hrs
- **Hours Remaining:** ${hoursRemaining.toFixed(1)} hrs of ${engagement.totalHours} hrs
- **Utilization:** ${Math.round((engagement.hoursUsed / engagement.totalHours) * 100)}%

`;

    if (includeHoursBreakdown && Object.keys(hoursByCategory).length > 0) {
      content += `
### Hours by Category

${Object.entries(hoursByCategory)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, hrs]) => `- **${cat}:** ${hrs.toFixed(1)} hrs`)
  .join('\n')}

`;
    }

    if (completedDeliverables.length > 0) {
      content += `
### Completed Deliverables

${completedDeliverables.map(d => `- ✅ ${d.name}`).join('\n')}

`;
    }

    if (pendingDeliverables.length > 0) {
      content += `
### Upcoming Deliverables

${pendingDeliverables.map(d => `- ⏳ ${d.name} (${d.status})`).join('\n')}

`;
    }

    content += `
---

## Next Steps

Please reach out if you have any questions about this report or would like to discuss priorities for the upcoming period.

---
*Zander Consulting | Progress Report*
`;

    return content;
  }
}
