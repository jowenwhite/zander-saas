import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsEmail } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateSignedDocumentDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  engagementId?: string;

  @IsString()
  documentName: string;

  @IsString()
  @IsOptional()
  documentUrl?: string;

  @IsString()
  @IsOptional()
  templateVersion?: string;
}

export class SignDocumentDto {
  @IsString()
  signerName: string;

  @IsEmail()
  signerEmail: string;

  @IsString()
  @IsOptional()
  signerIp?: string;

  @IsString()
  signatureDataUrl: string; // Base64 of signature canvas

  @IsString()
  @IsOptional()
  documentUrl?: string; // Generated PDF URL after signing
}
