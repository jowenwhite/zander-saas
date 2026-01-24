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
import { FunnelsService } from './funnels.service';

@Controller('cmo/funnels')
export class FunnelsController {
  constructor(private readonly funnelsService: FunnelsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.funnelsService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.funnelsService.findOne(id, req.tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body()
    createData: {
      name: string;
      description?: string;
      conversionGoal?: string;
      stages?: {
        name: string;
        stageType: string;
        stageOrder: number;
        config?: any;
      }[];
    },
  ) {
    return this.funnelsService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updateData: {
      name?: string;
      description?: string;
      status?: string;
      conversionGoal?: string;
      stages?: {
        id?: string;
        name: string;
        stageType: string;
        stageOrder: number;
        config?: any;
      }[];
    },
  ) {
    return this.funnelsService.update(id, req.tenantId, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.funnelsService.remove(id, req.tenantId);
  }
}
