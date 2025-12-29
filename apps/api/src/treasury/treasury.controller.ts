import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { Public } from '../auth/public.decorator';

@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
    @Query('channels') channels?: string,
  ) {
    const channelsArray = channels ? channels.split(',') : undefined;
    return this.treasuryService.findAll({
      type,
      category,
      executive,
      industry,
      channels: channelsArray,
    });
  }

  @Get('campaigns')
  async getCampaigns(
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
    @Query('channels') channels?: string,
  ) {
    const channelsArray = channels ? channels.split(',') : undefined;
    return this.treasuryService.findAll({
      type: 'campaign',
      category,
      executive,
      industry,
      channels: channelsArray,
    });
  }

  @Get('forms')
  async getForms(
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
  ) {
    return this.treasuryService.findAll({
      type: 'form',
      category,
      executive,
      industry,
    });
  }

  @Get('sops')
  async getSops(
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
  ) {
    return this.treasuryService.findAll({
      type: 'sop',
      category,
      executive,
      industry,
    });
  }

  @Get('assemblies')
  async getAssemblies(
    @Query('category') category?: string,
    @Query('executive') executive?: string,
    @Query('industry') industry?: string,
  ) {
    return this.treasuryService.findAll({
      type: 'assembly',
      category,
      executive,
      industry,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.treasuryService.findOne(id);
  }

  @Post()
  async create(
    @Body() data: {
      type: string;
      name: string;
      description?: string;
      category?: string;
      executive?: string;
      industry?: string;
      channels?: string[];
      content: any;
      stepCount?: number;
      duration?: string;
    }
  ) {
    return this.treasuryService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      description?: string;
      category?: string;
      executive?: string;
      industry?: string;
      channels?: string[];
      content?: any;
      stepCount?: number;
      duration?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    return this.treasuryService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.treasuryService.remove(id);
  }
}
