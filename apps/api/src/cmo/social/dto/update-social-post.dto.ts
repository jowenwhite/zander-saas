import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class UpdateSocialPostDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class ApprovePostDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

export class RejectPostDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SchedulePostDto {
  @IsDateString()
  scheduledFor: string;
}
