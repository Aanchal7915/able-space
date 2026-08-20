import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface GuestResponseBody {
  accessToken: string;
  user: { isGuest: boolean; [key: string]: unknown };
}

async function createGuest(
  app: INestApplication<App>,
): Promise<GuestResponseBody> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/guest')
    .expect(201);
  return res.body as GuestResponseBody;
}

describe('Task manager API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/auth/guest issues a token and never leaks passwordHash/googleId', async () => {
    const body = await createGuest(app);

    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.user.isGuest).toBe(true);
    expect(body.user).not.toHaveProperty('passwordHash');
    expect(body.user).not.toHaveProperty('googleId');
  });

  it('rejects unauthenticated requests to protected routes', () => {
    return request(app.getHttpServer()).get('/api/tasks').expect(401);
  });

  it('lets a guest fetch tasks/labels/projects with their token', async () => {
    const { accessToken } = await createGuest(app);

    await request(app.getHttpServer())
      .get('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/labels')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('excludes guest accounts from the assignable users list', async () => {
    const { accessToken } = await createGuest(app);

    const res = await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const users = res.body as { fullName: string }[];
    expect(users.some((u) => u.fullName.startsWith('Guest '))).toBe(false);
  });

  it('rejects a task with an unknown field (forbidNonWhitelisted)', async () => {
    const { accessToken } = await createGuest(app);

    return request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Valid title', notAField: 'nope' })
      .expect(400);
  });

  it('404s on a task id that does not exist', async () => {
    const { accessToken } = await createGuest(app);

    return request(app.getHttpServer())
      .get('/api/tasks/does-not-exist')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
