import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateEmailSignatureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
