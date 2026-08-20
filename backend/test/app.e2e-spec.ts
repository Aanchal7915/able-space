import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Task manager API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/auth/guest issues a token and never leaks passwordHash/googleId', async () => {
    const res = await request(app.getHttpServer()).post('/api/auth/guest').expect(201);

    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user.isGuest).toBe(true);
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.body.user).not.toHaveProperty('googleId');
  });

  it('rejects unauthenticated requests to protected routes', () => {
    return request(app.getHttpServer()).get('/api/tasks').expect(401);
  });

  it('lets a guest fetch tasks/labels/projects with their token', async () => {
    const {
      body: { accessToken },
    } = await request(app.getHttpServer()).post('/api/auth/guest').expect(201);

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

  it('rejects a task with an unknown field (forbidNonWhitelisted)', async () => {
    const {
      body: { accessToken },
    } = await request(app.getHttpServer()).post('/api/auth/guest').expect(201);

    return request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Valid title', notAField: 'nope' })
      .expect(400);
  });

  it('404s on a task id that does not exist', async () => {
    const {
      body: { accessToken },
    } = await request(app.getHttpServer()).post('/api/auth/guest').expect(201);

    return request(app.getHttpServer())
      .get('/api/tasks/does-not-exist')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
