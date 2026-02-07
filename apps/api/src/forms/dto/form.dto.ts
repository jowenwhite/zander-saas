// MEDIUM-1: Input validation for forms
import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';

export enum FormStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export class CreateFormDto {
  @IsString()
  @IsNotEmpty({ message: 'Form name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  fields?: any[]; // Dynamic form fields structure

  @IsObject()
  @IsOptional()
  settings?: any; // Form settings (notifications, redirects, etc.)
}

export class UpdateFormDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  fields?: any[];

  @IsObject()
  @IsOptional()
  settings?: any;

  @IsEnum(FormStatus, { message: 'Status must be draft, active, or inactive' })
  @IsOptional()
  status?: FormStatus;
}

export class EventSubmissionDto {
  @IsString()
  @IsNotEmpty({ message: 'Calendar event ID is required' })
  calendarEventId: string;

  @IsString()
  @IsOptional()
  contactId?: string;
}

export class SubmissionDataDto {
  @IsObject()
  data: any; // Dynamic form submission data
}
