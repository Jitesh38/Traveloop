import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadSingle, UploadMultiple } from '../decorators/upload.decorator';
import { FileValidationPipe } from '../validators/file-validation.pipe';
import { FilesValidationPipe } from '../validators/files-validation.pipe';
import { UploadService } from '../services/upload.service';
import {
  DeleteResponseDto,
  MetadataResponseDto,
  MultiUploadResponseDto,
  UploadResponseDto,
} from '../dto/upload-response.dto';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ─── Single File Upload ────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UploadSingle('file')
  @ApiOperation({
    summary: 'Upload a single image',
    description:
      'Accepts one image file (JPEG, PNG, GIF, WEBP). Max 5 MB. Returns the public URL.',
  })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed (type/size/extension)' })
  uploadSingle(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.uploadService.uploadSingle(file);
  }

  // ─── Multiple File Upload ──────────────────────────────────────────────────

  @Post('multiple')
  @HttpCode(HttpStatus.CREATED)
  @UploadMultiple('files', 10)
  @ApiOperation({
    summary: 'Upload multiple images',
    description: 'Accepts up to 10 image files in a single request.',
  })
  @ApiResponse({ status: 201, type: MultiUploadResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  uploadMultiple(
    @UploadedFiles(new FilesValidationPipe({ maxFiles: 10 }))
    files: Express.Multer.File[],
  ): Promise<MultiUploadResponseDto> {
    return this.uploadService.uploadMultiple(files);
  }

  // ─── Get File Metadata ─────────────────────────────────────────────────────

  @Get(':filename/metadata')
  @ApiOperation({
    summary: 'Get file metadata',
    description: 'Returns size, MIME type, and public URL for a stored file.',
  })
  @ApiParam({ name: 'filename', example: 'a3f8c2d1-4e5f-6789-abcd-ef0123456789.jpg' })
  @ApiResponse({ status: 200, type: MetadataResponseDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  getMetadata(
    @Param('filename') filename: string,
  ): Promise<MetadataResponseDto> {
    return this.uploadService.getMetadata(filename);
  }

  // ─── Delete File ───────────────────────────────────────────────────────────

  @Delete(':filename')
  @ApiOperation({
    summary: 'Delete a file',
    description: 'Permanently removes the file from storage.',
  })
  @ApiParam({ name: 'filename', example: 'a3f8c2d1-4e5f-6789-abcd-ef0123456789.jpg' })
  @ApiResponse({ status: 200, type: DeleteResponseDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  deleteFile(
    @Param('filename') filename: string,
  ): Promise<DeleteResponseDto> {
    return this.uploadService.delete(filename);
  }
}
