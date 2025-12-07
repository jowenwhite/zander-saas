import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { DealsService } from './deals.service';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  async findAll() {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.dealsService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.dealsService.findOne(tenantId, id);
  }

  @Post()
  async create(@Body() createDealDto: any) {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.dealsService.create(tenantId, createDealDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDealDto: any) {
    const tenantId = 'cmivq0r7s0000goa1v5fap9ga';
    return this.dealsService.update(tenantId, id, updateDealDto);
  }
}
