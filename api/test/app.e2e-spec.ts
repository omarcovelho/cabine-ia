import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from '../src/app.config';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

type LoginResponseBody = {
  token: string;
  expiresIn: number;
};

describe('Cabine API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('boots the application', () => {
    expect(app).toBeDefined();
  });

  it('GET /health returns ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('GET /booth returns attract snapshot', () => {
    return request(app.getHttpServer()).get('/booth').expect(200).expect({
      phase: 'attract',
      theme: null,
      scenes: [],
      config: {},
      session: null,
    });
  });

  it('allows CORS from kiosk dev origin', async () => {
    const res = await request(app.getHttpServer())
      .get('/booth')
      .set('Origin', 'http://localhost:5173')
      .expect(200);

    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
  });

  it('POST /operator/login returns token for valid pin', async () => {
    const res = await request(app.getHttpServer())
      .post('/operator/login')
      .send({ pin: '1234' })
      .expect(200);

    const body = res.body as LoginResponseBody;
    expect(body.expiresIn).toBe(86400);
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  it('POST /operator/login returns 401 for invalid pin', () => {
    return request(app.getHttpServer())
      .post('/operator/login')
      .send({ pin: 'wrong' })
      .expect(401);
  });

  it('GET /operator/themes returns 401 without token', () => {
    return request(app.getHttpServer()).get('/operator/themes').expect(401);
  });

  it('GET /operator/themes returns empty list with valid token', async () => {
    const login = await request(app.getHttpServer())
      .post('/operator/login')
      .send({ pin: '1234' })
      .expect(200);

    const { token } = login.body as LoginResponseBody;

    return request(app.getHttpServer())
      .get('/operator/themes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ themes: [] });
  });

  it('seeds default event on boot', async () => {
    const prisma = app.get(PrismaService);
    const events = await prisma.event.findMany({
      include: { boothConfig: true },
    });

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0]?.boothConfig?.activeThemeId).toBe('stub-a');
  });

  it('GET /themes/:themeId/scenes/:sceneId/example returns png', async () => {
    const res = await request(app.getHttpServer())
      .get('/themes/stub-a/scenes/beach/example')
      .expect(200);

    expect(res.headers['content-type']).toMatch(/image\/png/);
    expect((res.body as Buffer).length).toBeGreaterThan(0);
  });

  it('GET /themes/:themeId/scenes/:sceneId/example returns 404 for missing scene', () => {
    return request(app.getHttpServer())
      .get('/themes/stub-a/scenes/missing/example')
      .expect(404);
  });
});
