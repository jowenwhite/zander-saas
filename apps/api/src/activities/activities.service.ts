import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: any) {
    const { contactId, dealId, type, page = 1, limit = 50 } = query;
    const where: any = { tenantId };
    
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (type) where.type = type;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { contact: true, deal: true, user: true }
      }),
      this.prisma.activity.count({ where })
    ]);

    return {
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  async findOne(id: string, tenantId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId },
      include: { contact: true, deal: true, user: true }
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  async create(data: any, tenantId: string, userId: string) {
    return this.prisma.activity.create({
      data: { ...data, tenantId, userId },
      include: { contact: true, deal: true, user: true }
    });
  }

  async update(id: string, data: any, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.activity.update({
      where: { id },
      data,
      include: { contact: true, deal: true, user: true }
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.activity.delete({ where: { id } });
  }
}
