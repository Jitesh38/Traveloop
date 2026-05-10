/**
 * S3StorageProvider — Placeholder for AWS S3 / Cloudflare R2 / GCS.
 *
 * ── Activation Steps ──────────────────────────────────────────────────────
 *  1. npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *  2. Fill in the TODOs below
 *  3. In upload.module.ts, replace:
 *       { provide: STORAGE_PROVIDER, useClass: LocalStorageProvider }
 *     with:
 *       { provide: STORAGE_PROVIDER, useClass: S3StorageProvider }
 *
 * ── Cloudflare R2 ─────────────────────────────────────────────────────────
 *  R2 is S3-compatible; just change the endpoint:
 *    endpoint: `https://${accountId}.r2.cloudflarestorage.com`
 *
 * ── CDN Integration ───────────────────────────────────────────────────────
 *  Override getUrl() to return your CDN domain instead of the S3 URL.
 *  Example: `https://cdn.yourdomain.com/${filename}`
 *
 * ── Architecture note ─────────────────────────────────────────────────────
 *  Zero changes to UploadService or UploadController required — the provider
 *  pattern ensures full storage-layer isolation.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  StorageProvider,
  StoredFile,
} from '../interfaces/storage-provider.interface';

@Injectable()
export class S3StorageProvider extends StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor(private readonly configService: ConfigService) {
    super();
    // TODO: Initialise S3Client
    //
    // import { S3Client } from '@aws-sdk/client-s3';
    //
    // this.client = new S3Client({
    //   region: configService.getOrThrow('AWS_REGION'),
    //   credentials: {
    //     accessKeyId: configService.getOrThrow('AWS_ACCESS_KEY_ID'),
    //     secretAccessKey: configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
    //   },
    //   // For Cloudflare R2:
    //   // endpoint: `https://${configService.get('CF_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    // });
  }

  async store(_file: Express.Multer.File): Promise<StoredFile> {
    // TODO:
    // import { PutObjectCommand } from '@aws-sdk/client-s3';
    // const key = `uploads/${uuidv4()}${ext}`;
    // await this.client.send(new PutObjectCommand({
    //   Bucket: this.configService.get('AWS_S3_BUCKET'),
    //   Key: key,
    //   Body: file.buffer,
    //   ContentType: file.mimetype,
    //   ACL: 'public-read',  // or use presigned URLs for private buckets
    // }));
    throw new Error(
      'S3StorageProvider not implemented. Install @aws-sdk/client-s3 and fill in the TODOs.',
    );
  }

  async delete(_filename: string): Promise<void> {
    // TODO:
    // import { DeleteObjectCommand } from '@aws-sdk/client-s3';
    // await this.client.send(new DeleteObjectCommand({
    //   Bucket: this.configService.get('AWS_S3_BUCKET'),
    //   Key: `uploads/${filename}`,
    // }));
    throw new Error('S3StorageProvider not implemented.');
  }

  getUrl(filename: string): string {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const region = this.configService.get<string>('AWS_REGION');
    // For CloudFront CDN: return `https://${this.configService.get('CDN_DOMAIN')}/${filename}`;
    return `https://${bucket}.s3.${region}.amazonaws.com/uploads/${filename}`;
  }

  async getMetadata(_filename: string): Promise<StoredFile | null> {
    // TODO:
    // import { HeadObjectCommand } from '@aws-sdk/client-s3';
    // const result = await this.client.send(new HeadObjectCommand({ ... }));
    throw new Error('S3StorageProvider not implemented.');
  }
}
