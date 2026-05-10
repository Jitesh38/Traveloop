import { SetMetadata } from '@nestjs/common';

/** Metadata key used by JwtAuthGuard to skip token validation. */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public()
 *
 * Marks a route or controller as publicly accessible — JwtAuthGuard will
 * skip token verification for any handler decorated with this.
 *
 * Usage:
 *   @Public()
 *   @Post('login')
 *   login() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
