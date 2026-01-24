import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { PersonasService } from './personas.service';

@Controller('cmo/personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Get()
  async findAll(@Request() req) {
    return this.personasService.findAll(req.tenantId);
  }

  @Get('default')
  async getDefault(@Request() req) {
    return this.personasService.getDefault(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.personasService.findOne(id, req.tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body()
    createData: {
      name: string;
      avatar?: string;
      tagline?: string;
      demographics?: any;
      psychographics?: any;
      behaviors?: any;
      painPoints?: string[];
      goals?: string[];
      preferredChannels?: string[];
      brandAffinities?: string[];
      interview?: string;
      isDefault?: boolean;
    },
  ) {
    return this.personasService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updateData: {
      name?: string;
      avatar?: string;
      tagline?: string;
      demographics?: any;
      psychographics?: any;
      behaviors?: any;
      painPoints?: string[];
      goals?: string[];
      preferredChannels?: string[];
      brandAffinities?: string[];
      interview?: string;
      isDefault?: boolean;
    },
  ) {
    return this.personasService.update(id, req.tenantId, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.personasService.remove(id, req.tenantId);
  }
}
