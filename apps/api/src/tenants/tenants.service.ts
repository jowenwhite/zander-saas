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
        website: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        industry: true,
        fiscalYearStart: true,
        currency: true,
        taxRate: true,
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
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    industry?: string;
    fiscalYearStart?: number;
    currency?: string;
    taxRate?: number;
  }) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        companyName: data.companyName,
        subdomain: data.subdomain,
        website: data.website,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        industry: data.industry,
        fiscalYearStart: data.fiscalYearStart,
        currency: data.currency,
        taxRate: data.taxRate,
      },
      select: {
        id: true,
        companyName: true,
        subdomain: true,
        website: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        industry: true,
        fiscalYearStart: true,
        currency: true,
        taxRate: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return tenant;
  }

  async getAccessibleTenants(userId: string, isSuperAdmin: boolean) {
    if (isSuperAdmin) {
      return this.prisma.tenant.findMany({
        select: {
          id: true,
          companyName: true,
          subdomain: true,
          tenantType: true,
        },
        orderBy: { companyName: 'asc' }
      });
    }
    const access = await this.prisma.userTenantAccess.findMany({
      where: { userId },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
            subdomain: true,
            tenantType: true,
          }
        }
      }
    });
    return access.map(a => a.tenant);
  }

  async switchTenant(userId: string, targetTenantId: string, isSuperAdmin: boolean) {
    if (!isSuperAdmin) {
      const access = await this.prisma.userTenantAccess.findFirst({
        where: { userId, tenantId: targetTenantId }
      });
      if (!access) {
        throw new NotFoundException('You do not have access to this tenant');
      }
    }
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: targetTenantId }
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }
}
