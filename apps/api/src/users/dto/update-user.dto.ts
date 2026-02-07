// MEDIUM-1: Input validation for user updates
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from './invite-user.dto';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(UserRole, { message: 'Role must be owner, admin, manager, member, or viewer' })
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  phone?: string;
}
