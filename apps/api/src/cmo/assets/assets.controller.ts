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
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';

@Controller('cmo/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // File Upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
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

    return this.assetsService.uploadAsset(req.tenantId, file, {
      folder: folder || 'Images',
      description,
      tags: parsedTags,
    });
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
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.assetsService.deleteAsset(id, req.tenantId);
  }

  // Archive asset
  @Post(':id/archive')
  async archive(@Param('id') id: string, @Request() req) {
    return this.assetsService.archive(id, req.tenantId);
  }

  // Brand Profile
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
}
