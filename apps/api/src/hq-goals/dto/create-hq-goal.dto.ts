import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class CreateHQGoalDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['PERSONAL', 'QUARTERLY', 'ANNUAL'], { message: 'Scope must be PERSONAL, QUARTERLY, or ANNUAL' })
  scope: string;

  @IsString()
  @IsOptional()
  @IsIn(['P1', 'P2', 'P3'])
  priority?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsNumber()
  @IsOptional()
  targetValue?: number;

  @IsNumber()
  @IsOptional()
  currentValue?: number;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Q1', 'Q2', 'Q3', 'Q4'])
  quarter?: string;

  @IsNumber()
  @IsOptional()
  year?: number;
}
