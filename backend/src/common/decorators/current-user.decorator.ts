import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '@prisma/client';

/**
 * Extracts the authenticated user (attached to the request by JwtStrategy)
 * inside a controller handler, e.g. `@CurrentUser() user: User`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
    return request.user;
  },
);
