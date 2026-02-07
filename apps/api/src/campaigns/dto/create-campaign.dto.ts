// MEDIUM-1: Input validation for campaign creation
import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsBoolean, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

export enum TriggerType {
  MANUAL = 'manual',
  FORM_SUBMISSION = 'form_submission',
  TAG_ADDED = 'tag_added',
  DEAL_STAGE_CHANGED = 'deal_stage_changed'
}

export class CampaignStepDto {
  @IsNumber()
  @Min(0)
  order: number;

  @IsString()
  @IsNotEmpty()
  channel: string;

  @IsNumber()
  @Min(0)
  dayOffset: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  hourOffset?: number;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty({ message: 'Step content is required' })
  content: string;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty({ message: 'Campaign name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  channels?: string[];

  @IsEnum(CampaignStatus, { message: 'Status must be draft, active, paused, or completed' })
  @IsOptional()
  status?: CampaignStatus;

  @IsEnum(TriggerType, { message: 'Trigger type must be manual, form_submission, tag_added, or deal_stage_changed' })
  @IsOptional()
  triggerType?: TriggerType;

  @IsOptional()
  triggerConfig?: any;

  @IsBoolean()
  @IsOptional()
  isFromTreasury?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignStepDto)
  @IsOptional()
  steps?: CampaignStepDto[];
}
