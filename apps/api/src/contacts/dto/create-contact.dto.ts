// MEDIUM-1: Input validation for contact creation
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum PersonRole {
  LEAD = 'LEAD',
  CLIENT = 'CLIENT',
  PARTNER = 'PARTNER',
  VENDOR = 'VENDOR',
  EMPLOYEE = 'EMPLOYEE'
}

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

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
