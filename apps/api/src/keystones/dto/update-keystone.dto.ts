import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';

export class UpdateKeystoneDto {
  @IsString()
  @IsOptional()
  @IsIn(['CRO', 'CFO', 'COO', 'CMO', 'CPO', 'CIO', 'EA'])
  executive?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsNumber()
  @IsOptional()
  numericValue?: number;

  @IsString()
  @IsOptional()
  target?: string;

  @IsNumber()
  @IsOptional()
  numericTarget?: number;

  @IsString()
  @IsOptional()
  @IsIn(['UP', 'DOWN', 'FLAT'])
  trend?: string;

  @IsString()
  @IsOptional()
  trendValue?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
