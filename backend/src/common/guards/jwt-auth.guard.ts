import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protects a route with the "jwt" passport strategy. Reads the token from
 * `Authorization: Bearer <token>` (configured in JwtStrategy) and populates
 * `request.user` with the authenticated user record.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
