import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';

/**
 * Options to customise validation rules per route.
 * Defaults come from environment config; override per-endpoint as needed.
 */
export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  /** If true, skips all validation when no file is provided (optional upload). */
  optional?: boolean;
}

/** Extensions that must NEVER be accepted regardless of MIME type. */
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi',
  '.dll', '.com', '.vbs', '.jar', '.py', '.rb',
  '.php', '.jsp', '.asp', '.aspx',
]);

/** MIME types that must NEVER be accepted. */
const BLOCKED_MIME_TYPES = new Set([
  'application/x-msdownload',
  'application/x-executable',
  'application/x-sh',
  'application/x-bat',
  'application/x-msdos-program',
]);

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const DEFAULT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * FileValidationPipe — validates a single uploaded file.
 *
 * Security considerations:
 *   • Double-checks both extension AND MIME type — spoofing one is easy,
 *     spoofing both simultaneously is significantly harder.
 *   • Blocks executable extensions at the gate to prevent code execution
 *     if files end up being served from the same origin.
 *   • Always runs AFTER multer's hard size limit (set in the decorator)
 *     so oversized files are rejected at the network layer first.
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSizeBytes: number;
  private readonly allowedMimeTypes: string[];
  private readonly allowedExtensions: string[];
  private readonly optional: boolean;

  constructor(options: FileValidationOptions = {}) {
    this.maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE;
    this.allowedMimeTypes = options.allowedMimeTypes ?? DEFAULT_MIME_TYPES;
    this.allowedExtensions = options.allowedExtensions ?? DEFAULT_EXTENSIONS;
    this.optional = options.optional ?? false;
  }

  transform(file: Express.Multer.File): Express.Multer.File | undefined {
    if (!file) {
      if (this.optional) return undefined;
      throw new BadRequestException('No file provided');
    }

    const ext = path.extname(file.originalname).toLowerCase();

    // 1. Block executable extensions unconditionally
    if (BLOCKED_EXTENSIONS.has(ext)) {
      throw new BadRequestException(
        `File extension "${ext}" is not allowed for security reasons`,
      );
    }

    // 2. Block dangerous MIME types unconditionally
    if (BLOCKED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `MIME type "${file.mimetype}" is not allowed`,
      );
    }

    // 3. Validate against allowed MIME types
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid MIME type "${file.mimetype}". Allowed: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // 4. Validate against allowed extensions
    if (!this.allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `Invalid extension "${ext}". Allowed: ${this.allowedExtensions.join(', ')}`,
      );
    }

    // 5. Soft size limit (the multer decorator enforces a hard limit above this)
    if (file.size > this.maxSizeBytes) {
      const maxMB = (this.maxSizeBytes / (1024 * 1024)).toFixed(1);
      throw new BadRequestException(
        `File too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed: ${maxMB} MB`,
      );
    }

    return file;
  }
}
