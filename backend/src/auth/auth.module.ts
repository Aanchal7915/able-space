import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

// GoogleStrategy's constructor (passport-google-oauth20) throws synchronously
// if clientID/clientSecret/callbackURL are missing, which would crash the
// whole app at boot. So it's only added to `providers` when all three env
// vars are actually set — otherwise GoogleAuthGuard short-circuits with a
// 501 before passport ever tries to use the (unregistered) "google" strategy.
const googleProviders: Provider[] = [];
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  googleProviders.push(GoogleStrategy);
}

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
            '7d') as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleAuthGuard, ...googleProviders],
  exports: [AuthService],
})
export class AuthModule {}
