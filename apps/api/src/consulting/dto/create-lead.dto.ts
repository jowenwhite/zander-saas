import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsEmail } from 'class-validator';
import { LeadSource, LeadStatus } from '@prisma/client';

export class CreateLeadDto {
  @IsEnum(LeadSource)
  source: LeadSource;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  interestedPackage?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  calendlyEventUri?: string;

  @IsDateString()
  @IsOptional()
  meetingScheduledAt?: string;

  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateLeadDto {
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsString()
  @IsOptional()
  interestedPackage?: string;

  @IsString()
  @IsOptional()
  calendlyEventUri?: string;

  @IsDateString()
  @IsOptional()
  meetingScheduledAt?: string;

  @IsDateString()
  @IsOptional()
  meetingCompletedAt?: string;

  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @IsString()
  @IsOptional()
  lostReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ConvertLeadDto {
  @IsString()
  @IsOptional()
  tenantId?: string; // Existing tenant, or create new

  @IsString()
  packageType: string;

  @IsNumber()
  totalHours: number;

  @IsString()
  @IsOptional()
  companyName?: string; // For new tenant creation
}
