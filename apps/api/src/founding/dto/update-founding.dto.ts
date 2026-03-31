import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ValueDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class UpdateFoundingDto {
  @IsString()
  @IsOptional()
  vision?: string;

  @IsString()
  @IsOptional()
  mission?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueDto)
  @IsOptional()
  values?: ValueDto[];

  @IsString()
  @IsOptional()
  story?: string;
}

export class UpdateFieldDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueDto)
  @IsOptional()
  values?: ValueDto[];
}
