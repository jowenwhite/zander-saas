// MEDIUM-1: Input validation for AI chat endpoints
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExecutiveId {
  CRO = 'cro',
  CFO = 'cfo',
  COO = 'coo',
  CMO = 'cmo',
  CPO = 'cpo',
  CIO = 'cio',
  EA = 'ea'
}

export class ConversationMessageDto {
  @IsEnum(['user', 'assistant'], { message: 'Role must be user or assistant' })
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ExecutiveChatDto {
  @IsEnum(ExecutiveId, { message: 'Invalid executive ID' })
  @IsNotEmpty({ message: 'Executive ID is required' })
  executiveId: ExecutiveId;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  @IsOptional()
  conversationHistory?: ConversationMessageDto[];
}

export class ZanderChatDto {
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  @IsOptional()
  conversationHistory?: ConversationMessageDto[];
}
