import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.campaign.findMany({
      where: { tenantId },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        },
        _count: { select: { enrollments: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        },
        _count: { select: { enrollments: true } }
      },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async create(tenantId: string, data: {
    name: string;
    description?: string;
    type?: string;
    channels?: string[];
    status?: string;
    triggerType?: string;
    triggerConfig?: any;
    isFromTreasury?: boolean;
    steps?: {
      order: number;
      channel: string;
      dayOffset: number;
      hourOffset?: number;
      subject?: string;
      content: string;
    }[];
  }) {
    const campaign = await this.prisma.campaign.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        type: data.type || 'multi',
        channels: data.channels || ['email'],
        status: data.status || 'draft',
        triggerType: data.triggerType,
        triggerConfig: data.triggerConfig || {},
        isFromTreasury: data.isFromTreasury || false,
      },
    });

    // Create steps if provided
    if (data.steps && data.steps.length > 0) {
      await this.prisma.campaignStep.createMany({
        data: data.steps.map(step => ({
          campaignId: campaign.id,
          order: step.order,
          channel: step.channel,
          dayOffset: step.dayOffset,
          hourOffset: step.hourOffset || 0,
          subject: step.subject,
          content: step.content,
          status: 'active',
        })),
      });
    }

    return this.findOne(campaign.id, tenantId);
  }

  async update(id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    type?: string;
    channels?: string[];
    status?: string;
    triggerType?: string;
    triggerConfig?: any;
    steps?: {
      id?: string;
      order: number;
      channel: string;
      dayOffset: number;
      hourOffset?: number;
      subject?: string;
      content: string;
    }[];
  }) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Update campaign
    await this.prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        channels: data.channels,
        status: data.status,
        triggerType: data.triggerType,
        triggerConfig: data.triggerConfig,
      },
    });

    // Update steps if provided
    if (data.steps) {
      // Delete existing steps and recreate
      await this.prisma.campaignStep.deleteMany({
        where: { campaignId: id },
      });

      if (data.steps.length > 0) {
        await this.prisma.campaignStep.createMany({
          data: data.steps.map(step => ({
            campaignId: id,
            order: step.order,
            channel: step.channel,
            dayOffset: step.dayOffset,
            hourOffset: step.hourOffset || 0,
            subject: step.subject,
            content: step.content,
            status: 'active',
          })),
        });
      }
    }

    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Delete steps first
    await this.prisma.campaignStep.deleteMany({
      where: { campaignId: id },
    });

    // Delete enrollments
    await this.prisma.campaignEnrollment.deleteMany({
      where: { campaignId: id },
    });

    // Delete campaign
    await this.prisma.campaign.delete({
      where: { id },
    });

    return { success: true, message: 'Campaign deleted successfully' };
  }

  // Enrollment methods
  async enroll(campaignId: string, tenantId: string, contactId: string, dealId?: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, tenantId },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check if already enrolled
    const existing = await this.prisma.campaignEnrollment.findFirst({
      where: { campaignId, contactId, status: 'active' },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.campaignEnrollment.create({
      data: {
        campaignId,
        contactId,
        dealId,
        status: 'active',
        currentStep: 0,
      },
    });
  }

  async getEnrollments(campaignId: string, tenantId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, tenantId },
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return this.prisma.campaignEnrollment.findMany({
      where: { campaignId },
      include: { contact: true },
      orderBy: { enrolledAt: 'desc' },
    });
  }
}
