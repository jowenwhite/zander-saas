// MEDIUM-1: Input validation for email sequences
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export enum SequenceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused'
}

export enum SequenceTriggerType {
  MANUAL = 'manual',
  STAGE_CHANGE = 'stage_change',
  FORM_SUBMISSION = 'form_submission'
}

export class CreateEmailSequenceDto {
  @IsString()
  @IsNotEmpty({ message: 'Sequence name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SequenceStatus, { message: 'Status must be draft, active, or paused' })
  @IsOptional()
  status?: SequenceStatus;

  @IsEnum(SequenceTriggerType, { message: 'Trigger type must be manual, stage_change, or form_submission' })
  @IsOptional()
  triggerType?: SequenceTriggerType;

  @IsOptional()
  triggerConfig?: any;
}

export class UpdateEmailSequenceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SequenceStatus, { message: 'Status must be draft, active, or paused' })
  @IsOptional()
  status?: SequenceStatus;

  @IsEnum(SequenceTriggerType, { message: 'Trigger type must be manual, stage_change, or form_submission' })
  @IsOptional()
  triggerType?: SequenceTriggerType;

  @IsOptional()
  triggerConfig?: any;
}

export class CreateSequenceStepDto {
  @IsString()
  @IsNotEmpty({ message: 'Template ID is required for sequence step' })
  templateId: string;

  @IsNumber()
  @Min(0)
  delayDays: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  delayHours?: number;

  @IsNumber()
  @Min(0)
  order: number;
}

export class UpdateSequenceStepDto {
  @IsString()
  @IsOptional()
  templateId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  delayDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  delayHours?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;
}

export class EnrollContactSequenceDto {
  @IsString()
  @IsNotEmpty({ message: 'Contact ID is required for enrollment' })
  contactId: string;

  @IsString()
  @IsOptional()
  dealId?: string;
}
