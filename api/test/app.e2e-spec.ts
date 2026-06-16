import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from '../src/app.config';
import { AppModule } from '../src/app.module';
import { BOOTH_CONFIG_ID } from '../src/booth/booth-config.constants';
import { PrismaService } from '../src/database/prisma.service';

type LoginResponseBody = {
  token: string;
  expiresIn: number;
};

type SessionResponseBody = {
  session: {
    id: string;
    phase: string;
    sceneId: string | null;
    eventId: string;
  };
};

describe('Cabine API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.session.deleteMany();
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

  it('seeds default event and singleton booth config on boot', async () => {
    const boothConfig = await prisma.boothConfig.findUnique({
      where: { id: BOOTH_CONFIG_ID },
      include: { activeEvent: true },
    });

    expect(boothConfig).not.toBeNull();
    expect(boothConfig?.activeThemeId).toBe('stub-a');
    expect(boothConfig?.activeEvent.name).toBe('Default Event');
    expect(boothConfig?.activeEventId).toBe(boothConfig?.activeEvent.id);
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

  it('POST /sessions/start creates scene_pick session for active event', async () => {
    const boothConfig = await prisma.boothConfig.findUniqueOrThrow({
      where: { id: BOOTH_CONFIG_ID },
    });

    const res = await request(app.getHttpServer())
      .post('/sessions/start')
      .expect(200);

    const body = res.body as SessionResponseBody;
    expect(body.session.phase).toBe('scene_pick');
    expect(body.session.sceneId).toBeNull();
    expect(body.session.eventId).toBe(boothConfig.activeEventId);
  });

  it('POST /sessions/current/scene moves to capture_ready', async () => {
    await request(app.getHttpServer()).post('/sessions/start').expect(200);

    const res = await request(app.getHttpServer())
      .post('/sessions/current/scene')
      .send({ sceneId: 'beach' })
      .expect(200);

    const body = res.body as SessionResponseBody;
    expect(body.session.phase).toBe('capture_ready');
    expect(body.session.sceneId).toBe('beach');
  });

  it('POST /sessions/current/scene returns 404 for unknown scene', async () => {
    await request(app.getHttpServer()).post('/sessions/start').expect(200);

    return request(app.getHttpServer())
      .post('/sessions/current/scene')
      .send({ sceneId: 'missing' })
      .expect(404);
  });

  it('POST /sessions/current/scene returns 404 when no session exists', () => {
    return request(app.getHttpServer())
      .post('/sessions/current/scene')
      .send({ sceneId: 'beach' })
      .expect(404);
  });

  it('POST /sessions/current/back returns to scene_pick', async () => {
    await request(app.getHttpServer()).post('/sessions/start').expect(200);
    await request(app.getHttpServer())
      .post('/sessions/current/scene')
      .send({ sceneId: 'beach' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .post('/sessions/current/back')
      .expect(200);

    const body = res.body as SessionResponseBody;
    expect(body.session.phase).toBe('scene_pick');
    expect(body.session.sceneId).toBeNull();
  });

  it('POST /sessions/start returns 409 when session already open', async () => {
    await request(app.getHttpServer()).post('/sessions/start').expect(200);

    return request(app.getHttpServer()).post('/sessions/start').expect(409);
  });

  it('POST /sessions/current/scene returns 409 when already capture_ready', async () => {
    await request(app.getHttpServer()).post('/sessions/start').expect(200);
    await request(app.getHttpServer())
      .post('/sessions/current/scene')
      .send({ sceneId: 'beach' })
      .expect(200);

    return request(app.getHttpServer())
      .post('/sessions/current/scene')
      .send({ sceneId: 'city' })
      .expect(409);
  });

  it('POST /sessions/current/back returns 409 when in scene_pick', async () => {
    await request(app.getHttpServer()).post('/sessions/start').expect(200);

    return request(app.getHttpServer()).post('/sessions/current/back').expect(409);
  });
});
