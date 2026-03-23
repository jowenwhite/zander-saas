// MEDIUM-1: Input validation for idea parking lot creation
import {
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @IsNotEmpty({ message: 'Idea title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  priority?: string;
}
