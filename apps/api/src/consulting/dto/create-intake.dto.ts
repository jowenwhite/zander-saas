import { IsString, IsOptional, IsInt, IsArray, IsBoolean, IsEnum, Min } from 'class-validator';

export class CreateIntakeDto {
  @IsString()
  tenantId: string;

  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsInBusiness?: number;

  @IsOptional()
  @IsString()
  annualRevenue?: string;

  @IsOptional()
  @IsString()
  employeeCount?: string;

  @IsString()
  contactName: string;

  @IsString()
  contactEmail: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  preferredContact?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primaryGoals?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  biggestChallenges?: string[];

  @IsOptional()
  @IsString()
  desiredOutcomes?: string;

  @IsOptional()
  @IsString()
  packageInterest?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentTools?: string[];

  @IsOptional()
  @IsBoolean()
  previousConsulting?: boolean;

  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @IsOptional()
  @IsString()
  howHeardAboutUs?: string;
}

export class UpdateIntakeDto {
  @IsOptional()
  @IsEnum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'CONVERTED', 'DECLINED'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  convertedToEngagement?: string;
}
