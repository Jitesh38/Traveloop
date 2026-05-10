import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './controllers/upload.controller';
import { UploadService } from './services/upload.service';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { StorageProvider } from './interfaces/storage-provider.interface';

/**
 * UploadModule — self-contained, plug-and-play upload feature module.
 *
 * ── Provider pattern ──────────────────────────────────────────────────────
 * StorageProvider (abstract class) is used as both the type and the DI token.
 * To switch storage backends, change only the useClass line below:
 *
 *   Development / single-server:
 *     { provide: StorageProvider, useClass: LocalStorageProvider }
 *
 *   Production / multi-server / S3:
 *     { provide: StorageProvider, useClass: S3StorageProvider }
 *
 *   Cloudflare R2:
 *     { provide: StorageProvider, useClass: S3StorageProvider }
 *     (R2 is S3-compatible — just change the endpoint in the provider)
 *
 * ── Future extensibility ──────────────────────────────────────────────────
 * • Use useFactory to select provider at runtime via STORAGE_DRIVER env var.
 * • Export UploadService so other modules can call getPublicUrl().
 */
@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    {
      /**
       * Swap useClass here to switch storage backends.
       * Zero changes to UploadService or UploadController required.
       */
      provide: StorageProvider,
      useClass: LocalStorageProvider,
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
