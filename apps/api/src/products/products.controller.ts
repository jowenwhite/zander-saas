import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { ProductsService, ProductImportRow } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

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

  // ==================== IMPORT ENDPOINTS ====================

  @Post('import/validate')
  async validateImport(
    @Body() body: { rows: ProductImportRow[] },
    @Request() req,
  ) {
    this.logger.log(`Validating import of ${body.rows?.length || 0} products`);
    const results = await this.productsService.validateImportData(
      req.user.tenantId,
      body.rows || [],
    );

    const summary = {
      total: results.length,
      valid: results.filter(r => r.errors.length === 0).length,
      invalid: results.filter(r => r.errors.length > 0).length,
      duplicates: results.filter(r => r.isDuplicate).length,
      hasWarnings: results.filter(r => r.warnings.length > 0).length,
    };

    return { data: results, summary };
  }

  @Post('import')
  async importProducts(
    @Body() body: { rows: ProductImportRow[]; duplicateAction?: 'skip' | 'update' },
    @Request() req,
  ) {
    this.logger.log(
      `Importing ${body.rows?.length || 0} products with duplicateAction=${body.duplicateAction || 'skip'}`,
    );

    const result = await this.productsService.importProducts(
      req.user.tenantId,
      body.rows || [],
      { duplicateAction: body.duplicateAction || 'skip' },
    );

    return { data: result };
  }
}
