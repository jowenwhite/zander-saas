// MEDIUM-1: Input validation for product creation
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED'
}

export enum PricingModel {
  SIMPLE = 'SIMPLE',
  TIERED = 'TIERED',
  VOLUME = 'VOLUME',
  CUSTOM = 'CUSTOM'
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

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
