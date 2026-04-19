// MEDIUM-1: Input validation for funnel update
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FunnelStageDto } from './funnel-stage.dto';

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
  @ValidateNested({ each: true })
  @Type(() => FunnelStageDto)
  @IsOptional()
  stages?: FunnelStageDto[];
}
