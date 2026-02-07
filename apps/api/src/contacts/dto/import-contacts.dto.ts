// MEDIUM-1: Input validation for bulk contact import
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContactDto } from './create-contact.dto';

export class ImportContactsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one contact is required for import' })
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contacts: CreateContactDto[];
}
