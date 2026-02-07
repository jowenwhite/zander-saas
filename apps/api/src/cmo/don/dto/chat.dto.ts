// MEDIUM-1: Input validation for Don AI chat endpoint
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class DonConversationMessageDto {
  @IsEnum(['user', 'assistant'], { message: 'Role must be user or assistant' })
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class DonChatDto {
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DonConversationMessageDto)
  @IsOptional()
  conversationHistory?: DonConversationMessageDto[];
}
