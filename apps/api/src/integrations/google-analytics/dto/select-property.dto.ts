import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SelectPropertyDto {
  @IsString()
  @IsNotEmpty({ message: 'Property ID is required' })
  propertyId: string;

  @IsString()
  @IsNotEmpty({ message: 'Property name is required' })
  propertyName: string;

  @IsString()
  @IsOptional()
  measurementId?: string;

  @IsString()
  @IsOptional()
  accountId?: string;
}
