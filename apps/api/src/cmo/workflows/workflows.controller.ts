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
import { WorkflowsService } from './workflows.service';

@Controller('cmo/workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.workflowsService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.workflowsService.findOne(id, req.tenantId);
  }

  @Post()
  async create(
    @Request() req,
    @Body()
    createData: {
      name: string;
      description?: string;
      triggerType: string;
      triggerConfig?: any;
      nodes?: {
        nodeType: string;
        name: string;
        config?: any;
        positionX?: number;
        positionY?: number;
        sortOrder?: number;
      }[];
    },
  ) {
    return this.workflowsService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body()
    updateData: {
      name?: string;
      description?: string;
      triggerType?: string;
      triggerConfig?: any;
      nodes?: {
        id?: string;
        nodeType: string;
        name: string;
        config?: any;
        positionX?: number;
        positionY?: number;
        nextNodeId?: string;
        trueBranchId?: string;
        falseBranchId?: string;
        sortOrder?: number;
      }[];
    },
  ) {
    return this.workflowsService.update(id, req.tenantId, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.workflowsService.remove(id, req.tenantId);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string, @Request() req) {
    return this.workflowsService.activate(id, req.tenantId);
  }

  @Post(':id/pause')
  async pause(@Param('id') id: string, @Request() req) {
    return this.workflowsService.pause(id, req.tenantId);
  }

  @Get(':id/executions')
  async getExecutions(@Param('id') id: string, @Request() req) {
    return this.workflowsService.getExecutions(id, req.tenantId);
  }
}
