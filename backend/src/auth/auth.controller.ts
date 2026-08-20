import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { toPublicUser } from '../common/utils/public-user';
import { AuthService, GoogleProfile } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('guest')
  @HttpCode(HttpStatus.CREATED)
  async guest() {
    const user = await this.authService.createGuest();
    const accessToken = this.authService.signToken(user);
    return { accessToken, user: toPublicUser(user) };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // GoogleAuthGuard redirects to Google's consent screen when configured,
    // or throws a 501 before this handler body ever runs.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as GoogleProfile;
    const user = await this.authService.upsertGoogleUser(profile);
    const accessToken = this.authService.signToken(user);
    const frontendOrigin = (this.config.get<string>('FRONTEND_ORIGIN') ?? '')
      .split(',')[0]
      ?.trim();
    res.redirect(`${frontendOrigin}/auth/callback?token=${accessToken}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return toPublicUser(user);
  }
}
