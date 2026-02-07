import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ActivitiesService } from './activities.service';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async findAll(@Request() req, @Query() query: any) {
    return this.activitiesService.findAll(req.tenantId, query);
  }

  
  @Get('timeline')
  async getTimeline(@Request() req, @Query('contactId') contactId?: string, @Query('dealId') dealId?: string, @Query('limit') limit?: string) {
    return this.activitiesService.getTimeline(req.tenantId, {
      contactId,
      dealId,
      limit: limit ? parseInt(limit) : 50
    });
  }

@Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.activitiesService.findOne(id, req.tenantId);
  }

  @Post()
  async create(@Body() data: any, @Request() req) {
    return this.activitiesService.create(data, req.tenantId, req.user.userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Request() req) {
    return this.activitiesService.update(id, data, req.tenantId);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.activitiesService.delete(id, req.tenantId);
  }
}
