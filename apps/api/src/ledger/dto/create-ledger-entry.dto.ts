import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class CreateLedgerEntryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @IsIn(['COMPANY', 'TEAM', 'PERSONAL'])
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsOptional()
  keystone?: string;

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsString()
  @IsOptional()
  @IsIn(['UP', 'DOWN', 'FLAT'])
  trend?: string;

  @IsString()
  @IsOptional()
  owner?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ON_TRACK', 'AT_RISK', 'BEHIND', 'EXCEEDED'])
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'])
  period?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
