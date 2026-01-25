import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface StorageInfo {
  used: number;
  limit: number;
  usedFormatted: string;
  limitFormatted: string;
  percentUsed: number;
  canUpload: boolean;
}

export interface UploadValidation {
  allowed: boolean;
  used: number;
  limit: number;
  message?: string;
}

@Injectable()
export class StorageService {
  // Storage limits by subscription tier (in bytes)
  private readonly STORAGE_LIMITS: Record<string, number> = {
    starter: 500 * 1024 * 1024,           // 500 MB
    professional: 5 * 1024 * 1024 * 1024, // 5 GB
    enterprise: 50 * 1024 * 1024 * 1024,  // 50 GB
    // Default for unknown/null tier
    default: 500 * 1024 * 1024,           // 500 MB
  };

  // Max file size per upload (50 MB)
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024;

  // Allowed MIME types
  private readonly ALLOWED_MIME_TYPES: Record<string, string[]> = {
    image: [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/svg+xml',
      'image/webp',
    ],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    video: [
      'video/mp4',
      'video/quicktime',
      'video/webm',
    ],
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Get storage usage for a tenant
   */
  async getStorageUsed(tenantId: string): Promise<number> {
    const result = await this.prisma.contentAsset.aggregate({
      where: { tenantId, isArchived: false },
      _sum: { fileSize: true },
    });
    return result._sum.fileSize || 0;
  }

  /**
   * Get storage limit for a tenant based on subscription tier
   */
  async getStorageLimit(tenantId: string): Promise<number> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { subscriptionTier: true },
    });

    const tier = tenant?.subscriptionTier?.toLowerCase() || 'default';
    return this.STORAGE_LIMITS[tier] || this.STORAGE_LIMITS.default;
  }

  /**
   * Get complete storage info for a tenant
   */
  async getStorageInfo(tenantId: string): Promise<StorageInfo> {
    const [used, limit] = await Promise.all([
      this.getStorageUsed(tenantId),
      this.getStorageLimit(tenantId),
    ]);

    const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;

    return {
      used,
      limit,
      usedFormatted: this.formatBytes(used),
      limitFormatted: this.formatBytes(limit),
      percentUsed,
      canUpload: used < limit,
    };
  }

  /**
   * Check if tenant can upload a file of given size
   */
  async canUpload(tenantId: string, fileSize: number): Promise<UploadValidation> {
    const [used, limit] = await Promise.all([
      this.getStorageUsed(tenantId),
      this.getStorageLimit(tenantId),
    ]);

    const newTotal = used + fileSize;

    if (newTotal > limit) {
      return {
        allowed: false,
        used,
        limit,
        message: `Upload would exceed storage limit. Used: ${this.formatBytes(used)}, Limit: ${this.formatBytes(limit)}, File: ${this.formatBytes(fileSize)}`,
      };
    }

    return {
      allowed: true,
      used,
      limit,
    };
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: Express.Multer.File,
  ): { valid: boolean; assetType: string; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        assetType: '',
        error: `File size exceeds maximum allowed (${this.formatBytes(this.MAX_FILE_SIZE)})`,
      };
    }

    // Determine asset type and validate MIME type
    const mimeType = file.mimetype.toLowerCase();

    for (const [assetType, allowedTypes] of Object.entries(this.ALLOWED_MIME_TYPES)) {
      if (allowedTypes.includes(mimeType)) {
        return { valid: true, assetType };
      }
    }

    return {
      valid: false,
      assetType: '',
      error: `File type not allowed: ${mimeType}. Allowed types: images (PNG, JPG, GIF, SVG, WebP), documents (PDF, DOC, DOCX, XLS, XLSX), videos (MP4, MOV, WebM)`,
    };
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get max file size
   */
  getMaxFileSize(): number {
    return this.MAX_FILE_SIZE;
  }
}
