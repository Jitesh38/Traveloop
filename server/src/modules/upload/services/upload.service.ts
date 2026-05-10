import { Injectable, NotFoundException } from '@nestjs/common';
import {
  StorageProvider,
  StoredFile,
} from '../interfaces/storage-provider.interface';

/**
 * UploadService — orchestrates file operations through the StorageProvider.
 *
 * This service is intentionally thin: it holds no knowledge of where or how
 * files are stored. All storage decisions live in the provider.
 * This satisfies the Single Responsibility and Dependency Inversion principles.
 */
@Injectable()
export class UploadService {
  constructor(private readonly storage: StorageProvider) {}

  async uploadSingle(file: Express.Multer.File): Promise<{
    success: true;
    message: string;
    data: StoredFile;
  }> {
    const stored = await this.storage.store(file);
    return {
      success: true,
      message: 'File uploaded successfully',
      data: stored,
    };
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<{
    success: true;
    message: string;
    data: StoredFile[];
  }> {
    // Upload all files concurrently for performance
    const stored = await Promise.all(files.map((f) => this.storage.store(f)));
    return {
      success: true,
      message: `${stored.length} file(s) uploaded successfully`,
      data: stored,
    };
  }

  async delete(filename: string): Promise<{ success: true; message: string }> {
    const meta = await this.storage.getMetadata(filename);
    if (!meta) {
      throw new NotFoundException(`File "${filename}" not found`);
    }
    await this.storage.delete(filename);
    return { success: true, message: 'File deleted successfully' };
  }

  async getMetadata(filename: string): Promise<{
    success: true;
    message: string;
    data: StoredFile;
  }> {
    const meta = await this.storage.getMetadata(filename);
    if (!meta) {
      throw new NotFoundException(`File "${filename}" not found`);
    }
    return {
      success: true,
      message: 'File metadata retrieved',
      data: meta,
    };
  }

  getPublicUrl(filename: string): string {
    return this.storage.getUrl(filename);
  }
}
