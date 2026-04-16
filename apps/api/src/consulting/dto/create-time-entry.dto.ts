import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateTimeEntryDto {
  @IsString()
  tenantId: string;

  @IsString()
  engagementId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  hours: number;

  @IsNumber()
  @IsOptional()
  billableHours?: number;

  @IsString()
  description: string;

  @IsString()
  category: string;
}

export class UpdateTimeEntryDto {
  @IsNumber()
  @IsOptional()
  hours?: number;

  @IsNumber()
  @IsOptional()
  billableHours?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
