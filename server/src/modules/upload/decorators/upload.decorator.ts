import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

/**
 * @UploadSingle(fieldName)
 *
 * Reusable decorator for single-file endpoints.
 * Combines:
 *   • FileInterceptor (multer, memory storage)
 *   • Swagger @ApiConsumes + @ApiBody boilerplate
 *
 * Architecture decision — memoryStorage:
 *   Files are held in memory as Buffer so the StorageProvider can decide
 *   how to persist them (disk, S3, R2 etc.) without being tied to a temp path.
 *   For very large files, consider DiskStorage + streaming, but for images
 *   (< 10 MB) memory storage is the right trade-off.
 *
 * The hard multer limit (10 MB) is a first-pass guard at the network layer.
 * The FileValidationPipe enforces the configurable soft limit per-route.
 */
export function UploadSingle(fieldName: string = 'file') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB hard cap
      }),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: [fieldName],
        properties: {
          [fieldName]: { type: 'string', format: 'binary' },
        },
      },
    }),
  );
}

/**
 * @UploadMultiple(fieldName, maxCount)
 *
 * Reusable decorator for multi-file endpoints.
 */
export function UploadMultiple(
  fieldName: string = 'files',
  maxCount: number = 10,
) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
      }),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: [fieldName],
        properties: {
          [fieldName]: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
          },
        },
      },
    }),
  );
}
