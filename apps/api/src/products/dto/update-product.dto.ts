// MEDIUM-1: Input validation for product updates
import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ProductType, ProductStatus, PricingModel } from './create-product.dto';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(ProductType, { message: 'Type must be PRODUCT, SERVICE, or SUBSCRIPTION' })
  @IsOptional()
  type?: ProductType;

  @IsEnum(ProductStatus, { message: 'Status must be ACTIVE, INACTIVE, or DISCONTINUED' })
  @IsOptional()
  status?: ProductStatus;

  @IsEnum(PricingModel, { message: 'Pricing model must be SIMPLE, TIERED, VOLUME, or CUSTOM' })
  @IsOptional()
  pricingModel?: PricingModel;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Base price must be positive' })
  basePrice?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Cost of goods must be positive' })
  costOfGoods?: number;

  @IsString()
  @IsOptional()
  costUnit?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  targetMargin?: number;
}
