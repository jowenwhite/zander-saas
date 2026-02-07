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
import { FunnelsService } from './funnels.service';

@Controller('cmo/funnels')
export class FunnelsController {
  constructor(private readonly funnelsService: FunnelsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.funnelsService.findAll(req.tenantId);
  }

  @Get('overview')
  async getOverview(@Request() req) {
    return this.funnelsService.getOverview(req.tenantId);
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

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.funnelsService.remove(id, req.tenantId);
  }
}
