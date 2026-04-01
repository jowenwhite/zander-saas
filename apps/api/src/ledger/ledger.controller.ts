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
import { TierGuard } from '../common/guards/tier.guard';
import { RequireTier } from '../common/decorators/require-tier.decorator';
import { LedgerService } from './ledger.service';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { UpdateLedgerEntryDto } from './dto/update-ledger-entry.dto';

@Controller('ledger')
@UseGuards(JwtAuthGuard, TierGuard)
@RequireTier('STARTER')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('category') category?: string,
    @Query('period') period?: string,
    @Query('status') status?: string,
  ) {
    return this.ledgerService.findAll(req.user.tenantId, {
      category,
      period,
      status,
    });
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.ledgerService.getStats(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.ledgerService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Request() req, @Body() data: CreateLedgerEntryDto) {
    return this.ledgerService.create(req.user.tenantId, data);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() data: UpdateLedgerEntryDto,
  ) {
    return this.ledgerService.update(id, req.user.tenantId, data);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.ledgerService.delete(id, req.user.tenantId);
  }
}
