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
import { FunnelsService } from './funnels.service';
import { CreateFunnelDto } from './dto/create-funnel.dto';
import { UpdateFunnelDto } from './dto/update-funnel.dto';

@Controller('cmo/funnels')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('BUSINESS')
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
    @Body() createData: CreateFunnelDto,
  ) {
    return this.funnelsService.create(req.tenantId, createData);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateData: UpdateFunnelDto,
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
