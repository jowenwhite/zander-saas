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
import { TierGuard } from '../common/guards/tier.guard';
import { RequireTier } from '../common/decorators/require-tier.decorator';
import { KeystonesService } from './keystones.service';
import { CreateKeystoneDto } from './dto/create-keystone.dto';
import { UpdateKeystoneDto } from './dto/update-keystone.dto';
import { ReorderKeystonesDto } from './dto/reorder-keystones.dto';

@Controller('keystones')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('STARTER')
export class KeystonesController {
  constructor(private readonly keystonesService: KeystonesService) {}

  @Get()
  async findAll(@Request() req) {
    return this.keystonesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.keystonesService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Request() req, @Body() data: CreateKeystoneDto) {
    return this.keystonesService.create(req.user.tenantId, data);
  }

  @Put('reorder')
  async reorder(@Request() req, @Body() data: ReorderKeystonesDto) {
    return this.keystonesService.reorder(req.user.tenantId, data);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() data: UpdateKeystoneDto,
  ) {
    return this.keystonesService.update(id, req.user.tenantId, data);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.keystonesService.delete(id, req.user.tenantId);
  }
}
