import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LegacyService } from './legacy.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { ReorderMilestonesDto } from './dto/reorder-milestones.dto';

@Controller('legacy')
@UseGuards(JwtAuthGuard)
export class LegacyController {
  constructor(private readonly legacyService: LegacyService) {}

  /**
   * GET /legacy - List all milestones
   */
  @Get()
  async findAll(@Request() req: any) {
    return this.legacyService.findAll(req.user.tenantId);
  }

  /**
   * POST /legacy - Create milestone
   */
  @Post()
  async create(@Request() req: any, @Body() data: CreateMilestoneDto) {
    return this.legacyService.create(req.user.tenantId, data);
  }

  /**
   * PUT /legacy/reorder - Bulk reorder (must come before :id route)
   */
  @Put('reorder')
  async reorder(@Request() req: any, @Body() data: ReorderMilestonesDto) {
    return this.legacyService.reorder(req.user.tenantId, data);
  }

  /**
   * GET /legacy/:id - Get single milestone
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.legacyService.findOne(id, req.user.tenantId);
  }

  /**
   * PUT /legacy/:id - Update milestone
   */
  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateMilestoneDto,
  ) {
    return this.legacyService.update(id, req.user.tenantId, data);
  }

  /**
   * DELETE /legacy/:id - Delete milestone
   */
  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.legacyService.delete(id, req.user.tenantId);
  }

  /**
   * POST /legacy/:id/recalculate - Recalculate progress from goals
   */
  @Post(':id/recalculate')
  async recalculateProgress(@Request() req: any, @Param('id') id: string) {
    return this.legacyService.recalculateProgress(id, req.user.tenantId);
  }
}
