import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMyTripDto {
  @ApiPropertyOptional({
    example: 'Summer Bali Adventure',
    description: 'Trip name. Auto-generated from region + dates if left empty.',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(200, { message: 'Name must not exceed 200 characters' })
  name?: string;

  @ApiProperty({
    example: 'Bali',
    description: 'Region name. Looked up by name (case-insensitive) to resolve the region ID.',
  })
  @IsNotEmpty({ message: 'Region name is required' })
  @IsString({ message: 'Region name must be a string' })
  @MaxLength(100, { message: 'Region name must not exceed 100 characters' })
  regionName: string;

  @ApiProperty({ example: '2026-06-01', description: 'Trip start date (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString({}, { message: 'Start date must be a valid date (YYYY-MM-DD)' })
  startDate: string;

  @ApiProperty({ example: '2026-06-07', description: 'Trip end date (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'End date is required' })
  @IsDateString({}, { message: 'End date must be a valid date (YYYY-MM-DD)' })
  endDate: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'One or more activity IDs to include in this trip. A TripActivity row is created for each.',
    type: [Number],
  })
  @IsArray({ message: 'activityIds must be an array' })
  @ArrayNotEmpty({ message: 'activityIds must not be empty' })
  @ArrayMinSize(1, { message: 'At least one activity ID is required' })
  @IsInt({ each: true, message: 'Each activity ID must be an integer' })
  @IsPositive({ each: true, message: 'Each activity ID must be a positive number' })
  @Type(() => Number)
  activityIds: number[];
}
