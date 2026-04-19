import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AssetsService } from './assets.service';

@Controller('cmo/assets')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // File Upload
  // MEDIUM-2: File upload size limit (10MB max)
  // FIX: Explicit memoryStorage ensures file.buffer is populated for S3 upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
  }))
  async uploadAsset(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('description') description?: string,
    @Body('tags') tags?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Parse tags from comma-separated string or JSON array
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    try {
      return await this.assetsService.uploadAsset(req.tenantId, file, {
        folder: folder || 'Images',
        description,
        tags: parsedTags,
      });
    } catch (error) {
      // Log the actual error for debugging
      console.error('[AssetsController] Upload failed:', error);
      throw new BadRequestException(
        `Upload failed: ${error.message || 'Unknown error'}`,
      );
    }
  }

  // Storage Info
  @Get('storage')
  async getStorageInfo(@Request() req) {
    return this.assetsService.getStorageStats(req.tenantId);
  }

  // Content Assets - List
  @Get()
  async findAll(
    @Request() req,
    @Query('assetType') assetType?: string,
    @Query('folder') folder?: string,
    @Query('archived') archived?: string,
    @Query('search') search?: string,
  ) {
    return this.assetsService.findAll(req.tenantId, {
      assetType,
      folder,
      isArchived: archived === 'true',
      search,
    });
  }

  // Folders - Get available folders with counts
  @Get('folders')
  async getFolders(@Request() req) {
    return this.assetsService.getFoldersWithCounts(req.tenantId);
  }

  // Brand Profile - MUST be before :id routes to avoid matching 'brand' as an ID
  @Get('brand')
  async getBrandProfile(@Request() req) {
    return this.assetsService.getBrandProfile(req.tenantId);
  }

  @Patch('brand')
  async updateBrandProfile(
    @Request() req,
    @Body()
    updateData: {
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
    return this.assetsService.updateBrandProfile(req.tenantId, updateData);
  }

  // Get single asset
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.assetsService.findOne(id, req.tenantId);
  }

  // Create asset (metadata only - for external URLs)
  @Post()
  async create(
    @Request() req,
    @Body()
    createData: {
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
    return this.assetsService.create(req.tenantId, createData);
  }

  // Update asset metadata
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updateData: {
      name?: string;
      description?: string;
      folder?: string;
      tags?: string[];
      metadata?: any;
      isArchived?: boolean;
    },
  ) {
    return this.assetsService.update(id, req.tenantId, updateData);
  }

  // Delete asset (removes from S3 and database)
  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.assetsService.deleteAsset(id, req.tenantId);
  }

  // Archive asset
  @Post(':id/archive')
  async archive(@Param('id') id: string, @Request() req) {
    return this.assetsService.archive(id, req.tenantId);
  }
}
