import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { FormsService } from './forms.service';
import { Public } from '../auth/public.decorator';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.formsService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.formsService.findOne(id, req.tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body() createData: {
      name: string;
      description?: string;
      fields?: any[];
      settings?: any;
    }
  ) {
    return this.formsService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: {
      name?: string;
      description?: string;
      fields?: any[];
      settings?: any;
      status?: string;
    }
  ) {
    return this.formsService.update(id, req.tenantId, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.formsService.remove(id, req.tenantId);
  }

  @Get(':id/submissions')
  async getSubmissions(@Param('id') id: string, @Request() req) {
    return this.formsService.getSubmissions(id, req.tenantId);
  }

  // Public endpoint for form submissions (no auth required)
  @Public()
  @Post(':id/submit')
  async submitForm(@Param('id') id: string, @Body() data: any) {
    return this.formsService.createSubmission(id, data);
  }
}
