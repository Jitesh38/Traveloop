import { ApiProperty } from '@nestjs/swagger';

/** Shape of a single stored file returned in API responses. */
export class FileDataDto {
  @ApiProperty({ example: 'a3f8c2d1-4e5f-6789-abcd-ef0123456789.jpg' })
  filename: string;

  @ApiProperty({ example: 'profile-photo.jpg' })
  originalName: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ example: 204800, description: 'File size in bytes' })
  size: number;

  @ApiProperty({ example: 'http://localhost:3000/uploads/a3f8c2d1-....jpg' })
  url: string;
}

/** Standard single-file upload response. */
export class UploadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'File uploaded successfully' })
  message: string;

  @ApiProperty({ type: FileDataDto })
  data: FileDataDto;
}

/** Standard multi-file upload response. */
export class MultiUploadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '3 file(s) uploaded successfully' })
  message: string;

  @ApiProperty({ type: [FileDataDto] })
  data: FileDataDto[];
}

/** Standard delete response. */
export class DeleteResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'File deleted successfully' })
  message: string;
}

/** Standard metadata response. */
export class MetadataResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'File metadata retrieved' })
  message: string;

  @ApiProperty({ type: FileDataDto })
  data: FileDataDto;
}
