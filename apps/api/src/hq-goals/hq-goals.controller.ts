import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HQGoalsService } from './hq-goals.service';
import { CreateHQGoalDto } from './dto/create-hq-goal.dto';
import { UpdateHQGoalDto } from './dto/update-hq-goal.dto';

@Controller('hq-goals')
@UseGuards(JwtAuthGuard)
export class HQGoalsController {
  constructor(private readonly hqGoalsService: HQGoalsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('scope') scope?: string,
    @Query('status') status?: string,
    @Query('quarter') quarter?: string,
    @Query('year') year?: string,
    @Query('priority') priority?: string,
  ) {
    return this.hqGoalsService.findAll(req.user.tenantId, {
      scope,
      status,
      quarter,
      year: year ? parseInt(year, 10) : undefined,
      priority,
    });
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.hqGoalsService.getStats(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.hqGoalsService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Request() req, @Body() data: CreateHQGoalDto) {
    return this.hqGoalsService.create(req.user.tenantId, data);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() data: UpdateHQGoalDto,
  ) {
    return this.hqGoalsService.update(id, req.user.tenantId, data);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.hqGoalsService.delete(id, req.user.tenantId);
  }
}
