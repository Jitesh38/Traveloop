import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateSectionDto {
  @ApiProperty({ example: 'Important Documents' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;
}
