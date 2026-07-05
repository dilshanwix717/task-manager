import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;

  const stamp = Date.now();
  let aliceToken: string;
  let bobToken: string;
  let adminToken: string;
  let aliceId: string;
  let taskId: string;

  const registerUser = async (name: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        userName: `${name}_${stamp}`,
        email: `${name}_${stamp}@example.com`,
        password: 'strong#password1',
      })
      .expect(201);

    return response.body.access_token as string;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    //mirror the global pipe configured in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        transformOptions: { enableImplicitConversion: false },
      }),
    );

    await app.init();

    aliceToken = await registerUser('e2e_alice');
    bobToken = await registerUser('e2e_bob');

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@tasktracker.dev', password: 'admin123' })
      .expect(200);
    adminToken = adminLogin.body.access_token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated access with 401', () => {
    return request(app.getHttpServer())
      .get('/tasks?page=1&limit=10')
      .expect(401);
  });

  it('creates a task owned by the current user', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Ship the assignment',
        description: 'end to end flow',
        dueDate: '2026-08-30T00:00:00.000Z',
      })
      .expect(201);

    expect(response.body.status).toBe('TODO');
    expect(response.body.owner.userName).toBe(`e2e_alice_${stamp}`);

    taskId = response.body.id;
    aliceId = response.body.owner.id;
  });

  it('rejects a task without a title with 400', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ dueDate: '2026-08-30T00:00:00.000Z' })
      .expect(400);
  });

  it('lists only the tasks owned by the requesting user', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks?page=1&limit=10')
      .set('Authorization', `Bearer ${bobToken}`)
      .expect(200);

    expect(response.body.count).toBe(0);
    expect(response.body.results).toEqual([]);
  });

  it('filters tasks by status', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks?page=1&limit=10&status=DONE')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    expect(response.body.count).toBe(0);
  });

  it('blocks a user from reading a task they do not own with 403', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .expect(403);
  });

  it('blocks a user from filtering by another owner with 403', () => {
    return request(app.getHttpServer())
      .get(`/tasks?page=1&limit=10&ownerId=${aliceId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .expect(403);
  });

  it('lets an admin read any task', async () => {
    const response = await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.id).toBe(taskId);
  });

  it('lets an admin filter tasks by owner', async () => {
    const response = await request(app.getHttpServer())
      .get(`/tasks?page=1&limit=10&ownerId=${aliceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.count).toBe(1);
    expect(response.body.results[0].owner.id).toBe(aliceId);
  });

  it('updates a task partially', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    expect(response.body.status).toBe('IN_PROGRESS');
    expect(response.body.title).toBe('Ship the assignment');
  });

  it('returns the status summary scoped to the current user', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks/summary')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);

    //alice owns exactly one task in this suite, moved to IN_PROGRESS above
    expect(response.body).toEqual({
      todo: 0,
      inProgress: 1,
      done: 0,
      total: 1,
    });
  });

  it('rejects an invalid status value with 400', () => {
    return request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ status: 'NOT_A_STATUS' })
      .expect(400);
  });

  it('blocks a non-owner from updating with 403', () => {
    return request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ title: 'hijacked' })
      .expect(403);
  });

  it('returns 404 for a missing task', () => {
    return request(app.getHttpServer())
      .get('/tasks/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('returns 400 for a malformed task id', () => {
    return request(app.getHttpServer())
      .get('/tasks/not-a-uuid')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(400);
  });

  it('hides the users list from regular users with 403', () => {
    return request(app.getHttpServer())
      .get('/users?page=1&limit=10')
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(403);
  });

  it('lists users for an admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/users?page=1&limit=50')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.count).toBeGreaterThan(0);
    const userNames = response.body.results.map((u) => u.userName as string);
    expect(userNames).toContain(`e2e_alice_${stamp}`);
  });

  it('deletes an owned task with 204 and then returns 404', async () => {
    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(404);
  });
});
