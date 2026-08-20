import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

/**
 * Only instantiated by AuthModule when GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 * / GOOGLE_CALLBACK_URL are all present (see auth.module.ts) — the
 * passport-google-oauth20 Strategy constructor throws synchronously if any
 * of those are missing, which would otherwise crash the app at boot.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value ?? null;
    const googleUser = {
      googleId: profile.id,
      email,
      fullName: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
    done(null, googleUser);
  }
}
