import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKeystoneDto } from './dto/create-keystone.dto';
import { UpdateKeystoneDto } from './dto/update-keystone.dto';
import { ReorderKeystonesDto } from './dto/reorder-keystones.dto';

// Default keystones for new tenants
const DEFAULT_KEYSTONES = [
  { executive: 'CRO', label: 'Pipeline Value', value: '$0', icon: 'briefcase', color: '#00CCEE', sortOrder: 0 },
  { executive: 'CFO', label: 'Cash on Hand', value: '$0', icon: 'barChart', color: '#2E7D32', sortOrder: 1 },
  { executive: 'COO', label: 'On-Time Delivery', value: '0%', icon: 'settings', color: '#5E35B1', sortOrder: 2 },
  { executive: 'CMO', label: 'Leads This Month', value: '0', icon: 'palette', color: '#F57C00', sortOrder: 3 },
  { executive: 'CPO', label: 'Team Satisfaction', value: '0/5', icon: 'users', color: '#0288D1', sortOrder: 4 },
  { executive: 'CIO', label: 'System Uptime', value: '0%', icon: 'monitor', color: '#455A64', sortOrder: 5 },
  { executive: 'EA', label: 'Tasks Completed', value: '0/0', icon: 'clipboard', color: '#C2185B', sortOrder: 6 },
];

@Injectable()
export class KeystonesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    let keystones = await this.prisma.keystone.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });

    // Seed default keystones if none exist
    if (keystones.length === 0) {
      await this.seedDefaults(tenantId);
      keystones = await this.prisma.keystone.findMany({
        where: { tenantId },
        orderBy: { sortOrder: 'asc' },
      });
    }

    return keystones;
  }

  async seedDefaults(tenantId: string) {
    const createPromises = DEFAULT_KEYSTONES.map((keystone) =>
      this.prisma.keystone.create({
        data: {
          tenantId,
          ...keystone,
        },
      }),
    );
    return Promise.all(createPromises);
  }

  async findOne(id: string, tenantId: string) {
    const keystone = await this.prisma.keystone.findFirst({
      where: { id, tenantId },
    });

    if (!keystone) {
      throw new NotFoundException(`Keystone with ID ${id} not found`);
    }

    return keystone;
  }

  async create(tenantId: string, data: CreateKeystoneDto) {
    // Get max sortOrder for this tenant
    const maxOrder = await this.prisma.keystone.aggregate({
      where: { tenantId },
      _max: { sortOrder: true },
    });

    return this.prisma.keystone.create({
      data: {
        tenantId,
        executive: data.executive,
        label: data.label,
        value: data.value,
        numericValue: data.numericValue,
        target: data.target,
        numericTarget: data.numericTarget,
        trend: data.trend,
        trendValue: data.trendValue,
        color: data.color,
        icon: data.icon,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
  }

  async update(id: string, tenantId: string, data: UpdateKeystoneDto) {
    await this.findOne(id, tenantId);

    const updateData: any = {};

    if (data.executive !== undefined) updateData.executive = data.executive;
    if (data.label !== undefined) updateData.label = data.label;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.numericValue !== undefined) updateData.numericValue = data.numericValue;
    if (data.target !== undefined) updateData.target = data.target;
    if (data.numericTarget !== undefined) updateData.numericTarget = data.numericTarget;
    if (data.trend !== undefined) updateData.trend = data.trend;
    if (data.trendValue !== undefined) updateData.trendValue = data.trendValue;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    return this.prisma.keystone.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.keystone.delete({
      where: { id },
    });
  }

  async reorder(tenantId: string, data: ReorderKeystonesDto) {
    const updatePromises = data.items.map((item) =>
      this.prisma.keystone.updateMany({
        where: { id: item.id, tenantId },
        data: { sortOrder: item.sortOrder },
      }),
    );

    await Promise.all(updatePromises);

    return this.findAll(tenantId);
  }
}
