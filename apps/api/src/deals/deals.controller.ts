import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { DealsService } from './deals.service';
import { Public } from '../auth/jwt-auth.decorator';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Public()
  @Get()
  async findAll() {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.dealsService.findAll(tenantId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.dealsService.findOne(tenantId, id);
  }

  @Public()
  @Post()
  async create(@Body() createDealDto: any) {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.dealsService.create(tenantId, createDealDto);
  }

  @Public()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDealDto: any) {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.dealsService.update(tenantId, id, updateDealDto);
  }
}
