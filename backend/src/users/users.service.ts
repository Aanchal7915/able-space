import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicUser } from '../common/utils/public-user';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

const PUBLIC_USER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  avatarUrl: true,
  avatarColor: true,
  title: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Used to populate assignee/member/lead pickers. Deliberately excludes
   * guest accounts: every "Continue as Guest" click creates a new User row,
   * and without this filter each guest session would permanently appear as
   * an assignable "team member" to everyone else, forever, growing without
   * bound. Only the seeded/registered (non-guest) roster is assignable.
   */
  findAll() {
    return this.prisma.user.findMany({
      where: { isGuest: false },
      select: PUBLIC_USER_SELECT,
      orderBy: { fullName: 'asc' },
    });
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    await this.assertExists(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return toPublicUser(user);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    await this.assertExists(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return toPublicUser(user);
  }

  /**
   * "Leave workspace" for this assessment: fully delete the user.
   *
   * Cascade behavior (see prisma/schema.prisma):
   * - Tasks and Projects OWNED by this user are explicitly deleted first
   *   (in a transaction). Deleting an owned Task cascades to its subtasks,
   *   TaskMember/TaskLabel rows, comments, and resources (onDelete: Cascade
   *   on taskId in the schema). Deleting an owned Project does NOT delete
   *   tasks under it that this user doesn't own — their `projectId` is set
   *   to null instead (see next point).
   * - Every other reference to this user (Task.assigneeId, Task.reporterId,
   *   Project.leadId, Comment.authorId) is defined with `onDelete: SetNull`
   *   in the schema, so deleting the User row itself automatically nulls
   *   those out rather than deleting the referencing rows.
   * - TaskMember rows (this user as a member of someone else's task) use
   *   `onDelete: Cascade` on userId, so they're simply removed.
   */
  async deleteMe(userId: string): Promise<void> {
    await this.assertExists(userId);
    await this.prisma.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { ownerId: userId } });
      await tx.project.deleteMany({ where: { ownerId: userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  }

  private async assertExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
