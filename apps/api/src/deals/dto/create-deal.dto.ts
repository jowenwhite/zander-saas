// MEDIUM-1: Input validation for deal creation
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';

export enum DealPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export class CreateDealDto {
  @IsString()
  @IsNotEmpty({ message: 'Deal name is required' })
  dealName: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsNumber()
  @Min(0, { message: 'Deal value must be positive' })
  dealValue: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probability?: number;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsEnum(DealPriority, { message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' })
  @IsOptional()
  priority?: DealPriority;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  nextSteps?: string;

  @IsString()
  @IsOptional()
  assignedToId?: string;
}
