import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';

@Controller('cmo/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // List all templates
  @Get()
  async findAll(
    @Request() req,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.templatesService.findAll(req.tenantId, { category, status });
  }

  // Get pre-built starter templates
  @Get('prebuilt')
  async getPrebuilt() {
    return this.templatesService.getPrebuiltTemplates();
  }

  // Get single template
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.templatesService.findOne(id, req.tenantId);
  }

  // Export template as HTML
  @Get(':id/html')
  async exportHtml(@Param('id') id: string, @Request() req) {
    return this.templatesService.exportHtml(id, req.tenantId);
  }

  // Create template
  @Post()
  async create(
    @Request() req,
    @Body()
    createData: {
      name: string;
      subject?: string;
      body?: any;
      category?: string;
      status?: string;
    },
  ) {
    return this.templatesService.create(req.tenantId, createData);
  }

  // Create from prebuilt template
  @Post('from-prebuilt/:prebuiltId')
  async createFromPrebuilt(
    @Param('prebuiltId') prebuiltId: string,
    @Request() req,
    @Body() data: { name?: string },
  ) {
    return this.templatesService.createFromPrebuilt(req.tenantId, prebuiltId, data.name);
  }

  // Update template
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updateData: {
      name?: string;
      subject?: string;
      body?: any;
      category?: string;
      status?: string;
    },
  ) {
    return this.templatesService.update(id, req.tenantId, updateData);
  }

  // Delete template
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.templatesService.remove(id, req.tenantId);
  }

  // Duplicate template
  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string, @Request() req) {
    return this.templatesService.duplicate(id, req.tenantId);
  }

  // Send test email
  @Post(':id/preview')
  async sendTestEmail(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { email: string },
  ) {
    return this.templatesService.sendTestEmail(id, req.tenantId, body.email);
  }
}
