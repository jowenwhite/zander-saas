import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findOne(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        companyName: true,
        subdomain: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(tenantId: string, data: {
    companyName?: string;
    subdomain?: string;
  }) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        companyName: data.companyName,
        subdomain: data.subdomain,
      },
      select: {
        id: true,
        companyName: true,
        subdomain: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return tenant;
  }
}
