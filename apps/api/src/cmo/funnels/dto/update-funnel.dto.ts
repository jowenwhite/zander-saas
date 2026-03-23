// MEDIUM-1: Input validation for funnel update
import {
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class UpdateFunnelDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  conversionGoal?: string;

  @IsArray()
  @IsOptional()
  stages?: any[];  // Complex nested objects, validated at runtime
}
