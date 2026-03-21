// MEDIUM-1: Input validation for contact creation
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';

// Must match PersonRole enum in schema.prisma
export enum PersonRole {
  CLIENT = 'CLIENT',
  VENDOR = 'VENDOR',
  TEAM = 'TEAM',
  PARTNER = 'PARTNER',
  REFERRAL = 'REFERRAL'
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

  @IsEnum(PersonRole, { message: 'Role must be CLIENT, VENDOR, TEAM, PARTNER, or REFERRAL' })
  @IsOptional()
  primaryRole?: PersonRole;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assignedToId?: string;
}
