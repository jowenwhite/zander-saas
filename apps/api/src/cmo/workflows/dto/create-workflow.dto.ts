// MEDIUM-1: Input validation for workflow creation
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty({ message: 'Workflow name is required' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Trigger type is required' })
  triggerType: string;

  @IsObject()
  @IsOptional()
  triggerConfig?: Record<string, any>;

  @IsArray()
  @IsOptional()
  nodes?: any[];  // Complex nested objects, validated at runtime
}
