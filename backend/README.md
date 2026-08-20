# Ablespace Task Manager — Backend

A NestJS + Prisma (SQLite) REST API for a Linear/ClickUp-style task management app.
Built for a technical assessment: everything needed to run it is included, and it
runs with zero external database setup.

## Tech stack

- **NestJS** (TypeScript) — modular controller/service/DTO architecture
- **Prisma ORM** on **SQLite** (`prisma/dev.db`) — no external DB needed locally;
  swap `provider = "sqlite"` for `"postgresql"` in `prisma/schema.prisma` (and
  point `DATABASE_URL` at a Postgres instance) to run this in production on
  Render/Fly/etc. without touching application code
- `class-validator` / `class-transformer` — every request body/query is validated
  by a global `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`
- `@nestjs/jwt` + `passport-jwt` — stateless JWT auth, returned in the response
  body (not a cookie) so the frontend and backend can live on different
  domains/origins (e.g. Vercel + Render) without cross-site cookie issues
- `@nestjs/swagger` — interactive API docs at `/api/docs`

## Getting started

```bash
cd backend
npm install
cp .env.example .env        # already has working SQLite + dummy JWT secret defaults
npx prisma migrate dev      # creates prisma/dev.db and applies the schema
npm run seed                # seeds demo users, projects, tasks, labels
npm run start:dev           # http://localhost:4000/api
```

Swagger UI: `http://localhost:4000/api/docs`

### Environment variables

See `.env.example` for the full list with comments. The important ones:

| Var | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (`file:./dev.db`) or a Postgres URL |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Signs access tokens (default 7-day expiry) |
| `FRONTEND_ORIGIN` | Comma-separated list of allowed CORS origins |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Optional. If unset, the app still boots cleanly and `/api/auth/google*` respond `501` instead of crashing |

### Useful scripts

```bash
npm run start:dev       # dev server with hot reload
npm run build            # tsc build to dist/ (used for start:prod)
npm run start:prod       # run the compiled build
npm run seed              # re-run prisma/seed.ts (upserts on top of migrate reset if you want a clean slate: `npx prisma migrate reset`)
npm run lint
npm run test / test:e2e
```

## Domain model

`User`, `Project`, `Task` (self-referential for subtasks via `parentTaskId`),
`TaskMember` (many-to-many task↔user "members" avatar stack, separate from the
single `assigneeId`), `Label` / `TaskLabel`, `Comment`, `Resource`. Full schema
in `prisma/schema.prisma`.

## API overview

All routes are prefixed with `/api`. Routes marked 🔒 require
`Authorization: Bearer <token>`.

### Auth
- `POST /api/auth/guest` — create a guest user, returns `{ accessToken, user }`
- `GET /api/auth/google` — redirect to Google consent screen (501 if not configured)
- `GET /api/auth/google/callback` — completes Google login, redirects to `${FRONTEND_ORIGIN}/auth/callback?token=...`
- 🔒 `GET /api/auth/me` — current user

### Users
- 🔒 `GET /api/users` — list users (for assignee/member pickers)
- 🔒 `PATCH /api/users/me` — update profile fields
- 🔒 `PATCH /api/users/me/preferences` — update `theme` / `colorMode`
- 🔒 `DELETE /api/users/me` — delete account (cascades owned tasks/projects, nulls other references — see comment in `src/users/users.service.ts`)

### Projects (all 🔒)
- `GET /api/projects` — list with lead + task count
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

### Tasks (all 🔒)
- `GET /api/tasks?projectId=&status=&parentTaskId=&search=` — top-level tasks by default (subtasks excluded unless `parentTaskId` is passed)
- `POST /api/tasks`
- `GET /api/tasks/:id` — full detail incl. subtasks, comments, resources, labels, members
- `PATCH /api/tasks/:id` — partial update, including `{ status, order }` for kanban drag-and-drop
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/subtasks`
- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`
- `POST /api/tasks/:id/resources`

### Labels
- 🔒 `GET /api/labels`

## Project structure

```
src/
  auth/           guest + Google OAuth login, JWT issuing
  users/           profile, preferences, account deletion
  projects/
  tasks/           tasks, subtasks, comments, resources
  labels/
  prisma/          PrismaService (onModuleInit/onModuleDestroy wrapper)
  common/          JwtAuthGuard, @CurrentUser(), shared enums/types
prisma/
  schema.prisma
  seed.ts
  migrations/
```
