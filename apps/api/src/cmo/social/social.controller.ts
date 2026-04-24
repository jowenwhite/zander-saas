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
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SocialMediaService } from './social.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSocialPostDto,
  UpdateSocialPostDto,
  ApprovePostDto,
  RejectPostDto,
  SchedulePostDto,
} from './dto';

@Controller('cmo/social/posts')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
export class SocialPostsController {
  constructor(
    private readonly socialService: SocialMediaService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /cmo/social/posts
   * List all social posts for the tenant with optional filters
   */
  @Get()
  async listPosts(
    @Request() req,
    @Query('status') status?: string,
    @Query('platform') platform?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const where: any = {
      tenantId: req.tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (platform) {
      where.socialAccount = {
        platform: platform.toLowerCase(),
      };
    }

    if (startDate || endDate) {
      where.scheduledFor = {};
      if (startDate) {
        where.scheduledFor.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledFor.lte = new Date(endDate);
      }
    }

    const posts = await this.prisma.socialPost.findMany({
      where,
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
      orderBy: [
        { scheduledFor: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit ? parseInt(limit) : 50,
    });

    return {
      posts,
      total: posts.length,
    };
  }

  /**
   * GET /cmo/social/posts/queue
   * Get posts pending approval (status: draft or pending_approval)
   */
  @Get('queue')
  async getApprovalQueue(@Request() req) {
    const posts = await this.prisma.socialPost.findMany({
      where: {
        tenantId: req.tenantId,
        status: {
          in: ['draft', 'pending_approval'],
        },
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
      orderBy: [
        { scheduledFor: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return {
      posts,
      total: posts.length,
      pendingCount: posts.filter((p) => p.status === 'pending_approval').length,
      draftCount: posts.filter((p) => p.status === 'draft').length,
    };
  }

  /**
   * GET /cmo/social/posts/:id
   * Get a single post by ID
   */
  @Get(':id')
  async getPost(@Param('id') id: string, @Request() req) {
    const post = await this.prisma.socialPost.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
        engagements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Social post not found');
    }

    return post;
  }

  /**
   * POST /cmo/social/posts
   * Create a new social post draft
   */
  @Post()
  async createPost(@Request() req, @Body() createDto: CreateSocialPostDto) {
    // Find or create a default social account if not specified
    let socialAccountId = createDto.socialAccountId;

    if (!socialAccountId && createDto.platform) {
      // Find an account for this platform
      const account = await this.prisma.socialAccount.findFirst({
        where: {
          tenantId: req.tenantId,
          platform: createDto.platform.toLowerCase(),
          isActive: true,
        },
      });

      if (account) {
        socialAccountId = account.id;
      } else {
        // Create a placeholder account for the platform
        const newAccount = await this.prisma.socialAccount.create({
          data: {
            tenantId: req.tenantId,
            platform: createDto.platform.toLowerCase(),
            accountName: `${createDto.platform} (Not Connected)`,
            accountId: `placeholder_${Date.now()}`,
            connectedBy: req.user.id,
            isActive: true,
          },
        });
        socialAccountId = newAccount.id;
      }
    }

    if (!socialAccountId) {
      throw new BadRequestException(
        'Either socialAccountId or platform must be provided',
      );
    }

    const post = await this.prisma.socialPost.create({
      data: {
        tenantId: req.tenantId,
        socialAccountId,
        content: createDto.content,
        mediaUrls: createDto.mediaUrls || [],
        scheduledFor: createDto.scheduledFor
          ? new Date(createDto.scheduledFor)
          : null,
        campaignId: createDto.campaignId || null,
        calendarEventId: createDto.calendarEventId || null,
        status: createDto.status || 'draft',
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
    });

    return post;
  }

  /**
   * PATCH /cmo/social/posts/:id
   * Update a social post
   */
  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateSocialPostDto,
  ) {
    const existing = await this.prisma.socialPost.findFirst({
      where: { id, tenantId: req.tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Social post not found');
    }

    const post = await this.prisma.socialPost.update({
      where: { id },
      data: {
        content: updateDto.content ?? existing.content,
        mediaUrls: updateDto.mediaUrls ?? existing.mediaUrls,
        scheduledFor: updateDto.scheduledFor
          ? new Date(updateDto.scheduledFor)
          : existing.scheduledFor,
        campaignId: updateDto.campaignId ?? existing.campaignId,
        status: updateDto.status ?? existing.status,
        updatedAt: new Date(),
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
    });

    return post;
  }

  /**
   * PATCH /cmo/social/posts/:id/approve
   * Approve a post for publishing
   */
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'member')
  @Patch(':id/approve')
  async approvePost(
    @Param('id') id: string,
    @Request() req,
    @Body() approveDto: ApprovePostDto,
  ) {
    const existing = await this.prisma.socialPost.findFirst({
      where: { id, tenantId: req.tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Social post not found');
    }

    if (!['draft', 'pending_approval'].includes(existing.status)) {
      throw new BadRequestException(
        `Cannot approve post with status: ${existing.status}`,
      );
    }

    const post = await this.prisma.socialPost.update({
      where: { id },
      data: {
        status: existing.scheduledFor ? 'scheduled' : 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        metadata: approveDto.comment
          ? {
              ...(typeof existing.metadata === 'object' && existing.metadata !== null
                ? existing.metadata
                : {}),
              approvalComment: approveDto.comment,
            }
          : existing.metadata,
        updatedAt: new Date(),
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
    });

    return {
      ...post,
      message: 'Post approved successfully',
    };
  }

  /**
   * PATCH /cmo/social/posts/:id/reject
   * Reject a post and move back to draft
   */
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'member')
  @Patch(':id/reject')
  async rejectPost(
    @Param('id') id: string,
    @Request() req,
    @Body() rejectDto: RejectPostDto,
  ) {
    const existing = await this.prisma.socialPost.findFirst({
      where: { id, tenantId: req.tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Social post not found');
    }

    if (!['draft', 'pending_approval', 'scheduled'].includes(existing.status)) {
      throw new BadRequestException(
        `Cannot reject post with status: ${existing.status}`,
      );
    }

    const post = await this.prisma.socialPost.update({
      where: { id },
      data: {
        status: 'draft',
        approvedBy: null,
        approvedAt: null,
        metadata: {
          ...(typeof existing.metadata === 'object' && existing.metadata !== null
            ? existing.metadata
            : {}),
          rejectedBy: req.user.id,
          rejectedAt: new Date().toISOString(),
          rejectionReason: rejectDto.reason || 'No reason provided',
        },
        updatedAt: new Date(),
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
    });

    return {
      ...post,
      message: 'Post rejected and returned to draft',
    };
  }

  /**
   * PATCH /cmo/social/posts/:id/schedule
   * Schedule a post for a specific time
   */
  @Patch(':id/schedule')
  async schedulePost(
    @Param('id') id: string,
    @Request() req,
    @Body() scheduleDto: SchedulePostDto,
  ) {
    const existing = await this.prisma.socialPost.findFirst({
      where: { id, tenantId: req.tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Social post not found');
    }

    if (['published', 'failed'].includes(existing.status)) {
      throw new BadRequestException(
        `Cannot schedule post with status: ${existing.status}`,
      );
    }

    const scheduledFor = new Date(scheduleDto.scheduledFor);
    if (scheduledFor <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    const post = await this.prisma.socialPost.update({
      where: { id },
      data: {
        scheduledFor,
        status: existing.approvedBy ? 'scheduled' : 'pending_approval',
        updatedAt: new Date(),
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
    });

    return {
      ...post,
      message: `Post scheduled for ${scheduledFor.toISOString()}`,
    };
  }

  /**
   * DELETE /cmo/social/posts/:id
   * Delete a draft post (only drafts can be deleted)
   */
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Request() req) {
    const existing = await this.prisma.socialPost.findFirst({
      where: { id, tenantId: req.tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Social post not found');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException('Only draft posts can be deleted');
    }

    await this.prisma.socialPost.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Post deleted successfully',
    };
  }

  /**
   * POST /cmo/social/posts/:id/publish
   * Immediately publish an approved post
   */
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Post(':id/publish')
  async publishPost(@Param('id') id: string, @Request() req) {
    const existing = await this.prisma.socialPost.findFirst({
      where: { id, tenantId: req.tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Social post not found');
    }

    if (!['approved', 'scheduled'].includes(existing.status)) {
      throw new BadRequestException(
        `Post must be approved before publishing. Current status: ${existing.status}`,
      );
    }

    // Attempt to publish via the social service
    const result = await this.socialService.publishPost(id);

    return result;
  }

  /**
   * POST /cmo/social/posts/approve-all
   * Batch approve all pending posts
   */
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Post('approve-all')
  async approveAll(@Request() req) {
    const result = await this.prisma.socialPost.updateMany({
      where: {
        tenantId: req.tenantId,
        status: {
          in: ['draft', 'pending_approval'],
        },
      },
      data: {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `${result.count} posts approved`,
      approvedCount: result.count,
    };
  }
}
