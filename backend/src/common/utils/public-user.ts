import type { User } from '@prisma/client';

export type PublicUser = Omit<User, 'passwordHash' | 'googleId'>;

/** Strips auth-internal fields before a full User row is ever serialized to a client. */
export function toPublicUser(user: User): PublicUser {
  const { passwordHash, googleId, ...publicUser } = user;
  return publicUser;
}
