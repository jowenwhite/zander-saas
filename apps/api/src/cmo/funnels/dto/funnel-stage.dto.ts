import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
} from 'class-validator';

export class FunnelStageDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  stageType: string;

  @IsNumber()
  stageOrder: number;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
