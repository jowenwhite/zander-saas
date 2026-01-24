import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SegmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.segment.findMany({
      where: { tenantId },
      include: {
        _count: { select: { members: true, campaigns: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const segment = await this.prisma.segment.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { members: true, campaigns: true } },
      },
    });
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }
    return segment;
  }

  async create(
    tenantId: string,
    data: {
      name: string;
      description?: string;
      segmentType?: string;
      filterCriteria?: any;
    },
  ) {
    return this.prisma.segment.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        segmentType: data.segmentType || 'dynamic',
        filterCriteria: data.filterCriteria || {},
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      description?: string;
      segmentType?: string;
      filterCriteria?: any;
    },
  ) {
    const segment = await this.prisma.segment.findFirst({
      where: { id, tenantId },
    });
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    return this.prisma.segment.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        segmentType: data.segmentType,
        filterCriteria: data.filterCriteria,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const segment = await this.prisma.segment.findFirst({
      where: { id, tenantId },
    });
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    await this.prisma.segment.delete({ where: { id } });
    return { success: true, message: 'Segment deleted successfully' };
  }

  async getMembers(id: string, tenantId: string) {
    const segment = await this.prisma.segment.findFirst({
      where: { id, tenantId },
    });
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    return this.prisma.contactSegment.findMany({
      where: { segmentId: id },
      include: { contact: true },
      orderBy: { addedAt: 'desc' },
    });
  }

  async addMember(id: string, tenantId: string, contactId: string) {
    const segment = await this.prisma.segment.findFirst({
      where: { id, tenantId },
    });
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    // Check if contact belongs to tenant
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, tenantId },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // Check if already a member
    const existing = await this.prisma.contactSegment.findFirst({
      where: { segmentId: id, contactId },
    });
    if (existing) {
      return existing;
    }

    const membership = await this.prisma.contactSegment.create({
      data: { segmentId: id, contactId },
    });

    // Update segment count
    await this.prisma.segment.update({
      where: { id },
      data: { contactCount: { increment: 1 } },
    });

    return membership;
  }

  async removeMember(id: string, tenantId: string, contactId: string) {
    const segment = await this.prisma.segment.findFirst({
      where: { id, tenantId },
    });
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    const membership = await this.prisma.contactSegment.findFirst({
      where: { segmentId: id, contactId },
    });
    if (!membership) {
      throw new NotFoundException('Contact is not a member of this segment');
    }

    await this.prisma.contactSegment.delete({
      where: { id: membership.id },
    });

    // Update segment count
    await this.prisma.segment.update({
      where: { id },
      data: { contactCount: { decrement: 1 } },
    });

    return { success: true, message: 'Contact removed from segment' };
  }

  async calculate(id: string, tenantId: string) {
    const segment = await this.prisma.segment.findFirst({
      where: { id, tenantId },
    });
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    // For dynamic segments, recalculate membership based on filterCriteria
    // This is a placeholder - actual implementation would parse filterCriteria
    // and query contacts matching the criteria
    const memberCount = await this.prisma.contactSegment.count({
      where: { segmentId: id },
    });

    return this.prisma.segment.update({
      where: { id },
      data: {
        contactCount: memberCount,
        lastCalculated: new Date(),
      },
    });
  }
}
