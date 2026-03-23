// MEDIUM-1: Input validation for workflow update
import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class UpdateWorkflowDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  triggerType?: string;

  @IsObject()
  @IsOptional()
  triggerConfig?: Record<string, any>;

  @IsArray()
  @IsOptional()
  nodes?: any[];  // Complex nested objects, validated at runtime
}
