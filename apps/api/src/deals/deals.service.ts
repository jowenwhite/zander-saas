import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.deal.findMany({
      where: { tenantId },
      include: { contact: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.deal.findFirst({
      where: { id, tenantId },
      include: { contact: true },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.deal.create({
      data: {
        ...data,
        tenantId,
      },
      include: { contact: true },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.deal.update({
      where: { id },
      data,
      include: { contact: true },
    });
  }
}
