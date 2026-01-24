import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PersonasService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.persona.findMany({
      where: { tenantId },
      include: {
        _count: { select: { contacts: true } },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, tenantId: string) {
    const persona = await this.prisma.persona.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { contacts: true } },
      },
    });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }
    return persona;
  }

  async create(
    tenantId: string,
    data: {
      name: string;
      avatar?: string;
      tagline?: string;
      demographics?: any;
      psychographics?: any;
      behaviors?: any;
      painPoints?: string[];
      goals?: string[];
      preferredChannels?: string[];
      brandAffinities?: string[];
      interview?: string;
      isDefault?: boolean;
    },
  ) {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.persona.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.persona.create({
      data: {
        tenantId,
        name: data.name,
        avatar: data.avatar,
        tagline: data.tagline,
        demographics: data.demographics || {},
        psychographics: data.psychographics || {},
        behaviors: data.behaviors || {},
        painPoints: data.painPoints || [],
        goals: data.goals || [],
        preferredChannels: data.preferredChannels || [],
        brandAffinities: data.brandAffinities || [],
        interview: data.interview,
        isDefault: data.isDefault || false,
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      avatar?: string;
      tagline?: string;
      demographics?: any;
      psychographics?: any;
      behaviors?: any;
      painPoints?: string[];
      goals?: string[];
      preferredChannels?: string[];
      brandAffinities?: string[];
      interview?: string;
      isDefault?: boolean;
    },
  ) {
    const persona = await this.prisma.persona.findFirst({
      where: { id, tenantId },
    });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    // If setting as default, unset others
    if (data.isDefault) {
      await this.prisma.persona.updateMany({
        where: { tenantId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.persona.update({
      where: { id },
      data: {
        name: data.name,
        avatar: data.avatar,
        tagline: data.tagline,
        demographics: data.demographics,
        psychographics: data.psychographics,
        behaviors: data.behaviors,
        painPoints: data.painPoints,
        goals: data.goals,
        preferredChannels: data.preferredChannels,
        brandAffinities: data.brandAffinities,
        interview: data.interview,
        isDefault: data.isDefault,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const persona = await this.prisma.persona.findFirst({
      where: { id, tenantId },
    });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    // Unlink contacts from this persona
    await this.prisma.contact.updateMany({
      where: { personaId: id },
      data: { personaId: null },
    });

    await this.prisma.persona.delete({ where: { id } });
    return { success: true, message: 'Persona deleted successfully' };
  }

  async getDefault(tenantId: string) {
    return this.prisma.persona.findFirst({
      where: { tenantId, isDefault: true },
    });
  }
}
