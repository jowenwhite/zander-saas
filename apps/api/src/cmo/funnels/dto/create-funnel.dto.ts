// MEDIUM-1: Input validation for funnel creation
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FunnelStageDto } from './funnel-stage.dto';

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
  @ValidateNested({ each: true })
  @Type(() => FunnelStageDto)
  @IsOptional()
  stages?: FunnelStageDto[];
}
