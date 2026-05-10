import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 1, description: 'Section ID this item belongs to' })
  @IsInt()
  @IsPositive()
  sectionId: number;

  @ApiProperty({ example: 'Passport' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;
}
