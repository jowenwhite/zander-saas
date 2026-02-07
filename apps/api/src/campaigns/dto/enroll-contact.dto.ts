// MEDIUM-1: Input validation for campaign enrollment
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EnrollContactDto {
  @IsString()
  @IsNotEmpty({ message: 'Contact ID is required for enrollment' })
  contactId: string;

  @IsString()
  @IsOptional()
  dealId?: string;
}
