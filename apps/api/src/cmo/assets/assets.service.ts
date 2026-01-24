import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  // Content Assets
  async findAll(tenantId: string, options?: { assetType?: string; folder?: string; isArchived?: boolean }) {
    const where: any = { tenantId };
    if (options?.assetType) {
      where.assetType = options.assetType;
    }
    if (options?.folder) {
      where.folder = options.folder;
    }
    if (options?.isArchived !== undefined) {
      where.isArchived = options.isArchived;
    } else {
      where.isArchived = false; // Default to non-archived
    }

    return this.prisma.contentAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const asset = await this.prisma.contentAsset.findFirst({
      where: { id, tenantId },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async create(
    tenantId: string,
    data: {
      name: string;
      assetType: string;
      description?: string;
      url: string;
      thumbnailUrl?: string;
      mimeType?: string;
      fileSize?: number;
      folder?: string;
      tags?: string[];
      metadata?: any;
    },
  ) {
    return this.prisma.contentAsset.create({
      data: {
        tenantId,
        name: data.name,
        assetType: data.assetType,
        description: data.description,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        folder: data.folder,
        tags: data.tags || [],
        metadata: data.metadata || {},
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    data: {
      name?: string;
      description?: string;
      url?: string;
      thumbnailUrl?: string;
      folder?: string;
      tags?: string[];
      metadata?: any;
      isArchived?: boolean;
    },
  ) {
    const asset = await this.prisma.contentAsset.findFirst({
      where: { id, tenantId },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.contentAsset.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        folder: data.folder,
        tags: data.tags,
        metadata: data.metadata,
        isArchived: data.isArchived,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const asset = await this.prisma.contentAsset.findFirst({
      where: { id, tenantId },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    await this.prisma.contentAsset.delete({ where: { id } });
    return { success: true, message: 'Asset deleted successfully' };
  }

  async archive(id: string, tenantId: string) {
    const asset = await this.prisma.contentAsset.findFirst({
      where: { id, tenantId },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.contentAsset.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async getFolders(tenantId: string) {
    const assets = await this.prisma.contentAsset.findMany({
      where: { tenantId, isArchived: false },
      select: { folder: true },
      distinct: ['folder'],
    });
    return assets
      .map((a) => a.folder)
      .filter((f): f is string => f !== null)
      .sort();
  }

  // Brand Profile
  async getBrandProfile(tenantId: string) {
    let profile = await this.prisma.brandProfile.findFirst({
      where: { tenantId },
    });

    // Create default profile if none exists
    if (!profile) {
      profile = await this.prisma.brandProfile.create({
        data: { tenantId },
      });
    }

    return profile;
  }

  async updateBrandProfile(
    tenantId: string,
    data: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      fontPrimary?: string;
      fontSecondary?: string;
      logoUrl?: string;
      logoIconUrl?: string;
      voiceTone?: string;
      voiceGuidelines?: string;
      tagline?: string;
      mission?: string;
    },
  ) {
    const existing = await this.prisma.brandProfile.findFirst({
      where: { tenantId },
    });

    if (existing) {
      return this.prisma.brandProfile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return this.prisma.brandProfile.create({
        data: { tenantId, ...data },
      });
    }
  }
}
