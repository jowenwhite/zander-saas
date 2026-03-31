import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';

export class CreateKeystoneDto {
  @IsString()
  @IsNotEmpty({ message: 'Executive is required' })
  @IsIn(['CRO', 'CFO', 'COO', 'CMO', 'CPO', 'CIO', 'EA'])
  executive: string;

  @IsString()
  @IsNotEmpty({ message: 'Label is required' })
  label: string;

  @IsString()
  @IsNotEmpty({ message: 'Value is required' })
  value: string;

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
