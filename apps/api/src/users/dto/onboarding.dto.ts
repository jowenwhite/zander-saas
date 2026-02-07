// MEDIUM-1: Input validation for onboarding updates
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';

export class UpdateOnboardingStepDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  step: number;
}

export class SetFocusAreaDto {
  @IsString()
  @IsNotEmpty({ message: 'Focus area is required' })
  focusArea: string;
}

export class UpdateChecklistDto {
  @IsObject()
  checklist: Record<string, boolean>;
}
