import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DeliverableStatus } from '@prisma/client';

export class CreateDeliverableDto {
  @IsString()
  tenantId: string;

  @IsString()
  engagementId: string;

  @IsString()
  packageTier: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDeliverableDto {
  @IsEnum(DeliverableStatus)
  @IsOptional()
  status?: DeliverableStatus;

  @IsString()
  @IsOptional()
  documentUrl?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
