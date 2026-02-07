// MEDIUM-1: Input validation for activity updates
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ActivityType } from './create-activity.dto';

export class UpdateActivityDto {
  @IsEnum(ActivityType, { message: 'Type must be email, call, meeting, note, or task' })
  @IsOptional()
  type?: ActivityType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsString()
  @IsOptional()
  dealId?: string;
}
