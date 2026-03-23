// MEDIUM-1: Input validation for task update
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { TaskPriority, TaskStatus } from './create-task.dto';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(TaskPriority, { message: 'Priority must be high, medium, or low' })
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus, { message: 'Status must be open, in-progress, completed, or cancelled' })
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  assignedToUserId?: string;

  @IsString()
  @IsOptional()
  linkedDealId?: string;

  @IsString()
  @IsOptional()
  linkedContactId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
