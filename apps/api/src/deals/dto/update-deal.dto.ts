// MEDIUM-1: Input validation for deal updates
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { DealPriority } from './create-deal.dto';

export class UpdateDealDto {
  @IsString()
  @IsOptional()
  dealName?: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Deal value must be positive' })
  dealValue?: number;

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

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @IsDateString()
  @IsOptional()
  actualCloseDate?: string;

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
