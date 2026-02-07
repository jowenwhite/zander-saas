// MEDIUM-1: Input validation for bulk deal import
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDealDto } from './create-deal.dto';

export class ImportDealsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one deal is required for import' })
  @ValidateNested({ each: true })
  @Type(() => CreateDealDto)
  deals: CreateDealDto[];
}
