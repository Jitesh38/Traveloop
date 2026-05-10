import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateTripActivityDto {
  @ApiPropertyOptional({
    example: '2026-06-02T09:00:00.000Z',
    description: 'Start date and time of the activity (ISO 8601)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'startDateTime must be a valid ISO 8601 datetime' })
  startDateTime?: string;

  @ApiPropertyOptional({
    example: '2026-06-02T12:00:00.000Z',
    description: 'End date and time of the activity (ISO 8601). Must be after startDateTime.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'endDateTime must be a valid ISO 8601 datetime' })
  endDateTime?: string;

  @ApiPropertyOptional({ example: '150.00', description: 'Budget for this activity' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' }, { message: 'Budget must be a valid decimal number' })
  budget?: string;

  @ApiPropertyOptional({ example: 'Morning snorkelling session at the reef.' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;
}
