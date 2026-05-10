import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JwtAuthGuard — globally applied guard that validates Bearer JWT tokens.
 *
 * How it works:
 *   1. Checks if the route is decorated with @Public() — skips validation if so.
 *   2. Extracts the Bearer token from the Authorization header.
 *   3. Verifies the token using JwtService (checks signature + expiry).
 *   4. Attaches the decoded payload to request.user for downstream use.
 *
 * Applied globally via APP_GUARD in AppModule — no need to add @UseGuards()
 * on individual controllers. Use @Public() to opt out of protection.
 *
 * Token extraction:
 *   Authorization: Bearer <token>
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check for @Public() on the handler or the controller class
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'Access token is missing. Include "Authorization: Bearer <token>" header.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // Attach payload to request so @CurrentUser() can read it
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(
        'Access token is invalid or has expired. Please log in again.',
      );
    }

    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
