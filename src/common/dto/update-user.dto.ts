import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/user.types';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newemail@example.com',
    format: 'email',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Username',
    example: 'newusername',
    minLength: 3,
    maxLength: 20,
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.MODERATOR,
    required: false
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
