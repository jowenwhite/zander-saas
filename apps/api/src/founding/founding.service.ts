import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFoundingDto } from './dto/update-founding.dto';

@Injectable()
export class FoundingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get the tenant's founding document
   * Creates an empty one if none exists (singleton pattern)
   */
  async findOne(tenantId: string) {
    let document = await this.prisma.foundingDocument.findUnique({
      where: { tenantId },
    });

    // Auto-create empty document if none exists
    if (!document) {
      document = await this.prisma.foundingDocument.create({
        data: {
          tenantId,
          vision: null,
          mission: null,
          values: [],
          story: null,
        },
      });
    }

    return document;
  }

  /**
   * Upsert the entire founding document
   */
  async upsert(tenantId: string, data: UpdateFoundingDto) {
    return this.prisma.foundingDocument.upsert({
      where: { tenantId },
      update: {
        vision: data.vision,
        mission: data.mission,
        values: data.values as any,
        story: data.story,
      },
      create: {
        tenantId,
        vision: data.vision,
        mission: data.mission,
        values: (data.values || []) as any,
        story: data.story,
      },
    });
  }

  /**
   * Update just the vision field
   */
  async updateVision(tenantId: string, vision: string) {
    // Ensure document exists
    await this.findOne(tenantId);

    return this.prisma.foundingDocument.update({
      where: { tenantId },
      data: { vision },
    });
  }

  /**
   * Update just the mission field
   */
  async updateMission(tenantId: string, mission: string) {
    // Ensure document exists
    await this.findOne(tenantId);

    return this.prisma.foundingDocument.update({
      where: { tenantId },
      data: { mission },
    });
  }

  /**
   * Update just the values array
   */
  async updateValues(tenantId: string, values: { title: string; description: string }[]) {
    // Ensure document exists
    await this.findOne(tenantId);

    return this.prisma.foundingDocument.update({
      where: { tenantId },
      data: { values: values as any },
    });
  }

  /**
   * Update just the story field
   */
  async updateStory(tenantId: string, story: string) {
    // Ensure document exists
    await this.findOne(tenantId);

    return this.prisma.foundingDocument.update({
      where: { tenantId },
      data: { story },
    });
  }
}
