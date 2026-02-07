// MEDIUM-1: Input validation for activity creation
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum ActivityType {
  EMAIL = 'email',
  CALL = 'call',
  MEETING = 'meeting',
  NOTE = 'note',
  TASK = 'task'
}

export class CreateActivityDto {
  @IsEnum(ActivityType, { message: 'Type must be email, call, meeting, note, or task' })
  @IsNotEmpty({ message: 'Activity type is required' })
  type: ActivityType;

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
