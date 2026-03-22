import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { AssemblyType, AssemblyCadence } from '@prisma/client';

export class SectionDto {
  @IsString()
  executive: string;

  @IsString()
  title: string;

  @IsString()
  prompt: string;

  @IsNumber()
  order: number;
}

export class CreateAssemblyDto {
  @IsString()
  name: string;

  @IsEnum(AssemblyType)
  type: AssemblyType;

  @IsOptional()
  @IsEnum(AssemblyCadence)
  cadence?: AssemblyCadence;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsString()
  treasuryTemplateId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  customSections?: SectionDto[];
}

export class UpdateAssemblyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(AssemblyCadence)
  cadence?: AssemblyCadence;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string | null;

  @IsOptional()
  @IsString()
  status?: string;
}

export class RunSectionDto {
  @IsOptional()
  @IsString()
  prompt?: string;
}
