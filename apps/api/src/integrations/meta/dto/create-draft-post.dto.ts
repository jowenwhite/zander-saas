import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsDateString } from 'class-validator';

export class CreateDraftPostDto {
  @IsEnum(['facebook', 'instagram'], { message: 'Platform must be facebook or instagram' })
  @IsNotEmpty({ message: 'Platform is required' })
  platform: 'facebook' | 'instagram';

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(63206, { message: 'Content exceeds maximum length' }) // FB max, will validate IG separately
  content: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsDateString()
  @IsOptional()
  scheduledFor?: string;

  @IsString()
  @IsOptional()
  campaignId?: string;
}
