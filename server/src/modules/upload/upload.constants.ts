/**
 * Injection token for the storage provider.
 * Using a string token instead of a class reference allows us to swap
 * LocalStorageProvider → S3StorageProvider without changing any consumer code.
 * This is the core of the Strategy / Dependency Inversion pattern here.
 */
export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
