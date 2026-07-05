import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const stamp = Date.now();

  const registration = {
    userName: `e2e_auth_${stamp}`,
    email: `e2e_auth_${stamp}@example.com`,
    password: 'strong#password1',
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a new user and returns an access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registration)
      .expect(201);

    expect(response.body.access_token).toBeDefined();
  });

  it('rejects a duplicate email with 409', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...registration, userName: `other_${stamp}` })
      .expect(409);
  });

  it('rejects an invalid email with 400', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...registration, email: 'not-an-email' })
      .expect(400);
  });

  it('rejects a short password with 400', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        userName: `short_${stamp}`,
        email: `short_${stamp}@example.com`,
        password: 'short',
      })
      .expect(400);
  });

  it('logs a registered user in with 200 and a token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registration.email, password: registration.password })
      .expect(200);

    expect(response.body.access_token).toBeDefined();
  });

  it('rejects a wrong password with 401', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: registration.email, password: 'wrong-password' })
      .expect(401);
  });
});
