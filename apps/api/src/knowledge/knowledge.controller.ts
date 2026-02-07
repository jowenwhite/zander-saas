import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeCategory } from '@prisma/client';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('category') category?: KnowledgeCategory,
    @Query('search') search?: string,
    @Query('published') published?: string,
  ) {
    // All authenticated users can read published articles
    // SuperAdmin can see drafts too
    const isPublished = req.user.isSuperAdmin 
      ? (published === 'false' ? false : published === 'true' ? true : undefined)
      : true;

    return this.knowledgeService.findAll({
      category,
      search,
      isPublished,
    });
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    // Public search endpoint for AI executives
    return this.knowledgeService.search(query, limit ? parseInt(limit) : 10);
  }

  @Get('stats')
  async getStats(@Request() req) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only SuperAdmin can access knowledge stats');
    }
    return this.knowledgeService.getStats();
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.knowledgeService.findBySlug(slug);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.knowledgeService.findOne(id);
  }

  @Post()
  async create(
    @Request() req,
    @Body() data: {
      title: string;
      slug: string;
      content: string;
      summary?: string;
      category?: KnowledgeCategory;
      tags?: string[];
      searchTerms?: string;
      isPublished?: boolean;
      sortOrder?: number;
    },
  ) {
    // Only SuperAdmin can create knowledge articles
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only SuperAdmin can create knowledge articles');
    }

    return this.knowledgeService.create({
      ...data,
      createdById: req.user.userId,
    });
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() data: {
      title?: string;
      slug?: string;
      content?: string;
      summary?: string;
      category?: KnowledgeCategory;
      tags?: string[];
      searchTerms?: string;
      isPublished?: boolean;
      sortOrder?: number;
    },
  ) {
    // Only SuperAdmin can update knowledge articles
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only SuperAdmin can update knowledge articles');
    }

    return this.knowledgeService.update(id, data);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    // Only SuperAdmin can delete knowledge articles
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only SuperAdmin can delete knowledge articles');
    }

    return this.knowledgeService.delete(id);
  }
}
