import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.label.findMany({ orderBy: { name: 'asc' } });
  }
}
