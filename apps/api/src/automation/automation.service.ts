import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AutomationService {
  constructor(private prisma: PrismaService) {}

  // ============ EMAIL TEMPLATES ============
  async getTemplates(tenantId: string) {
    return this.prisma.emailTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplate(tenantId: string, id: string) {
    return this.prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });
  }

  async createTemplate(tenantId: string, data: any) {
    return this.prisma.emailTemplate.create({
      data: {
        tenantId,
        name: data.name,
        subject: data.subject,
        body: data.body,
        type: data.type || 'email',
        category: data.category,
        stage: data.stage,
        status: data.status || 'draft',
        variables: data.variables || [],
      },
    });
  }

  async updateTemplate(tenantId: string, id: string, data: any) {
    return this.prisma.emailTemplate.updateMany({
      where: { id, tenantId },
      data,
    }).then(() => this.getTemplate(tenantId, id));
  }

  async deleteTemplate(tenantId: string, id: string) {
    return this.prisma.emailTemplate.deleteMany({
      where: { id, tenantId },
    });
  }

  // ============ EMAIL SEQUENCES ============
  async getSequences(tenantId: string) {
    return this.prisma.emailSequence.findMany({
      where: { tenantId },
      include: {
        steps: {
          include: { template: true },
          orderBy: { order: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSequence(tenantId: string, id: string) {
    return this.prisma.emailSequence.findFirst({
      where: { id, tenantId },
      include: {
        steps: {
          include: { template: true },
          orderBy: { order: 'asc' },
        },
        enrollments: {
          include: { contact: true },
        },
      },
    });
  }

  async createSequence(tenantId: string, data: any) {
    return this.prisma.emailSequence.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        status: data.status || 'draft',
        triggerType: data.triggerType,
        triggerConfig: data.triggerConfig || {},
      },
    });
  }

  async updateSequence(tenantId: string, id: string, data: any) {
    return this.prisma.emailSequence.updateMany({
      where: { id, tenantId },
      data,
    }).then(() => this.getSequence(tenantId, id));
  }

  async deleteSequence(tenantId: string, id: string) {
    return this.prisma.emailSequence.deleteMany({
      where: { id, tenantId },
    });
  }

  // ============ SEQUENCE STEPS ============
  async addSequenceStep(tenantId: string, sequenceId: string, data: any) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceId, tenantId },
    });
    if (!sequence) throw new Error('Sequence not found');

    const maxOrder = await this.prisma.emailSequenceStep.aggregate({
      where: { sequenceId },
      _max: { order: true },
    });

    return this.prisma.emailSequenceStep.create({
      data: {
        sequenceId,
        templateId: data.templateId,
        order: (maxOrder._max.order || 0) + 1,
        delayDays: data.delayDays || 0,
        delayHours: data.delayHours || 0,
      },
      include: { template: true },
    });
  }

  async updateSequenceStep(tenantId: string, stepId: string, data: any) {
    const step = await this.prisma.emailSequenceStep.findFirst({
      where: { id: stepId },
      include: { sequence: true },
    });
    if (!step || step.sequence.tenantId !== tenantId) {
      throw new Error('Step not found');
    }

    return this.prisma.emailSequenceStep.update({
      where: { id: stepId },
      data,
      include: { template: true },
    });
  }

  async deleteSequenceStep(tenantId: string, stepId: string) {
    const step = await this.prisma.emailSequenceStep.findFirst({
      where: { id: stepId },
      include: { sequence: true },
    });
    if (!step || step.sequence.tenantId !== tenantId) {
      throw new Error('Step not found');
    }

    return this.prisma.emailSequenceStep.delete({
      where: { id: stepId },
    });
  }

  // ============ SCHEDULED COMMUNICATIONS ============
  async getScheduledCommunications(tenantId: string, status?: string) {
    return this.prisma.scheduledCommunication.findMany({
      where: {
        tenantId,
        ...(status && status !== 'all' ? { status } : {}),
      },
      include: { contact: true },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  async createScheduledCommunication(tenantId: string, data: any) {
    return this.prisma.scheduledCommunication.create({
      data: {
        tenantId,
        contactId: data.contactId,
        dealId: data.dealId,
        templateId: data.templateId,
        type: data.type || 'email',
        subject: data.subject,
        body: data.body,
        scheduledFor: new Date(data.scheduledFor),
        status: data.status || 'pending',
        needsApproval: data.needsApproval || false,
      },
      include: { contact: true },
    });
  }

  async updateScheduledCommunication(tenantId: string, id: string, data: any) {
    return this.prisma.scheduledCommunication.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  async approveScheduledCommunication(tenantId: string, id: string) {
    return this.prisma.scheduledCommunication.updateMany({
      where: { id, tenantId },
      data: { status: 'approved' },
    });
  }

  async cancelScheduledCommunication(tenantId: string, id: string) {
    return this.prisma.scheduledCommunication.updateMany({
      where: { id, tenantId },
      data: { status: 'cancelled' },
    });
  }

  // ============ SEQUENCE ENROLLMENTS ============
  async enrollContact(tenantId: string, sequenceId: string, contactId: string, dealId?: string) {
    const sequence = await this.prisma.emailSequence.findFirst({
      where: { id: sequenceId, tenantId },
    });
    if (!sequence) throw new Error('Sequence not found');

    const existing = await this.prisma.sequenceEnrollment.findFirst({
      where: { sequenceId, contactId, status: 'active' },
    });
    if (existing) throw new Error('Contact already enrolled');

    return this.prisma.sequenceEnrollment.create({
      data: {
        sequenceId,
        contactId,
        dealId,
        status: 'active',
        currentStep: 0,
      },
      include: { contact: true, sequence: true },
    });
  }

  async unenrollContact(tenantId: string, enrollmentId: string) {
    const enrollment = await this.prisma.sequenceEnrollment.findFirst({
      where: { id: enrollmentId },
      include: { sequence: true },
    });
    if (!enrollment || enrollment.sequence.tenantId !== tenantId) {
      throw new Error('Enrollment not found');
    }

    return this.prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'cancelled' },
    });
  }
}
