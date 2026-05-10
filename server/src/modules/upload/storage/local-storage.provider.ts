import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  StorageProvider,
  StoredFile,
} from '../interfaces/storage-provider.interface';

/**
 * LocalStorageProvider — writes files to the local filesystem under public/uploads.
 *
 * Architecture decision:
 *   Files are received as Express.Multer.File with buffer in memory (memoryStorage).
 *   The provider is the single point responsible for naming (UUID), persisting,
 *   and URL generation. This keeps the controller and service completely storage-agnostic.
 *
 * Production recommendation:
 *   Use this provider for development and single-server deployments.
 *   For multi-server / containerised deployments, switch to S3StorageProvider
 *   so all instances share the same storage layer.
 *
 * Sharp image optimisation placeholder:
 *   Uncomment the sharp block in store() to enable resizing/compression
 *   before writing to disk. Install: npm install sharp
 */
@Injectable()
export class LocalStorageProvider extends StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  // Map extensions → MIME for metadata reconstruction
  private static readonly MIME_MAP: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };

  constructor(private readonly configService: ConfigService) {
    super();
    this.uploadPath = path.join(
      process.cwd(),
      this.configService.get<string>('UPLOAD_PATH', 'public/uploads'),
    );
    this.baseUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    this.ensureUploadDir();
  }

  // ─── Interface Implementation ──────────────────────────────────────────────

  async store(file: Express.Multer.File): Promise<StoredFile> {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadPath, filename);

    // ── Sharp optimisation placeholder ─────────────────────────────────────
    // Uncomment to enable automatic resize + compression before saving.
    // import sharp from 'sharp';
    // const optimised = await sharp(file.buffer)
    //   .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    //   .jpeg({ quality: 85 })
    //   .toBuffer();
    // await fs.promises.writeFile(filePath, optimised);
    // ───────────────────────────────────────────────────────────────────────

    await fs.promises.writeFile(filePath, file.buffer);
    this.logger.log(`Stored: ${filename} (${file.size} bytes)`);

    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: this.getUrl(filename),
      path: filePath,
    };
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadPath, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      this.logger.log(`Deleted: ${filename}`);
    }
  }

  getUrl(filename: string): string {
    // For CDN integration: return `${this.configService.get('CDN_URL')}/${filename}`;
    return `${this.baseUrl}/uploads/${filename}`;
  }

  async getMetadata(filename: string): Promise<StoredFile | null> {
    const filePath = path.join(this.uploadPath, filename);
    if (!fs.existsSync(filePath)) return null;

    const stats = await fs.promises.stat(filePath);
    const ext = path.extname(filename).toLowerCase();

    return {
      filename,
      originalName: filename,
      mimetype: LocalStorageProvider.MIME_MAP[ext] ?? 'application/octet-stream',
      size: stats.size,
      url: this.getUrl(filename),
      path: filePath,
    };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadPath}`);
    }
  }
}
