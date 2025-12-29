import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.campaignsService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.campaignsService.findOne(id, req.tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body() createData: {
      name: string;
      description?: string;
      type?: string;
      channels?: string[];
      status?: string;
      triggerType?: string;
      triggerConfig?: any;
      isFromTreasury?: boolean;
      steps?: {
        order: number;
        channel: string;
        dayOffset: number;
        hourOffset?: number;
        subject?: string;
        content: string;
      }[];
    }
  ) {
    return this.campaignsService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: {
      name?: string;
      description?: string;
      type?: string;
      channels?: string[];
      status?: string;
      triggerType?: string;
      triggerConfig?: any;
      steps?: {
        id?: string;
        order: number;
        channel: string;
        dayOffset: number;
        hourOffset?: number;
        subject?: string;
        content: string;
      }[];
    }
  ) {
    return this.campaignsService.update(id, req.tenantId, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.campaignsService.remove(id, req.tenantId);
  }

  @Post(':id/enroll')
  async enroll(
    @Param('id') id: string,
    @Request() req,
    @Body() data: { contactId: string; dealId?: string }
  ) {
    return this.campaignsService.enroll(id, req.tenantId, data.contactId, data.dealId);
  }

  @Get(':id/enrollments')
  async getEnrollments(@Param('id') id: string, @Request() req) {
    return this.campaignsService.getEnrollments(id, req.tenantId);
  }
}
