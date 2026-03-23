// MEDIUM-1: Input validation for template update
import {
  IsString,
  IsOptional,
  IsObject,
} from 'class-validator';

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsObject()
  @IsOptional()
  body?: Record<string, any>;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
