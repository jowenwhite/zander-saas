import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { UpdateLedgerEntryDto } from './dto/update-ledger-entry.dto';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters?: {
      category?: string;
      period?: string;
      status?: string;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.category) where.category = filters.category;
    if (filters?.period) where.period = filters.period;
    if (filters?.status) where.status = filters.status;

    return this.prisma.ledgerEntry.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, tenantId: string) {
    const entry = await this.prisma.ledgerEntry.findFirst({
      where: { id, tenantId },
    });

    if (!entry) {
      throw new NotFoundException(`Ledger entry with ID ${id} not found`);
    }

    return entry;
  }

  async create(tenantId: string, data: CreateLedgerEntryDto) {
    // Get max sortOrder for this category
    const maxOrder = await this.prisma.ledgerEntry.aggregate({
      where: { tenantId, category: data.category },
      _max: { sortOrder: true },
    });

    return this.prisma.ledgerEntry.create({
      data: {
        tenantId,
        category: data.category,
        name: data.name,
        keystone: data.keystone,
        value: data.value,
        numericValue: data.numericValue,
        target: data.target,
        numericTarget: data.numericTarget,
        progress: data.progress,
        trend: data.trend,
        owner: data.owner,
        status: data.status || 'ON_TRACK',
        period: data.period,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
  }

  async update(id: string, tenantId: string, data: UpdateLedgerEntryDto) {
    await this.findOne(id, tenantId);

    const updateData: any = {};

    if (data.category !== undefined) updateData.category = data.category;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.keystone !== undefined) updateData.keystone = data.keystone;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.numericValue !== undefined) updateData.numericValue = data.numericValue;
    if (data.target !== undefined) updateData.target = data.target;
    if (data.numericTarget !== undefined) updateData.numericTarget = data.numericTarget;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.trend !== undefined) updateData.trend = data.trend;
    if (data.owner !== undefined) updateData.owner = data.owner;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.period !== undefined) updateData.period = data.period;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    return this.prisma.ledgerEntry.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.ledgerEntry.delete({
      where: { id },
    });
  }

  async getStats(tenantId: string) {
    const [company, team, personal, atRisk] = await Promise.all([
      this.prisma.ledgerEntry.count({
        where: { tenantId, category: 'COMPANY' },
      }),
      this.prisma.ledgerEntry.count({
        where: { tenantId, category: 'TEAM' },
      }),
      this.prisma.ledgerEntry.count({
        where: { tenantId, category: 'PERSONAL' },
      }),
      this.prisma.ledgerEntry.count({
        where: { tenantId, status: 'AT_RISK' },
      }),
    ]);

    // Calculate average progress
    const avgProgress = await this.prisma.ledgerEntry.aggregate({
      where: { tenantId, progress: { not: null } },
      _avg: { progress: true },
    });

    // Get status breakdown
    const statusBreakdown = await this.prisma.ledgerEntry.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    const statusCounts: Record<string, number> = {
      on_track: 0,
      at_risk: 0,
      behind: 0,
      exceeded: 0,
    };

    statusBreakdown.forEach((item) => {
      const key = item.status.toLowerCase().replace('_', '_');
      statusCounts[key] = item._count;
    });

    return {
      counts: {
        company,
        team,
        personal,
        total: company + team + personal,
      },
      atRisk,
      avgProgress: Math.round(avgProgress._avg.progress || 0),
      statusBreakdown: statusCounts,
    };
  }
}
