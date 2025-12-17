import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivitiesService } from './activities.service';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async findAll(@Request() req, @Query() query: any) {
    return this.activitiesService.findAll(req.tenantId, query);
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

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.activitiesService.delete(id, req.tenantId);
  }
}
