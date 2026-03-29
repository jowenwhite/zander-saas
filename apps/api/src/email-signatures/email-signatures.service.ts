import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailSignaturesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, tenantId: string) {
    return this.prisma.emailSignature.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, tenantId: string) {
    const signature = await this.prisma.emailSignature.findFirst({
      where: { id, userId, tenantId },
    });

    if (!signature) {
      throw new NotFoundException('Signature not found');
    }

    return signature;
  }

  async getDefault(userId: string, tenantId: string) {
    return this.prisma.emailSignature.findFirst({
      where: { userId, tenantId, isDefault: true },
    });
  }

  async create(userId: string, tenantId: string, data: {
    name: string;
    body: string;
    isDefault?: boolean;
  }) {
    // If this is set as default, unset any existing default
    if (data.isDefault) {
      await this.prisma.emailSignature.updateMany({
        where: { userId, tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the first signature, make it default
    const existingCount = await this.prisma.emailSignature.count({
      where: { userId, tenantId },
    });
    const shouldBeDefault = existingCount === 0 || data.isDefault;

    return this.prisma.emailSignature.create({
      data: {
        userId,
        tenantId,
        name: data.name,
        body: data.body,
        isDefault: shouldBeDefault,
      },
    });
  }

  async update(id: string, userId: string, tenantId: string, data: {
    name?: string;
    body?: string;
    isDefault?: boolean;
  }) {
    const signature = await this.prisma.emailSignature.findFirst({
      where: { id, userId, tenantId },
    });

    if (!signature) {
      throw new NotFoundException('Signature not found');
    }

    // If setting as default, unset any existing default
    if (data.isDefault) {
      await this.prisma.emailSignature.updateMany({
        where: { userId, tenantId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.emailSignature.update({
      where: { id },
      data,
    });
  }

  async setDefault(id: string, userId: string, tenantId: string) {
    const signature = await this.prisma.emailSignature.findFirst({
      where: { id, userId, tenantId },
    });

    if (!signature) {
      throw new NotFoundException('Signature not found');
    }

    // Unset all other defaults
    await this.prisma.emailSignature.updateMany({
      where: { userId, tenantId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this one as default
    return this.prisma.emailSignature.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async remove(id: string, userId: string, tenantId: string) {
    const signature = await this.prisma.emailSignature.findFirst({
      where: { id, userId, tenantId },
    });

    if (!signature) {
      throw new NotFoundException('Signature not found');
    }

    await this.prisma.emailSignature.delete({
      where: { id },
    });

    // If the deleted signature was the default, set another one as default
    if (signature.isDefault) {
      const remaining = await this.prisma.emailSignature.findFirst({
        where: { userId, tenantId },
        orderBy: { createdAt: 'asc' },
      });

      if (remaining) {
        await this.prisma.emailSignature.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true, message: 'Signature deleted successfully' };
  }
}
