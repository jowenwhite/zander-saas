import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { EngagementStatus } from '@prisma/client';

export class CreateEngagementDto {
  @IsString()
  tenantId: string;

  @IsString()
  packageType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  totalHours?: number;

  @IsString()
  @IsOptional()
  stripePaymentId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEngagementDto {
  @IsEnum(EngagementStatus)
  @IsOptional()
  status?: EngagementStatus;

  @IsNumber()
  @IsOptional()
  hoursUsed?: number;

  @IsNumber()
  @IsOptional()
  billableHours?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
