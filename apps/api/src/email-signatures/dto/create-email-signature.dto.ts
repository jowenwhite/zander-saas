import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateEmailSignatureDto {
  @IsString()
  @IsNotEmpty({ message: 'Signature name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Signature body is required' })
  body: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
