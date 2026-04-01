import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  /**
   * Get the effective subscription tier for a tenant.
   * Priority: tierOverride > active trial > subscriptionTier > FREE
   */
  async getEffectiveTier(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        subscriptionTier: true,
        tierOverride: true,
        tierOverrideNote: true,
        trialTier: true,
        trialStartDate: true,
        trialEndDate: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Determine effective tier: tierOverride > active trial > subscriptionTier > FREE
    let effectiveTier = tenant.subscriptionTier || 'FREE';
    let tierSource: 'subscription' | 'override' | 'trial' = 'subscription';
    let trialDaysRemaining: number | null = null;

    // Check for tier override (admin-granted access)
    if (tenant.tierOverride) {
      effectiveTier = tenant.tierOverride;
      tierSource = 'override';
    }
    // Check for active trial
    else if (tenant.trialTier && tenant.trialStartDate && tenant.trialEndDate) {
      const now = new Date();
      const trialStart = new Date(tenant.trialStartDate);
      const trialEnd = new Date(tenant.trialEndDate);

      if (now >= trialStart && now <= trialEnd) {
        effectiveTier = tenant.trialTier;
        tierSource = 'trial';
        trialDaysRemaining = Math.ceil(
          (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    return {
      tenantId: tenant.id,
      effectiveTier: effectiveTier.toUpperCase(),
      tierSource,
      baseTier: (tenant.subscriptionTier || 'FREE').toUpperCase(),
      trialTier: tenant.trialTier?.toUpperCase() || null,
      trialEndDate: tenant.trialEndDate,
      trialDaysRemaining,
      tierOverride: tenant.tierOverride?.toUpperCase() || null,
      tierOverrideNote: tenant.tierOverrideNote,
      hasStripeSubscription: !!tenant.stripeSubscriptionId,
    };
  }
}
