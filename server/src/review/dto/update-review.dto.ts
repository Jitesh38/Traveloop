import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating?: number;

  @ApiPropertyOptional({ example: 'Updated thoughts after a second visit.' })
  @IsOptional()
  @IsString({ message: 'Experience must be a string' })
  @MaxLength(2000, { message: 'Experience must not exceed 2000 characters' })
  experience?: string;
}
