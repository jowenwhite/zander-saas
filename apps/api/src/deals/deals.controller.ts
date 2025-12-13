import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { DealsService } from './deals.service';
import { Public } from '../auth/jwt-auth.decorator';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Public()
  @Get()
  async findAll() {
    const tenantId = 'cmj4gfco20000pqr0f92r3gif';
    return this.dealsService.findAll(tenantId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tenantId = 'cmj4gfco20000pqr0f92r3gif';
    return this.dealsService.findOne(tenantId, id);
  }

  @Public()
  @Post()
  async create(@Body() createDealDto: any) {
    const tenantId = 'cmj4gfco20000pqr0f92r3gif';
    return this.dealsService.create(tenantId, createDealDto);
  }

  @Public()
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDealDto: any) {
    const tenantId = 'cmj4gfco20000pqr0f92r3gif';
    return this.dealsService.update(tenantId, id, updateDealDto);
  }
}
