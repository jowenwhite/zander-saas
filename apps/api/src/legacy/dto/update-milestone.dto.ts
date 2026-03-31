import { IsString, IsInt, IsArray, IsOptional, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GoalDto {
  @IsString()
  text: string;

  @IsOptional()
  completed?: boolean;
}

export class UpdateMilestoneDto {
  @IsInt()
  @Min(2024)
  @Max(2100)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoalDto)
  @IsOptional()
  goals?: GoalDto[];

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
