// MEDIUM-1: Input validation for scheduled communications
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  CALL = 'call'
}

export enum CommunicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SENT = 'sent',
  CANCELLED = 'cancelled'
}

export class CreateScheduledCommunicationDto {
  @IsString()
  @IsNotEmpty({ message: 'Contact ID is required' })
  contactId: string;

  @IsString()
  @IsOptional()
  dealId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsEnum(CommunicationType, { message: 'Type must be email, sms, or call' })
  @IsNotEmpty({ message: 'Communication type is required' })
  type: CommunicationType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Scheduled date/time is required' })
  scheduledFor: string;

  @IsBoolean()
  @IsOptional()
  needsApproval?: boolean;
}

export class UpdateScheduledCommunicationDto {
  @IsString()
  @IsOptional()
  contactId?: string;

  @IsString()
  @IsOptional()
  dealId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsEnum(CommunicationType, { message: 'Type must be email, sms, or call' })
  @IsOptional()
  type?: CommunicationType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsDateString()
  @IsOptional()
  scheduledFor?: string;

  @IsEnum(CommunicationStatus, { message: 'Status must be pending, approved, sent, or cancelled' })
  @IsOptional()
  status?: CommunicationStatus;

  @IsBoolean()
  @IsOptional()
  needsApproval?: boolean;
}
