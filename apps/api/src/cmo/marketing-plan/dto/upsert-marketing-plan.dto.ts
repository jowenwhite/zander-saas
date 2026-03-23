// MEDIUM-1: Input validation for marketing plan upsert
import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class UpsertMarketingPlanDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  mission?: string;

  @IsString()
  @IsOptional()
  vision?: string;

  @IsString()
  @IsOptional()
  strategy?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goals?: string[];

  @IsObject()
  @IsOptional()
  swot?: any;  // Complex nested object, validated at runtime

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  monthlyThemes?: string[];

  @IsArray()
  @IsOptional()
  kpis?: any[];  // Array of objects, validated at runtime

  @IsString()
  @IsOptional()
  budget?: string;

  @IsString()
  @IsOptional()
  timeline?: string;
}
