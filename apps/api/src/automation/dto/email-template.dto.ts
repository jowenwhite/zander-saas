// MEDIUM-1: Input validation for email templates
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  CALL = 'call'
}

export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active'
}

export class CreateEmailTemplateDto {
  @IsString()
  @IsNotEmpty({ message: 'Template name is required' })
  name: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsEnum(TemplateType, { message: 'Type must be email, sms, or call' })
  @IsOptional()
  type?: TemplateType;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsEnum(TemplateStatus, { message: 'Status must be draft or active' })
  @IsOptional()
  status?: TemplateStatus;

  @IsArray()
  @IsOptional()
  variables?: string[];
}

export class UpdateEmailTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsEnum(TemplateType, { message: 'Type must be email, sms, or call' })
  @IsOptional()
  type?: TemplateType;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsEnum(TemplateStatus, { message: 'Status must be draft or active' })
  @IsOptional()
  status?: TemplateStatus;

  @IsArray()
  @IsOptional()
  variables?: string[];
}

export class SendTemplateDto {
  @IsString()
  @IsNotEmpty({ message: 'Contact ID is required' })
  contactId: string;

  @IsString()
  @IsOptional()
  dealId?: string;
}
