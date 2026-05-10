import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import {
  FileValidationPipe,
  FileValidationOptions,
} from './file-validation.pipe';

/**
 * FilesValidationPipe — validates an array of uploaded files.
 * Delegates individual file validation to FileValidationPipe to keep logic DRY.
 */
@Injectable()
export class FilesValidationPipe implements PipeTransform {
  private readonly singleFilePipe: FileValidationPipe;
  private readonly maxFiles: number;

  constructor(options: FileValidationOptions & { maxFiles?: number } = {}) {
    this.maxFiles = options.maxFiles ?? 10;
    this.singleFilePipe = new FileValidationPipe(options);
  }

  transform(files: Express.Multer.File[]): Express.Multer.File[] {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > this.maxFiles) {
      throw new BadRequestException(
        `Too many files. Maximum allowed: ${this.maxFiles}`,
      );
    }

    // Validate each file individually — surface the first error found
    files.forEach((file, index) => {
      try {
        this.singleFilePipe.transform(file);
      } catch (err: any) {
        throw new BadRequestException(
          `File [${index + 1}] "${file.originalname}": ${err.message}`,
        );
      }
    });

    return files;
  }
}
