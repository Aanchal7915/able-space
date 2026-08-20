import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface GoogleProfile {
  googleId: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  signToken(user: User): string {
    return this.jwt.sign({ sub: user.id });
  }

  async createGuest(): Promise<User> {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return this.prisma.user.create({
      data: {
        fullName: `Guest ${suffix}`,
        isGuest: true,
        theme: 'light',
        colorMode: 'blue',
      },
    });
  }

  async upsertGoogleUser(profile: GoogleProfile): Promise<User> {
    const existingByGoogleId = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });
    if (existingByGoogleId) {
      return this.prisma.user.update({
        where: { id: existingByGoogleId.id },
        data: {
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl ?? existingByGoogleId.avatarUrl,
        },
      });
    }

    if (profile.email) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });
      if (existingByEmail) {
        return this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: profile.googleId,
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl ?? existingByEmail.avatarUrl,
            isGuest: false,
          },
        });
      }
    }

    return this.prisma.user.create({
      data: {
        googleId: profile.googleId,
        email: profile.email,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        isGuest: false,
      },
    });
  }
}
