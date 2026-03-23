// MEDIUM-1: Input validation for funnel creation
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateFunnelDto {
  @IsString()
  @IsNotEmpty({ message: 'Funnel name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  conversionGoal?: string;

  @IsArray()
  @IsOptional()
  stages?: any[];  // Complex nested objects, validated at runtime
}
