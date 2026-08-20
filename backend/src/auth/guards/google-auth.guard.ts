import { ExecutionContext, Injectable, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

/**
 * Wraps the "google" passport strategy so that when Google OAuth env vars are
 * not configured we return a clean 501 instead of Nest's default "Unknown
 * authentication strategy" 500 (which would happen because GoogleStrategy is
 * never registered as a provider in that case — see auth.module.ts).
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  private isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('GOOGLE_CLIENT_ID') &&
        this.config.get<string>('GOOGLE_CLIENT_SECRET') &&
        this.config.get<string>('GOOGLE_CALLBACK_URL'),
    );
  }

  canActivate(context: ExecutionContext) {
    if (!this.isConfigured()) {
      throw new NotImplementedException('Google login is not configured on this server.');
    }
    return super.canActivate(context) as boolean | Promise<boolean>;
  }
}
