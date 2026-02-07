import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SegmentsService } from './segments.service';

@Controller('cmo/segments')
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.segmentsService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.segmentsService.findOne(id, req.tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body()
    createData: {
      name: string;
      description?: string;
      segmentType?: string;
      filterCriteria?: any;
    },
  ) {
    return this.segmentsService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updateData: {
      name?: string;
      description?: string;
      segmentType?: string;
      filterCriteria?: any;
    },
  ) {
    return this.segmentsService.update(id, req.tenantId, updateData);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.segmentsService.remove(id, req.tenantId);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Request() req) {
    return this.segmentsService.getMembers(id, req.tenantId);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Request() req,
    @Body() data: { contactId: string },
  ) {
    return this.segmentsService.addMember(id, req.tenantId, data.contactId);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id/members/:contactId')
  async removeMember(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @Request() req,
  ) {
    return this.segmentsService.removeMember(id, req.tenantId, contactId);
  }

  @Post(':id/calculate')
  async calculate(@Param('id') id: string, @Request() req) {
    return this.segmentsService.calculate(id, req.tenantId);
  }
}
