// MEDIUM-1: Input validation for monthly theme update
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class UpdateThemeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  focusAreas?: string[];

  @IsString()
  @IsOptional()
  colorCode?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
