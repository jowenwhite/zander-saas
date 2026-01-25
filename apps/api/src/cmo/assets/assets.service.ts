import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { S3Service } from '../../common/s3/s3.service';
import { StorageService, StorageInfo } from '../../common/storage/storage.service';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private storageService: StorageService,
  ) {}

  // Upload asset to S3 and create database record
  async uploadAsset(
    tenantId: string,
    file: Express.Multer.File,
    metadata: {
      folder?: string;
      description?: string;
      tags?: string[];
    },
  ) {
    // Validate file type
    const validation = this.storageService.validateFile(file);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Check storage limits
    const canUpload = await this.storageService.canUpload(tenantId, file.size);
    if (!canUpload.allowed) {
      throw new BadRequestException(canUpload.message);
    }

    // Upload to S3
    const folder = metadata.folder || 'Images';
    const uploadResult = await this.s3Service.uploadFile(
      tenantId,
      folder,
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Create database record
    const asset = await this.prisma.contentAsset.create({
      data: {
        tenantId,
        name: file.originalname,
        assetType: validation.assetType,
        description: metadata.description,
        url: uploadResult.url,
        mimeType: file.mimetype,
        fileSize: file.size,
        folder,
        tags: metadata.tags || [],
        metadata: {
          s3Key: uploadResult.key,
          s3Bucket: uploadResult.bucket,
        },
      },
    });

    return asset;
  }

  // Delete asset from S3 and database
  async deleteAsset(id: string, tenantId: string) {
    const asset = await this.prisma.contentAsset.findFirst({
      where: { id, tenantId },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Try to delete from S3 if we have the key
    const s3Key = (asset.metadata as any)?.s3Key;
    if (s3Key) {
      try {
        await this.s3Service.deleteFile(s3Key);
      } catch (error) {
        // Log error but continue with database deletion
        console.error('Failed to delete from S3:', error);
      }
    } else if (asset.url) {
      // Try to extract key from URL
      const extractedKey = this.s3Service.extractKeyFromUrl(asset.url);
      if (extractedKey) {
        try {
          await this.s3Service.deleteFile(extractedKey);
        } catch (error) {
          console.error('Failed to delete from S3:', error);
        }
      }
    }

    // Delete from database
    await this.prisma.contentAsset.delete({ where: { id } });
    return { success: true, message: 'Asset deleted successfully' };
  }

  // Get storage statistics for tenant
  async getStorageStats(tenantId: string): Promise<StorageInfo> {
    return this.storageService.getStorageInfo(tenantId);
  }

  // Content Assets - List with search
  async findAll(
    tenantId: string,
    options?: {
      assetType?: string;
      folder?: string;
      isArchived?: boolean;
      search?: string;
    },
  ) {
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
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { tags: { has: options.search } },
      ];
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
        folder: data.folder,
        tags: data.tags,
        metadata: data.metadata,
        isArchived: data.isArchived,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    // Use deleteAsset for proper S3 cleanup
    return this.deleteAsset(id, tenantId);
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

  // Get folders with counts
  async getFoldersWithCounts(tenantId: string) {
    const predefinedFolders = ['Logos', 'Images', 'Documents', 'Templates'];

    // Get counts for each folder
    const counts = await this.prisma.contentAsset.groupBy({
      by: ['folder'],
      where: { tenantId, isArchived: false },
      _count: { id: true },
    });

    const countMap = new Map(counts.map((c) => [c.folder, c._count.id]));

    // Get total count
    const total = await this.prisma.contentAsset.count({
      where: { tenantId, isArchived: false },
    });

    return {
      folders: predefinedFolders.map((folder) => ({
        name: folder,
        count: countMap.get(folder) || 0,
      })),
      total,
    };
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
