import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { TASK_STATUSES } from '../../common/types/enums';
import type { TaskStatus } from '../../common/types/enums';

export class QueryTasksDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: TASK_STATUSES })
  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: TaskStatus;

  // Pass the literal string "null" to explicitly fetch top-level tasks only
  // (the default behavior when this param is omitted), or a real task id to
  // fetch its direct subtasks.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentTaskId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
