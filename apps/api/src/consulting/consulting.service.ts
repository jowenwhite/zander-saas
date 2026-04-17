import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEngagementDto, UpdateEngagementDto } from './dto/create-engagement.dto';
import { CreateTimeEntryDto, UpdateTimeEntryDto } from './dto/create-time-entry.dto';
import { CreateDeliverableDto, UpdateDeliverableDto } from './dto/create-deliverable.dto';
import { CreateIntakeDto, UpdateIntakeDto } from './dto/create-intake.dto';
import { EngagementStatus, DeliverableStatus, IntakeStatus } from '@prisma/client';

@Injectable()
export class ConsultingService {
  private readonly logger = new Logger(ConsultingService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // ENGAGEMENTS
  // ============================================

  async createEngagement(dto: CreateEngagementDto) {
    const engagement = await this.prisma.consultingEngagement.create({
      data: {
        tenantId: dto.tenantId,
        packageType: dto.packageType,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        totalHours: dto.totalHours || 0,
        stripePaymentId: dto.stripePaymentId,
        notes: dto.notes,
        status: EngagementStatus.ACTIVE,
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    this.logger.log(`Created engagement ${engagement.id} for tenant ${dto.tenantId}`);
    return engagement;
  }

  async listEngagements(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};

    return this.prisma.consultingEngagement.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
        _count: {
          select: {
            timeEntries: true,
            deliverables: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEngagement(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const engagement = await this.prisma.consultingEngagement.findFirst({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
        timeEntries: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        deliverables: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${id} not found`);
    }

    return engagement;
  }

  async updateEngagement(id: string, dto: UpdateEngagementDto) {
    const existing = await this.prisma.consultingEngagement.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Engagement ${id} not found`);
    }

    const updateData: any = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.hoursUsed !== undefined) updateData.hoursUsed = dto.hoursUsed;
    if (dto.billableHours !== undefined) updateData.billableHours = dto.billableHours;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);

    const engagement = await this.prisma.consultingEngagement.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    this.logger.log(`Updated engagement ${id}`);
    return engagement;
  }

  // ============================================
  // TIME ENTRIES
  // ============================================

  async createTimeEntry(dto: CreateTimeEntryDto) {
    // Verify engagement exists and belongs to tenant
    const engagement = await this.prisma.consultingEngagement.findFirst({
      where: {
        id: dto.engagementId,
        tenantId: dto.tenantId,
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${dto.engagementId} not found for tenant`);
    }

    const billableHours = dto.billableHours ?? dto.hours;

    // Create time entry and update engagement hours in a transaction
    const [timeEntry] = await this.prisma.$transaction([
      this.prisma.consultingTimeEntry.create({
        data: {
          tenantId: dto.tenantId,
          engagementId: dto.engagementId,
          date: new Date(dto.date),
          hours: dto.hours,
          billableHours,
          description: dto.description,
          category: dto.category,
        },
      }),
      // Increment hours used on engagement
      this.prisma.consultingEngagement.update({
        where: { id: dto.engagementId },
        data: {
          hoursUsed: { increment: dto.hours },
          billableHours: { increment: billableHours },
        },
      }),
    ]);

    this.logger.log(`Created time entry ${timeEntry.id} (${dto.hours}h) for engagement ${dto.engagementId}`);
    return timeEntry;
  }

  async listTimeEntries(tenantId?: string, engagementId?: string) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (engagementId) where.engagementId = engagementId;

    return this.prisma.consultingTimeEntry.findMany({
      where,
      include: {
        engagement: {
          select: {
            id: true,
            packageType: true,
          },
        },
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async updateTimeEntry(id: string, dto: UpdateTimeEntryDto) {
    const existing = await this.prisma.consultingTimeEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Time entry ${id} not found`);
    }

    // Calculate hour difference if hours are being updated
    const hoursDiff = dto.hours !== undefined ? dto.hours - existing.hours : 0;
    const billableHoursDiff = dto.billableHours !== undefined
      ? dto.billableHours - existing.billableHours
      : 0;

    const updateData: any = {};
    if (dto.hours !== undefined) updateData.hours = dto.hours;
    if (dto.billableHours !== undefined) updateData.billableHours = dto.billableHours;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;

    // Update time entry and adjust engagement hours in a transaction
    const [timeEntry] = await this.prisma.$transaction([
      this.prisma.consultingTimeEntry.update({
        where: { id },
        data: updateData,
      }),
      // Adjust hours on engagement if changed
      ...(hoursDiff !== 0 || billableHoursDiff !== 0 ? [
        this.prisma.consultingEngagement.update({
          where: { id: existing.engagementId },
          data: {
            hoursUsed: { increment: hoursDiff },
            billableHours: { increment: billableHoursDiff },
          },
        }),
      ] : []),
    ]);

    this.logger.log(`Updated time entry ${id}`);
    return timeEntry;
  }

  async getTimeEntrySummary(tenantId?: string, engagementId?: string) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (engagementId) where.engagementId = engagementId;

    const entries = await this.prisma.consultingTimeEntry.findMany({
      where,
      select: {
        hours: true,
        billableHours: true,
        category: true,
      },
    });

    // Calculate totals
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const totalBillableHours = entries.reduce((sum, e) => sum + e.billableHours, 0);

    // Group by category
    const byCategory = entries.reduce((acc, e) => {
      if (!acc[e.category]) {
        acc[e.category] = { hours: 0, billableHours: 0, count: 0 };
      }
      acc[e.category].hours += e.hours;
      acc[e.category].billableHours += e.billableHours;
      acc[e.category].count += 1;
      return acc;
    }, {} as Record<string, { hours: number; billableHours: number; count: number }>);

    return {
      totalEntries: entries.length,
      totalHours,
      totalBillableHours,
      byCategory,
    };
  }

  // ============================================
  // DELIVERABLES
  // ============================================

  async createDeliverable(dto: CreateDeliverableDto) {
    // Verify engagement exists and belongs to tenant
    const engagement = await this.prisma.consultingEngagement.findFirst({
      where: {
        id: dto.engagementId,
        tenantId: dto.tenantId,
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${dto.engagementId} not found for tenant`);
    }

    const deliverable = await this.prisma.consultingDeliverable.create({
      data: {
        tenantId: dto.tenantId,
        engagementId: dto.engagementId,
        packageTier: dto.packageTier,
        name: dto.name,
        description: dto.description,
        status: DeliverableStatus.PENDING,
      },
      include: {
        engagement: {
          select: {
            id: true,
            packageType: true,
          },
        },
      },
    });

    this.logger.log(`Created deliverable ${deliverable.id} for engagement ${dto.engagementId}`);
    return deliverable;
  }

  async listDeliverables(tenantId?: string, engagementId?: string) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (engagementId) where.engagementId = engagementId;

    return this.prisma.consultingDeliverable.findMany({
      where,
      include: {
        engagement: {
          select: {
            id: true,
            packageType: true,
          },
        },
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDeliverable(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const deliverable = await this.prisma.consultingDeliverable.findFirst({
      where,
      include: {
        engagement: {
          select: {
            id: true,
            packageType: true,
            tenantId: true,
          },
        },
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!deliverable) {
      throw new NotFoundException(`Deliverable ${id} not found`);
    }

    return deliverable;
  }

  async updateDeliverable(id: string, dto: UpdateDeliverableDto) {
    const existing = await this.prisma.consultingDeliverable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Deliverable ${id} not found`);
    }

    const updateData: any = {};
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      // Set deliveredAt when status changes to DELIVERED
      if (dto.status === DeliverableStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      }
    }
    if (dto.documentUrl !== undefined) updateData.documentUrl = dto.documentUrl;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;

    const deliverable = await this.prisma.consultingDeliverable.update({
      where: { id },
      data: updateData,
      include: {
        engagement: {
          select: {
            id: true,
            packageType: true,
          },
        },
      },
    });

    this.logger.log(`Updated deliverable ${id}`);
    return deliverable;
  }

  // ============================================
  // DASHBOARD / OVERVIEW
  // ============================================

  async getConsultingOverview(tenantId?: string) {
    const where = tenantId ? { tenantId } : {};

    const [engagements, timeEntries, deliverables] = await Promise.all([
      this.prisma.consultingEngagement.findMany({
        where,
        select: {
          status: true,
          totalHours: true,
          hoursUsed: true,
          billableHours: true,
        },
      }),
      this.prisma.consultingTimeEntry.findMany({
        where,
        select: {
          hours: true,
          billableHours: true,
        },
      }),
      this.prisma.consultingDeliverable.findMany({
        where,
        select: {
          status: true,
        },
      }),
    ]);

    const activeEngagements = engagements.filter(e => e.status === EngagementStatus.ACTIVE).length;
    const totalEngagements = engagements.length;
    const totalHoursAllocated = engagements.reduce((sum, e) => sum + e.totalHours, 0);
    const totalHoursUsed = engagements.reduce((sum, e) => sum + e.hoursUsed, 0);

    const pendingDeliverables = deliverables.filter(d => d.status === DeliverableStatus.PENDING).length;
    const inProgressDeliverables = deliverables.filter(d => d.status === DeliverableStatus.IN_PROGRESS).length;
    const completedDeliverables = deliverables.filter(d =>
      d.status === DeliverableStatus.COMPLETED || d.status === DeliverableStatus.DELIVERED
    ).length;

    return {
      engagements: {
        total: totalEngagements,
        active: activeEngagements,
        totalHoursAllocated,
        totalHoursUsed,
        hoursRemaining: totalHoursAllocated - totalHoursUsed,
      },
      timeEntries: {
        total: timeEntries.length,
        totalHours: timeEntries.reduce((sum, e) => sum + e.hours, 0),
        totalBillableHours: timeEntries.reduce((sum, e) => sum + e.billableHours, 0),
      },
      deliverables: {
        total: deliverables.length,
        pending: pendingDeliverables,
        inProgress: inProgressDeliverables,
        completed: completedDeliverables,
      },
    };
  }

  // ============================================
  // INTAKES
  // ============================================

  async createIntake(dto: CreateIntakeDto, submittedById?: string) {
    const intake = await this.prisma.consultingIntake.create({
      data: {
        tenantId: dto.tenantId,
        submittedById,
        businessName: dto.businessName,
        industry: dto.industry,
        yearsInBusiness: dto.yearsInBusiness,
        annualRevenue: dto.annualRevenue,
        employeeCount: dto.employeeCount,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        preferredContact: dto.preferredContact || 'email',
        primaryGoals: dto.primaryGoals || [],
        biggestChallenges: dto.biggestChallenges || [],
        desiredOutcomes: dto.desiredOutcomes,
        packageInterest: dto.packageInterest,
        budgetRange: dto.budgetRange,
        timeline: dto.timeline,
        urgency: dto.urgency || 'normal',
        currentTools: dto.currentTools || [],
        previousConsulting: dto.previousConsulting || false,
        additionalNotes: dto.additionalNotes,
        howHeardAboutUs: dto.howHeardAboutUs,
        status: IntakeStatus.PENDING,
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Created intake ${intake.id} for tenant ${dto.tenantId}`);
    return intake;
  }

  async listIntakes(tenantId?: string, status?: string) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    return this.prisma.consultingIntake.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getIntake(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const intake = await this.prisma.consultingIntake.findFirst({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!intake) {
      throw new NotFoundException(`Intake ${id} not found`);
    }

    return intake;
  }

  async updateIntake(id: string, dto: UpdateIntakeDto, reviewedById?: string) {
    const existing = await this.prisma.consultingIntake.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Intake ${id} not found`);
    }

    const updateData: any = {};
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      // Set review data when status changes from PENDING
      if (dto.status !== 'PENDING' && existing.status === IntakeStatus.PENDING && reviewedById) {
        updateData.reviewedAt = new Date();
        updateData.reviewedById = reviewedById;
      }
    }
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.convertedToEngagement !== undefined) updateData.convertedToEngagement = dto.convertedToEngagement;

    const intake = await this.prisma.consultingIntake.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    this.logger.log(`Updated intake ${id} to status ${dto.status || 'unchanged'}`);
    return intake;
  }

  async convertIntakeToEngagement(intakeId: string, packageType: string, startDate: string, totalHours: number, reviewedById: string) {
    const intake = await this.prisma.consultingIntake.findUnique({
      where: { id: intakeId },
    });

    if (!intake) {
      throw new NotFoundException(`Intake ${intakeId} not found`);
    }

    if (intake.status === IntakeStatus.CONVERTED) {
      throw new BadRequestException(`Intake ${intakeId} has already been converted`);
    }

    // Create engagement and update intake in a transaction
    const [engagement] = await this.prisma.$transaction([
      this.prisma.consultingEngagement.create({
        data: {
          tenantId: intake.tenantId,
          packageType,
          startDate: new Date(startDate),
          totalHours,
          status: EngagementStatus.ACTIVE,
          notes: `Converted from intake ${intakeId}. Original notes: ${intake.additionalNotes || 'None'}`,
        },
      }),
      this.prisma.consultingIntake.update({
        where: { id: intakeId },
        data: {
          status: IntakeStatus.CONVERTED,
          reviewedAt: new Date(),
          reviewedById,
        },
      }),
    ]);

    // Update intake with engagement reference
    await this.prisma.consultingIntake.update({
      where: { id: intakeId },
      data: { convertedToEngagement: engagement.id },
    });

    this.logger.log(`Converted intake ${intakeId} to engagement ${engagement.id}`);
    return engagement;
  }

  // ============================================
  // SCORECARD
  // ============================================

  async getScorecard(engagementId?: string, tenantId?: string) {
    // If engagementId provided, get specific engagement
    if (engagementId) {
      const where: any = { id: engagementId };
      if (tenantId) where.tenantId = tenantId;

      const engagement = await this.prisma.consultingEngagement.findFirst({
        where,
        select: {
          id: true,
          tenantId: true,
          packageType: true,
          pillarScores: true,
          snapshotScores: true,
          status: true,
          tenant: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      });

      if (!engagement) {
        throw new NotFoundException(`Engagement ${engagementId} not found`);
      }

      return engagement;
    }

    // Otherwise, get most recent active engagement for tenant
    const where: any = { status: EngagementStatus.ACTIVE };
    if (tenantId) where.tenantId = tenantId;

    const engagement = await this.prisma.consultingEngagement.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tenantId: true,
        packageType: true,
        pillarScores: true,
        snapshotScores: true,
        status: true,
        tenant: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    return engagement;
  }

  async updateScorecard(engagementId: string, pillarScores: Record<string, number>) {
    // Validate pillar scores (must be 1-10)
    const validPillars = ['vision', 'mission', 'values', 'strategy', 'people', 'process', 'product', 'finance', 'marketing', 'growth'];

    for (const [key, value] of Object.entries(pillarScores)) {
      if (!validPillars.includes(key)) {
        throw new BadRequestException(`Invalid pillar: ${key}`);
      }
      if (typeof value !== 'number' || value < 1 || value > 10) {
        throw new BadRequestException(`Score for ${key} must be between 1 and 10`);
      }
    }

    const engagement = await this.prisma.consultingEngagement.update({
      where: { id: engagementId },
      data: {
        pillarScores: pillarScores as any,
      },
      select: {
        id: true,
        pillarScores: true,
        snapshotScores: true,
      },
    });

    this.logger.log(`Updated scorecard for engagement ${engagementId}`);
    return engagement;
  }

  async addScorecardSnapshot(engagementId: string, label?: string) {
    const engagement = await this.prisma.consultingEngagement.findUnique({
      where: { id: engagementId },
      select: {
        id: true,
        pillarScores: true,
        snapshotScores: true,
      },
    });

    if (!engagement) {
      throw new NotFoundException(`Engagement ${engagementId} not found`);
    }

    if (!engagement.pillarScores) {
      throw new BadRequestException('No pillar scores to snapshot');
    }

    // Create snapshot entry
    const snapshot = {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      label: label || `Snapshot ${new Date().toLocaleDateString()}`,
      scores: engagement.pillarScores,
    };

    // Add to existing snapshots array
    const existingSnapshots = (engagement.snapshotScores as any[]) || [];
    const newSnapshots = [...existingSnapshots, snapshot];

    const updated = await this.prisma.consultingEngagement.update({
      where: { id: engagementId },
      data: {
        snapshotScores: newSnapshots as any,
      },
      select: {
        id: true,
        pillarScores: true,
        snapshotScores: true,
      },
    });

    this.logger.log(`Added scorecard snapshot for engagement ${engagementId}`);
    return updated;
  }

  // ============================================
  // HQ POPULATION FROM INTAKE
  // ============================================

  async populateHQFromIntake(
    intakeId: string,
    options: { createHeadwinds?: boolean; createGoals?: boolean; updateVision?: boolean },
    userId: string,
  ) {
    const { createHeadwinds = true, createGoals = true, updateVision = true } = options;

    // Get the intake
    const intake = await this.prisma.consultingIntake.findUnique({
      where: { id: intakeId },
    });

    if (!intake) {
      throw new NotFoundException(`Intake ${intakeId} not found`);
    }

    const results = {
      intakeId,
      tenantId: intake.tenantId,
      visionUpdated: false,
      headwindsCreated: 0,
      goalsCreated: 0,
    };

    // 1. Update Vision from desiredOutcomes
    if (updateVision && intake.desiredOutcomes) {
      // Find or create founding document
      let foundingDoc = await this.prisma.foundingDocument.findFirst({
        where: { tenantId: intake.tenantId },
      });

      if (foundingDoc) {
        await this.prisma.foundingDocument.update({
          where: { id: foundingDoc.id },
          data: { vision: intake.desiredOutcomes },
        });
      } else {
        await this.prisma.foundingDocument.create({
          data: {
            tenantId: intake.tenantId,
            vision: intake.desiredOutcomes,
          },
        });
      }
      results.visionUpdated = true;
      this.logger.log(`Updated vision for tenant ${intake.tenantId} from intake`);
    }

    // 2. Create Headwinds from biggestChallenges
    if (createHeadwinds && intake.biggestChallenges && Array.isArray(intake.biggestChallenges)) {
      for (const challenge of intake.biggestChallenges) {
        if (typeof challenge === 'string' && challenge.trim()) {
          await this.prisma.headwind.create({
            data: {
              tenantId: intake.tenantId,
              createdById: userId,
              title: challenge.trim(),
              description: `Identified in business analysis intake on ${new Date(intake.createdAt).toLocaleDateString()}`,
              priority: 'P2',
              category: 'TASK',
              status: 'OPEN',
            },
          });
          results.headwindsCreated++;
        }
      }
      this.logger.log(`Created ${results.headwindsCreated} headwinds from intake for tenant ${intake.tenantId}`);
    }

    // 3. Create Goals from primaryGoals
    if (createGoals && intake.primaryGoals && Array.isArray(intake.primaryGoals)) {
      for (const goal of intake.primaryGoals) {
        if (typeof goal === 'string' && goal.trim()) {
          await this.prisma.hQGoal.create({
            data: {
              tenantId: intake.tenantId,
              title: goal.trim(),
              description: `Business goal identified in intake survey`,
              scope: 'QUARTERLY',
              status: 'ACTIVE',
              priority: 'P2',
              progress: 0,
            },
          });
          results.goalsCreated++;
        }
      }
      this.logger.log(`Created ${results.goalsCreated} goals from intake for tenant ${intake.tenantId}`);
    }

    return results;
  }
}
