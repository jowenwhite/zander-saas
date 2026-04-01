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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TierGuard } from '../../common/guards/tier.guard';
import { RequireTier } from '../../common/decorators/require-tier.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Controller('cmo/workflows')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
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
    @Body() createData: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(id, req.tenantId, updateData);
  }

  // HIGH-4: Admin/Owner only - deletion is destructive
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
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
