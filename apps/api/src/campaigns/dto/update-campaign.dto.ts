// MEDIUM-1: Input validation for campaign updates
import { IsString, IsOptional, IsArray, IsEnum, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus, TriggerType } from './create-campaign.dto';

export class UpdateCampaignStepDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  @Min(0)
  order: number;

  @IsString()
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
  content: string;
}

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  name?: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCampaignStepDto)
  @IsOptional()
  steps?: UpdateCampaignStepDto[];
}
