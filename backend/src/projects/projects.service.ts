import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const LEAD_SELECT = {
  select: {
    id: true,
    fullName: true,
    avatarUrl: true,
    avatarColor: true,
  },
} as const;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const projects = await this.prisma.project.findMany({
      include: {
        lead: LEAD_SELECT,
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map(({ _count, ...project }) => ({
      ...project,
      taskCount: _count.tasks,
    }));
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        lead: LEAD_SELECT,
        owner: LEAD_SELECT,
        _count: { select: { tasks: true } },
      },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    const { _count, ...rest } = project;
    return { ...rest, taskCount: _count.tasks };
  }

  create(dto: CreateProjectDto, ownerId: string) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        leadId: dto.leadId,
        ownerId,
      },
      include: { lead: LEAD_SELECT },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.assertExists(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        priority: dto.priority,
        dueDate:
          dto.dueDate === undefined
            ? undefined
            : dto.dueDate
              ? new Date(dto.dueDate)
              : null,
        leadId: dto.leadId,
      },
      include: { lead: LEAD_SELECT },
    });
  }

  async remove(id: string) {
    await this.assertExists(id);
    await this.prisma.project.delete({ where: { id } });
  }

  private async assertExists(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
  }
}
