// MEDIUM-1: Input validation for monthly theme creation
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export class CreateThemeDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Year is required' })
  year: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  @IsNotEmpty({ message: 'Month is required' })
  month: number;

  @IsString()
  @IsNotEmpty({ message: 'Theme name is required' })
  name: string;

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
}
