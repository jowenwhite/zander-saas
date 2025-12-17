import { Controller, Get, Post, Patch, Delete, Body, Param, Request } from '@nestjs/common';
import { PipelineStagesService } from './pipeline-stages.service';

@Controller('pipeline-stages')
export class PipelineStagesController {
  constructor(private readonly pipelineStagesService: PipelineStagesService) {}

  @Get()
  async findAll(@Request() req) {
    return this.pipelineStagesService.findAll(req.tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body() createData: {
      name: string;
      order: number;
      probability?: number;
      color?: string;
    }
  ) {
    return this.pipelineStagesService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: {
      name?: string;
      order?: number;
      probability?: number;
      color?: string;
    }
  ) {
    return this.pipelineStagesService.update(id, req.tenantId, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.pipelineStagesService.remove(id, req.tenantId);
  }

  @Post('reorder')
  async reorder(@Request() req, @Body() body: { stageIds: string[] }) {
    return this.pipelineStagesService.reorder(req.tenantId, body.stageIds);
  }

  @Post('seed')
  async seedDefaults(@Request() req) {
    return this.pipelineStagesService.seedDefaults(req.tenantId);
  }
}
