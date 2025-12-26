import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Request() req) {
    const products = await this.productsService.findAll(req.user.tenantId);
    return { data: products };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const product = await this.productsService.findOne(id, req.user.tenantId);
    return { data: product };
  }

  @Post()
  async create(@Body() data: any, @Request() req) {
    const product = await this.productsService.create(req.user.tenantId, data);
    return { data: product };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Request() req) {
    const product = await this.productsService.update(id, req.user.tenantId, data);
    return { data: product };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.productsService.delete(id, req.user.tenantId);
    return { success: true };
  }
}
