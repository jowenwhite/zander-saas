// MEDIUM-1: Input validation for persona creation
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @IsNotEmpty({ message: 'Persona name is required' })
  name: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsObject()
  @IsOptional()
  demographics?: Record<string, any>;

  @IsObject()
  @IsOptional()
  psychographics?: Record<string, any>;

  @IsObject()
  @IsOptional()
  behaviors?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  painPoints?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goals?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredChannels?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  brandAffinities?: string[];

  @IsString()
  @IsOptional()
  interview?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
