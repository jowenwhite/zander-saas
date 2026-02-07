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
import { HeadwindsService } from './headwinds.service';
import { HeadwindPriority, HeadwindCategory, HeadwindStatus } from '@prisma/client';

@Controller('headwinds')
@UseGuards(JwtAuthGuard)
export class HeadwindsController {
  constructor(private readonly headwindsService: HeadwindsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('priority') priority?: HeadwindPriority,
    @Query('status') status?: HeadwindStatus,
    @Query('category') category?: HeadwindCategory,
    @Query('tenantId') tenantId?: string,
    @Query('systemOnly') systemOnly?: string,
  ) {
    // Only SuperAdmin can see all headwinds
    if (!req.user.isSuperAdmin) {
      // Regular users only see their tenant's headwinds
      return this.headwindsService.findAll({
        priority,
        status,
        category,
        tenantId: req.user.tenantId,
      });
    }

    return this.headwindsService.findAll({
      priority,
      status,
      category,
      tenantId,
      systemOnly: systemOnly === 'true',
    });
  }

  @Get('stats')
  async getStats(@Request() req) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only SuperAdmin can access headwind stats');
    }
    return this.headwindsService.getStats();
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const headwind = await this.headwindsService.findOne(id);
    
    // Non-SuperAdmins can only view their tenant's headwinds
    if (!req.user.isSuperAdmin && headwind.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    
    return headwind;
  }

  @Post()
  async create(
    @Request() req,
    @Body() data: {
      title: string;
      description?: string;
      priority?: HeadwindPriority;
      category?: HeadwindCategory;
      tenantId?: string;
      assignedToId?: string;
      gitBranch?: string;
    },
  ) {
    // Only SuperAdmin can create system-wide headwinds (no tenantId)
    if (!req.user.isSuperAdmin && !data.tenantId) {
      data.tenantId = req.user.tenantId;
    }

    return this.headwindsService.create({
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
      description?: string;
      priority?: HeadwindPriority;
      category?: HeadwindCategory;
      status?: HeadwindStatus;
      assignedToId?: string;
      gitCommit?: string;
      gitBranch?: string;
      resolution?: string;
    },
  ) {
    // Verify access
    const headwind = await this.headwindsService.findOne(id);
    if (!req.user.isSuperAdmin && headwind.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return this.headwindsService.update(id, data);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    // Verify access
    const headwind = await this.headwindsService.findOne(id);
    if (!req.user.isSuperAdmin && headwind.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return this.headwindsService.delete(id);
  }
}
