import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiPropertyOptional({ example: 1, description: 'Region ID to review (at least one of regionId or activityId is required)' })
  @IsOptional()
  @IsInt({ message: 'regionId must be an integer' })
  @IsPositive({ message: 'regionId must be positive' })
  regionId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Activity ID to review (at least one of regionId or activityId is required)' })
  @IsOptional()
  @IsInt({ message: 'activityId must be an integer' })
  @IsPositive({ message: 'activityId must be positive' })
  activityId?: number;

  @ApiProperty({ example: 4, description: 'Star rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsNotEmpty({ message: 'Rating is required' })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @ApiProperty({ example: 'Absolutely breathtaking views and friendly locals. Would visit again!' })
  @IsNotEmpty({ message: 'Experience is required' })
  @IsString({ message: 'Experience must be a string' })
  @MaxLength(2000, { message: 'Experience must not exceed 2000 characters' })
  experience: string;
}
