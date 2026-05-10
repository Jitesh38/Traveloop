/**
 * StoredFile — normalised result returned by any storage provider.
 * Consumers (services, controllers) work against this shape regardless
 * of whether the file lives on disk, S3, or Cloudflare R2.
 */
export interface StoredFile {
  filename: string;      // UUID-based filename, e.g. "a3f8c2d1-...jpg"
  originalName: string;  // original upload name
  mimetype: string;
  size: number;          // bytes
  url: string;           // publicly accessible URL
  path: string;          // storage-layer path (local path or S3 key)
}

/**
 * StorageProvider — abstract class used as both the type contract and the
 * NestJS injection token.
 *
 * Architecture decision:
 *   An abstract class (rather than an interface) is used because TypeScript
 *   erases interfaces at runtime, making them unusable as injection tokens
 *   with emitDecoratorMetadata. An abstract class compiles to a real JS value
 *   that NestJS DI can resolve against.
 *
 *   Switching storage backends requires only changing the useClass binding
 *   in upload.module.ts — zero changes to UploadService or controllers.
 *
 * Scalability:
 *   Override getUrl() in any provider to return a CDN domain.
 *   Add generatePresignedUrl() for private-bucket access patterns.
 */
export abstract class StorageProvider {
  abstract store(file: Express.Multer.File): Promise<StoredFile>;
  abstract delete(filename: string): Promise<void>;
  abstract getUrl(filename: string): string;
  abstract getMetadata(filename: string): Promise<StoredFile | null>;
}
