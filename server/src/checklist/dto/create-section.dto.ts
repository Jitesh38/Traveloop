import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: 1, description: 'Checklist ID this section belongs to' })
  @IsInt()
  @IsPositive()
  checklistId: number;

  @ApiProperty({ example: 'Documents' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;
}
