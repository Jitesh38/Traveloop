import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(100, { message: 'Email must not exceed 100 characters' })
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+?[0-9\s\-().]{7,20}$/, {
    message: 'Phone number is invalid. Example: +1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country?: string;

  @ApiPropertyOptional({ example: 'Travel enthusiast and photographer.' })
  @IsOptional()
  @IsString({ message: 'Additional information must be a string' })
  @MaxLength(1000, { message: 'Additional information must not exceed 1000 characters' })
  additionalInformation?: string;

  @ApiProperty({ example: 'StrongPass@123', minLength: 8 })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(64, { message: 'Password must not exceed 64 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}
