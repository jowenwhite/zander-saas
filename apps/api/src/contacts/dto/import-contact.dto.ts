import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { PersonRole } from './create-contact.dto';

export class ImportContactDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

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
  notes?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsEnum(PersonRole, { message: 'Role must be CLIENT, VENDOR, TEAM, PARTNER, or REFERRAL' })
  @IsOptional()
  primaryRole?: PersonRole;
}

export class ExecuteImportDto {
  contacts: ImportContactDto[];
  duplicateStrategy: 'skip' | 'update' | 'import';
  defaultRole: PersonRole;
  fileType: 'vcf' | 'csv' | 'xlsx';
}

export class CheckDuplicatesDto {
  contacts: ImportContactDto[];
}
