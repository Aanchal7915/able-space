import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const USER_SUMMARY_SELECT = {
  select: {
    id: true,
    fullName: true,
    username: true,
    avatarUrl: true,
    avatarColor: true,
    title: true,
  },
} as const;

const LIST_INCLUDE = {
  assignee: USER_SUMMARY_SELECT,
  members: { include: { user: USER_SUMMARY_SELECT } },
  labels: { include: { label: true } },
  project: { select: { id: true, name: true } },
  _count: { select: { subtasks: true } },
} satisfies Prisma.TaskInclude;

const DETAIL_INCLUDE = {
  assignee: USER_SUMMARY_SELECT,
  reporter: USER_SUMMARY_SELECT,
  owner: USER_SUMMARY_SELECT,
  members: { include: { user: USER_SUMMARY_SELECT } },
  labels: { include: { label: true } },
  resources: { orderBy: { createdAt: 'asc' } },
  project: { select: { id: true, name: true } },
  subtasks: {
    include: {
      assignee: USER_SUMMARY_SELECT,
      labels: { include: { label: true } },
      _count: { select: { subtasks: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
  comments: {
    include: { author: USER_SUMMARY_SELECT },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.TaskInclude;

// Flattens the `members: TaskMember[]` / `labels: TaskLabel[]` join-table
// shapes Prisma returns into plain `members: User[]` / `labels: Label[]`
// arrays, and (when the `_count` relation-count was included) exposes it as
// a flat `subtaskCount` number. Accepts any task-like include shape.
function flattenTask(task: Record<string, any>) {
  const { members, labels, _count, ...rest } = task;
  return {
    ...rest,
    ...(members ? { members: members.map((m: any) => m.user) } : {}),
    ...(labels ? { labels: labels.map((l: any) => l.label) } : {}),
    ...(_count ? { subtaskCount: _count.subtasks } : {}),
  };
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryTasksDto) {
    const where: Prisma.TaskWhereInput = {};

    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.title = { contains: query.search };
    }
    if (query.parentTaskId === undefined) {
      // Default: only top-level tasks so subtasks don't duplicate on the board.
      where.parentTaskId = null;
    } else if (query.parentTaskId === 'null') {
      where.parentTaskId = null;
    } else {
      where.parentTaskId = query.parentTaskId;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: LIST_INCLUDE,
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks.map(flattenTask);
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: DETAIL_INCLUDE });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    const { subtasks, ...rest } = task;
    return {
      ...flattenTask(rest),
      subtasks: subtasks.map((s) => flattenTask(s)),
    };
  }

  async create(dto: CreateTaskDto, ownerId: string) {
    if (dto.parentTaskId) {
      await this.assertExists(dto.parentTaskId);
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        order: dto.order ?? 0,
        projectId: dto.projectId,
        parentTaskId: dto.parentTaskId,
        assigneeId: dto.assigneeId,
        reporterId: dto.reporterId ?? ownerId,
        ownerId,
        members: dto.memberIds ? { create: dto.memberIds.map((userId) => ({ userId })) } : undefined,
        labels: dto.labelIds ? { create: dto.labelIds.map((labelId) => ({ labelId })) } : undefined,
      },
      include: LIST_INCLUDE,
    });
    return flattenTask(task);
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.assertExists(id);

    if (dto.memberIds) {
      await this.prisma.taskMember.deleteMany({ where: { taskId: id } });
    }
    if (dto.labelIds) {
      await this.prisma.taskLabel.deleteMany({ where: { taskId: id } });
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate === undefined ? undefined : dto.dueDate ? new Date(dto.dueDate) : null,
        order: dto.order,
        projectId: dto.projectId,
        parentTaskId: dto.parentTaskId,
        assigneeId: dto.assigneeId,
        reporterId: dto.reporterId,
        members: dto.memberIds ? { create: dto.memberIds.map((userId) => ({ userId })) } : undefined,
        labels: dto.labelIds ? { create: dto.labelIds.map((labelId) => ({ labelId })) } : undefined,
      },
      include: LIST_INCLUDE,
    });
    return flattenTask(task);
  }

  async remove(id: string) {
    await this.assertExists(id);
    await this.prisma.task.delete({ where: { id } });
  }

  async createSubtask(parentTaskId: string, dto: CreateSubtaskDto, ownerId: string) {
    const parent = await this.assertExists(parentTaskId);
    const subtask = await this.prisma.task.create({
      data: {
        title: dto.title,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        parentTaskId,
        projectId: parent.projectId,
        ownerId,
        reporterId: ownerId,
      },
      include: LIST_INCLUDE,
    });
    return flattenTask(subtask);
  }

  async getComments(taskId: string) {
    await this.assertExists(taskId);
    return this.prisma.comment.findMany({
      where: { taskId },
      include: { author: USER_SUMMARY_SELECT },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(taskId: string, dto: CreateCommentDto, authorId: string) {
    await this.assertExists(taskId);
    return this.prisma.comment.create({
      data: { taskId, authorId, body: dto.body },
      include: { author: USER_SUMMARY_SELECT },
    });
  }

  async addResource(taskId: string, dto: CreateResourceDto) {
    await this.assertExists(taskId);
    return this.prisma.resource.create({
      data: { taskId, label: dto.label, url: dto.url },
    });
  }

  private async assertExists(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }
}
