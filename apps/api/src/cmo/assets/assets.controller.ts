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
} from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('cmo/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // Content Assets
  @Get()
  async findAll(
    @Request() req,
    @Query('assetType') assetType?: string,
    @Query('folder') folder?: string,
    @Query('archived') archived?: string,
  ) {
    return this.assetsService.findAll(req.tenantId, {
      assetType,
      folder,
      isArchived: archived === 'true',
    });
  }

  @Get('folders')
  async getFolders(@Request() req) {
    return this.assetsService.getFolders(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.assetsService.findOne(id, req.tenantId);
  }

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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updateData: {
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
    return this.assetsService.update(id, req.tenantId, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.assetsService.remove(id, req.tenantId);
  }

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
