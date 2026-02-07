// MEDIUM-1: Input validation for contact updates
import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { PersonRole } from './create-contact.dto';

export class UpdateContactDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsEnum(PersonRole, { message: 'Role must be LEAD, CLIENT, PARTNER, VENDOR, or EMPLOYEE' })
  @IsOptional()
  primaryRole?: PersonRole;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assignedToId?: string;
}
