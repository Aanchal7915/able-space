// Shared string-union "enums" used across DTOs (validated via @IsIn) and
// Prisma string columns. Kept as plain string unions (rather than Prisma
// `enum`) so SQLite (which has no native enum type) can store them directly.

export const TASK_STATUSES = ['todo', 'doing', 'completed', 'on_hold'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PRIORITIES = ['no_priority', 'urgent', 'high', 'medium', 'low'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const COLOR_MODES = ['amber', 'blue', 'pink', 'rose', 'emerald', 'black'] as const;
export type ColorMode = (typeof COLOR_MODES)[number];
