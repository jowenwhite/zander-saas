import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        lineItems: {
          include: {
            project: true,
          },
        },
      },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.product.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!product) {
      throw new Error('Product not found');
    }
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!product) {
      throw new Error('Product not found');
    }
    // Soft delete by setting status to DISCONTINUED
    return this.prisma.product.update({
      where: { id },
      data: { status: 'DISCONTINUED' },
    });
  }
}
