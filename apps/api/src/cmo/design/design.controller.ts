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
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DesignService } from './design.service';

@Controller('design-assets')
@UseGuards(JwtAuthGuard)
export class DesignAssetsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly designService: DesignService,
  ) {}

  /**
   * GET /design-assets
   * List assets for tenant with filters
   */
  @Get()
  async listAssets(
    @Request() req,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('source') source?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const tenantId = req.user.tenantId;

    const where: Record<string, unknown> = { tenantId };
    if (type) where.type = type;
    if (source) where.source = source;
    // Status filter would require schema update - using tags as workaround
    if (status) {
      where.tags = { has: status };
    }

    const assets = await this.prisma.designAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit, 10) : 50,
      skip: offset ? parseInt(offset, 10) : 0,
    });

    const total = await this.prisma.designAsset.count({ where });

    return {
      success: true,
      assets,
      pagination: {
        total,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      },
    };
  }

  /**
   * GET /design-assets/:id
   * Get single asset
   */
  @Get(':id')
  async getAsset(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;

    const asset = await this.prisma.designAsset.findFirst({
      where: { id, tenantId },
    });

    if (!asset) {
      throw new NotFoundException('Design asset not found');
    }

    return { success: true, asset };
  }

  /**
   * POST /design-assets
   * Create asset record
   */
  @Post()
  async createAsset(
    @Request() req,
    @Body()
    body: {
      name: string;
      type: string;
      source?: string;
      sourceId?: string;
      fileUrl?: string;
      thumbnailUrl?: string;
      dimensions?: { width: number; height: number };
      tags?: string[];
      campaignId?: string;
    },
  ) {
    const tenantId = req.user.tenantId;

    if (!body.name || !body.type) {
      throw new BadRequestException('Name and type are required');
    }

    const asset = await this.prisma.designAsset.create({
      data: {
        tenantId,
        name: body.name,
        type: body.type.toUpperCase(),
        source: body.source || 'manual',
        sourceId: body.sourceId,
        fileUrl: body.fileUrl,
        thumbnailUrl: body.thumbnailUrl,
        dimensions: body.dimensions,
        tags: body.tags || [],
        campaignId: body.campaignId,
      },
    });

    return { success: true, asset };
  }

  /**
   * PATCH /design-assets/:id
   * Update asset
   */
  @Patch(':id')
  async updateAsset(
    @Request() req,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      type?: string;
      fileUrl?: string;
      thumbnailUrl?: string;
      tags?: string[];
      campaignId?: string;
    },
  ) {
    const tenantId = req.user.tenantId;

    const existing = await this.prisma.designAsset.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Design asset not found');
    }

    const asset = await this.prisma.designAsset.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.type && { type: body.type.toUpperCase() }),
        ...(body.fileUrl && { fileUrl: body.fileUrl }),
        ...(body.thumbnailUrl && { thumbnailUrl: body.thumbnailUrl }),
        ...(body.tags && { tags: body.tags }),
        ...(body.campaignId !== undefined && { campaignId: body.campaignId }),
      },
    });

    return { success: true, asset };
  }

  /**
   * DELETE /design-assets/:id
   * Delete asset
   */
  @Delete(':id')
  async deleteAsset(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;

    const existing = await this.prisma.designAsset.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Design asset not found');
    }

    await this.prisma.designAsset.delete({ where: { id } });

    return { success: true, message: 'Asset deleted' };
  }

  /**
   * POST /design-assets/:id/attach/:postId
   * Attach asset to a social post
   */
  @Post(':id/attach/:postId')
  async attachToPost(
    @Request() req,
    @Param('id') id: string,
    @Param('postId') postId: string,
  ) {
    const tenantId = req.user.tenantId;

    // Verify asset exists
    const asset = await this.prisma.designAsset.findFirst({
      where: { id, tenantId },
    });

    if (!asset) {
      throw new NotFoundException('Design asset not found');
    }

    // Verify post exists
    const post = await this.prisma.socialPost.findFirst({
      where: { id: postId, tenantId },
    });

    if (!post) {
      throw new NotFoundException('Social post not found');
    }

    // Add post ID to usedInPosts array
    const usedInPosts = asset.usedInPosts || [];
    if (!usedInPosts.includes(postId)) {
      usedInPosts.push(postId);
    }

    // Update asset
    const updatedAsset = await this.prisma.designAsset.update({
      where: { id },
      data: {
        usedInPosts,
        tags: [...new Set([...(asset.tags || []), 'attached'])],
      },
    });

    // Update post's mediaUrls with asset's fileUrl
    if (asset.fileUrl && !post.mediaUrls.includes(asset.fileUrl)) {
      await this.prisma.socialPost.update({
        where: { id: postId },
        data: {
          mediaUrls: [...post.mediaUrls, asset.fileUrl],
        },
      });
    }

    return {
      success: true,
      message: 'Asset attached to post',
      asset: updatedAsset,
    };
  }
}
