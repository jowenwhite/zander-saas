// MEDIUM-1: Input validation for template creation
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty({ message: 'Template name is required' })
  name: string;

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
