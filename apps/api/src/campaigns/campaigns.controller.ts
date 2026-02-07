import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto, EnrollContactDto } from './dto';

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

  // MEDIUM-1: Input validation via CreateCampaignDto
  @Post()
  async create(@Request() req, @Body() createData: CreateCampaignDto) {
    return this.campaignsService.create(req.tenantId, createData);
  }

  // MEDIUM-1: Input validation via UpdateCampaignDto
  @Patch(':id')
  async update(@Param('id') id: string, @Request() req, @Body() updateData: UpdateCampaignDto) {
    return this.campaignsService.update(id, req.tenantId, updateData);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.campaignsService.remove(id, req.tenantId);
  }

  // MEDIUM-1: Input validation via EnrollContactDto
  @Post(':id/enroll')
  async enroll(@Param('id') id: string, @Request() req, @Body() data: EnrollContactDto) {
    return this.campaignsService.enroll(id, req.tenantId, data.contactId, data.dealId);
  }

  @Get(':id/enrollments')
  async getEnrollments(@Param('id') id: string, @Request() req) {
    return this.campaignsService.getEnrollments(id, req.tenantId);
  }
}
