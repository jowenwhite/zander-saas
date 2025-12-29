import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TreasuryService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    type?: string;
    category?: string;
    executive?: string;
    industry?: string;
    channels?: string[];
  }) {
    const where: any = { isActive: true };
    
    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.executive) where.executive = filters.executive;
    if (filters?.industry) where.industry = filters.industry;
    if (filters?.channels && filters.channels.length > 0) {
      where.channels = { hasSome: filters.channels };
    }

    return this.prisma.treasuryItem.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });
  }

  async findOne(id: string) {
    return this.prisma.treasuryItem.findUnique({
      where: { id },
    });
  }

  async findByType(type: string) {
    return this.prisma.treasuryItem.findMany({
      where: { type, isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });
  }

  async create(data: {
    type: string;
    name: string;
    description?: string;
    category?: string;
    executive?: string;
    industry?: string;
    channels?: string[];
    content: any;
    stepCount?: number;
    duration?: string;
  }) {
    return this.prisma.treasuryItem.create({
      data: {
        type: data.type,
        name: data.name,
        description: data.description,
        category: data.category,
        executive: data.executive,
        industry: data.industry,
        channels: data.channels || [],
        content: data.content,
        stepCount: data.stepCount,
        duration: data.duration,
      },
    });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    category?: string;
    executive?: string;
    industry?: string;
    channels?: string[];
    content?: any;
    stepCount?: number;
    duration?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    return this.prisma.treasuryItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.treasuryItem.delete({
      where: { id },
    });
  }
}
