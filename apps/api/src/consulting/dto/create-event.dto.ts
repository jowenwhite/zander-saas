import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ConsultingEventType } from '@prisma/client';

export class CreateEventDto {
  @IsEnum(ConsultingEventType)
  type: ConsultingEventType;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  engagementId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  actorType?: string; // "system", "user", "webhook"

  @IsString()
  @IsOptional()
  actorId?: string;
}
