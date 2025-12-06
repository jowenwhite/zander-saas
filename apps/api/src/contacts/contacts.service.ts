import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.contact.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.contact.findFirst({
      where: { id, tenantId },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.contact.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }
}
