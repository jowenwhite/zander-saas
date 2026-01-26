import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface ProductImportRow {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  type?: string;
  status?: string;
  basePrice?: string | number;
  unit?: string;
  costOfGoods?: string | number;
  pricingModel?: string;
}

export interface ImportValidationResult {
  row: number;
  data: ProductImportRow;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  existingProductId?: string;
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  details: Array<{
    row: number;
    name: string;
    status: 'imported' | 'updated' | 'skipped' | 'error';
    message?: string;
  }>;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        lineItems: {
          include: {
            project: true,
          },
        },
      },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.product.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!product) {
      throw new Error('Product not found');
    }
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!product) {
      throw new Error('Product not found');
    }
    // Soft delete by setting status to DISCONTINUED
    return this.prisma.product.update({
      where: { id },
      data: { status: 'DISCONTINUED' },
    });
  }

  // ==================== IMPORT METHODS ====================

  async validateImportData(
    tenantId: string,
    rows: ProductImportRow[],
  ): Promise<ImportValidationResult[]> {
    const results: ImportValidationResult[] = [];
    const validTypes = ['PHYSICAL', 'SERVICE', 'SUBSCRIPTION', 'DIGITAL', 'ACCESS', 'BUNDLE'];
    const validStatuses = ['ACTIVE', 'DRAFT', 'DISCONTINUED'];
    const validPricingModels = ['SIMPLE', 'TIERED', 'TIME_MATERIALS', 'SUBSCRIPTION'];

    // Get existing products by SKU for duplicate detection
    const existingProducts = await this.prisma.product.findMany({
      where: { tenantId },
      select: { id: true, sku: true, name: true },
    });
    const skuMap = new Map<string, { id: string; name: string }>();
    for (const p of existingProducts) {
      if (p.sku) {
        skuMap.set(p.sku.toLowerCase(), { id: p.id, name: p.name });
      }
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];
      const warnings: string[] = [];
      let isDuplicate = false;
      let existingProductId: string | undefined;

      // Required field validation
      if (!row.name || row.name.trim() === '') {
        errors.push('Name is required');
      }

      // Type validation
      if (row.type) {
        const upperType = row.type.toUpperCase();
        if (!validTypes.includes(upperType)) {
          errors.push(`Invalid type "${row.type}". Valid options: ${validTypes.join(', ')}`);
        }
      }

      // Status validation
      if (row.status) {
        const upperStatus = row.status.toUpperCase();
        if (!validStatuses.includes(upperStatus)) {
          errors.push(`Invalid status "${row.status}". Valid options: ${validStatuses.join(', ')}`);
        }
      }

      // Pricing model validation
      if (row.pricingModel) {
        const upperPricing = row.pricingModel.toUpperCase();
        if (!validPricingModels.includes(upperPricing)) {
          warnings.push(`Invalid pricing model "${row.pricingModel}". Using default SIMPLE.`);
        }
      }

      // Price validation
      if (row.basePrice !== undefined && row.basePrice !== '') {
        const price = parseFloat(String(row.basePrice));
        if (isNaN(price)) {
          errors.push(`Invalid basePrice "${row.basePrice}". Must be a number.`);
        } else if (price < 0) {
          errors.push('basePrice cannot be negative');
        }
      }

      // Cost validation
      if (row.costOfGoods !== undefined && row.costOfGoods !== '') {
        const cost = parseFloat(String(row.costOfGoods));
        if (isNaN(cost)) {
          warnings.push(`Invalid costOfGoods "${row.costOfGoods}". Will be skipped.`);
        }
      }

      // Duplicate detection by SKU
      if (row.sku && row.sku.trim() !== '') {
        const existing = skuMap.get(row.sku.toLowerCase().trim());
        if (existing) {
          isDuplicate = true;
          existingProductId = existing.id;
          warnings.push(`SKU "${row.sku}" already exists (Product: ${existing.name})`);
        }
      }

      results.push({
        row: i + 1, // 1-indexed for display
        data: row,
        errors,
        warnings,
        isDuplicate,
        existingProductId,
      });
    }

    return results;
  }

  async importProducts(
    tenantId: string,
    rows: ProductImportRow[],
    options: { duplicateAction: 'skip' | 'update' } = { duplicateAction: 'skip' },
  ): Promise<ImportResult> {
    const validationResults = await this.validateImportData(tenantId, rows);
    const result: ImportResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: [],
    };

    for (const validation of validationResults) {
      const { row, data, errors, isDuplicate, existingProductId } = validation;

      // Skip rows with validation errors
      if (errors.length > 0) {
        result.errors++;
        result.details.push({
          row,
          name: data.name || '(unknown)',
          status: 'error',
          message: errors.join('; '),
        });
        continue;
      }

      // Handle duplicates
      if (isDuplicate && existingProductId) {
        if (options.duplicateAction === 'skip') {
          result.skipped++;
          result.details.push({
            row,
            name: data.name,
            status: 'skipped',
            message: `SKU "${data.sku}" already exists`,
          });
          continue;
        } else {
          // Update existing product
          try {
            await this.prisma.product.update({
              where: { id: existingProductId },
              data: this.mapRowToProductData(data),
            });
            result.updated++;
            result.details.push({
              row,
              name: data.name,
              status: 'updated',
            });
          } catch (error) {
            result.errors++;
            result.details.push({
              row,
              name: data.name,
              status: 'error',
              message: `Failed to update: ${error.message}`,
            });
          }
          continue;
        }
      }

      // Create new product
      try {
        await this.prisma.product.create({
          data: {
            tenantId,
            ...this.mapRowToProductData(data),
          },
        });
        result.imported++;
        result.details.push({
          row,
          name: data.name,
          status: 'imported',
        });
      } catch (error) {
        result.errors++;
        result.details.push({
          row,
          name: data.name,
          status: 'error',
          message: `Failed to create: ${error.message}`,
        });
      }
    }

    this.logger.log(
      `Import completed: ${result.imported} imported, ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`,
    );

    return result;
  }

  private mapRowToProductData(row: ProductImportRow): any {
    const data: any = {
      name: row.name.trim(),
    };

    if (row.description !== undefined && row.description !== '') {
      data.description = row.description.trim();
    }

    if (row.sku !== undefined && row.sku !== '') {
      data.sku = row.sku.trim();
    }

    if (row.category !== undefined && row.category !== '') {
      data.category = row.category.trim();
    }

    if (row.type) {
      const upperType = row.type.toUpperCase();
      const validTypes = ['PHYSICAL', 'SERVICE', 'SUBSCRIPTION', 'DIGITAL', 'ACCESS', 'BUNDLE'];
      if (validTypes.includes(upperType)) {
        data.type = upperType;
      }
    }

    if (row.status) {
      const upperStatus = row.status.toUpperCase();
      const validStatuses = ['ACTIVE', 'DRAFT', 'DISCONTINUED'];
      if (validStatuses.includes(upperStatus)) {
        data.status = upperStatus;
      }
    }

    if (row.basePrice !== undefined && row.basePrice !== '') {
      const price = parseFloat(String(row.basePrice));
      if (!isNaN(price)) {
        data.basePrice = price;
      }
    }

    if (row.unit !== undefined && row.unit !== '') {
      data.unit = row.unit.trim();
    }

    if (row.costOfGoods !== undefined && row.costOfGoods !== '') {
      const cost = parseFloat(String(row.costOfGoods));
      if (!isNaN(cost)) {
        data.costOfGoods = cost;
      }
    }

    if (row.pricingModel) {
      const upperPricing = row.pricingModel.toUpperCase();
      const validPricingModels = ['SIMPLE', 'TIERED', 'TIME_MATERIALS', 'SUBSCRIPTION'];
      if (validPricingModels.includes(upperPricing)) {
        data.pricingModel = upperPricing;
      }
    }

    return data;
  }

  async findBySku(tenantId: string, sku: string) {
    return this.prisma.product.findFirst({
      where: { tenantId, sku },
    });
  }
}
