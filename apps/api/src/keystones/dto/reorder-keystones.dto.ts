import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class KeystoneOrderItem {
  @IsString()
  id: string;

  @IsNumber()
  sortOrder: number;
}

export class ReorderKeystonesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeystoneOrderItem)
  items: KeystoneOrderItem[];
}
