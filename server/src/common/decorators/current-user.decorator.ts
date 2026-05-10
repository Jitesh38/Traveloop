import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  iat: number;
  exp: number;
}

/**
 * @CurrentUser()
 *
 * Extracts the authenticated user payload (set by JwtAuthGuard) from the
 * request object.
 *
 * Usage in a controller:
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: JwtPayload) {
 *     return user;
 *   }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['user'] as JwtPayload;
  },
);
