import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from '../src/app.config';
import { AppModule } from '../src/app.module';
import { BOOTH_CONFIG_ID } from '../src/booth/booth-config.constants';
import { PrismaService } from '../src/database/prisma.service';

const cropFixturePath = join(__dirname, 'fixtures', 'crop-fixture.jpg');

async function goToCaptureReady(app: INestApplication<App>): Promise<void> {
  await request(app.getHttpServer()).post('/sessions/start').expect(200);
  await request(app.getHttpServer())
    .post('/sessions/current/scene')
    .send({ sceneId: 'beach' })
    .expect(200);
}

async function submitCaptureFixture(
  app: INestApplication<App>,
  cropCount = 1,
): Promise<SessionResponseBody> {
  const req = request(app.getHttpServer()).post('/sessions/current/capture');
  for (let index = 0; index < cropCount; index += 1) {
    req.attach('crops', cropFixturePath, {
      filename: `crop-${index + 1}.jpg`,
    });
  }
  const res = await req.expect(200);
  return res.body as SessionResponseBody;
}

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

type BoothResponseBody = {
  phase: string;
  event: { id: string; name: string };
  theme: { id: string; name: string };
  scenes: Array<{ id: string; exampleUrl: string; name?: string }>;
  config: {
    captureCountdownSeconds: number;
    expectedFaceCount: number;
  };
  session: {
    id: string;
    sceneId: string | null;
    sceneName: string | null;
  } | null;
};

type ThemesResponseBody = {
  themes: Array<{ id: string; name: string }>;
};

type EventsResponseBody = {
  events: Array<{ id: string; name: string; isActive: boolean }>;
};

type EventResponseBody = {
  event: { id: string; name: string; isActive: boolean };
};

async function loginAsOperator(app: INestApplication<App>): Promise<string> {
  const login = await request(app.getHttpServer())
    .post('/operator/login')
    .send({ pin: '1234' })
    .expect(200);

  return (login.body as LoginResponseBody).token;
}

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

    const defaultEvent = await prisma.event.findFirst({
      where: { name: 'Default Event' },
    });
    if (defaultEvent) {
      await prisma.boothConfig.update({
        where: { id: BOOTH_CONFIG_ID },
        data: {
          activeThemeId: 'stub-a',
          activeEventId: defaultEvent.id,
        },
      });
    }
  });

  afterEach(async () => {
    const tmpRoot = join(process.cwd(), 'data', 'tmp');
    if (existsSync(tmpRoot)) {
      await rm(tmpRoot, { recursive: true, force: true });
    }
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

  it('GET /booth returns attract snapshot with event and theme', async () => {
    const res = await request(app.getHttpServer()).get('/booth').expect(200);
    const body = res.body as BoothResponseBody;

    expect(body).toMatchObject({
      phase: 'attract',
      theme: { id: 'stub-a', name: 'Festa Cartoon' },
      scenes: [],
      config: { captureCountdownSeconds: 3, expectedFaceCount: 1 },
      session: null,
    });
    expect(body.event).toMatchObject({ name: 'Default Event' });
    expect(body.event.id).toEqual(expect.any(String));
    expect(body).not.toHaveProperty('prompt');
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

  it('GET /operator/themes returns installed packs without prompts', async () => {
    const token = await loginAsOperator(app);

    const res = await request(app.getHttpServer())
      .get('/operator/themes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const body = res.body as ThemesResponseBody;

    expect(body.themes).toEqual(
      expect.arrayContaining([
        { id: 'stub-a', name: 'Festa Cartoon' },
        { id: 'stub-b', name: 'Aventura Épica' },
      ]),
    );
    for (const theme of body.themes) {
      expect(theme).not.toHaveProperty('prompt');
    }
  });

  it('GET /operator/events returns seeded event as active', async () => {
    const token = await loginAsOperator(app);
    const boothConfig = await prisma.boothConfig.findUniqueOrThrow({
      where: { id: BOOTH_CONFIG_ID },
    });

    const res = await request(app.getHttpServer())
      .get('/operator/events')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const body = res.body as EventsResponseBody;

    expect(body.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: boothConfig.activeEventId,
          name: 'Default Event',
          isActive: true,
        }),
      ]),
    );
  });

  it('POST /operator/events creates event without changing active event', async () => {
    const token = await loginAsOperator(app);
    const before = await prisma.boothConfig.findUniqueOrThrow({
      where: { id: BOOTH_CONFIG_ID },
    });

    const res = await request(app.getHttpServer())
      .post('/operator/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Festa da Ana' })
      .expect(200);
    const body = res.body as EventResponseBody;

    expect(body.event).toMatchObject({
      name: 'Festa da Ana',
      isActive: false,
    });

    const after = await prisma.boothConfig.findUniqueOrThrow({
      where: { id: BOOTH_CONFIG_ID },
    });
    expect(after.activeEventId).toBe(before.activeEventId);
  });

  it('POST /operator/events/:id/activate updates active event', async () => {
    const token = await loginAsOperator(app);

    const created = await request(app.getHttpServer())
      .post('/operator/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Festa da Ana' })
      .expect(200);
    const createdBody = created.body as EventResponseBody;

    await request(app.getHttpServer())
      .post(`/operator/events/${createdBody.event.id}/activate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const boothConfig = await prisma.boothConfig.findUniqueOrThrow({
      where: { id: BOOTH_CONFIG_ID },
    });
    expect(boothConfig.activeEventId).toBe(createdBody.event.id);
  });

  it('POST /operator/events/:id/activate returns 409 when session is open', async () => {
    const token = await loginAsOperator(app);
    await request(app.getHttpServer()).post('/sessions/start').expect(200);

    const created = await request(app.getHttpServer())
      .post('/operator/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Festa da Ana' })
      .expect(200);
    const createdBody = created.body as EventResponseBody;

    return request(app.getHttpServer())
      .post(`/operator/events/${createdBody.event.id}/activate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);
  });

  it('POST /operator/theme updates active theme on idle booth', async () => {
    const token = await loginAsOperator(app);

    await request(app.getHttpServer())
      .post('/operator/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ themeId: 'stub-b' })
      .expect(200)
      .expect({ theme: { id: 'stub-b', name: 'Aventura Épica' } });

    const booth = await request(app.getHttpServer()).get('/booth').expect(200);
    const boothBody = booth.body as BoothResponseBody;
    expect(boothBody.theme).toEqual({
      id: 'stub-b',
      name: 'Aventura Épica',
    });
  });

  it('POST /operator/theme returns 409 when session is open', async () => {
    const token = await loginAsOperator(app);
    await request(app.getHttpServer()).post('/sessions/start').expect(200);

    return request(app.getHttpServer())
      .post('/operator/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ themeId: 'stub-b' })
      .expect(409);
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

  it('GET /themes/:themeId/scenes/:sceneId/example returns 404 for invalid ids', () => {
    return request(app.getHttpServer())
      .get('/themes/stub-a/scenes/../etc/example')
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

  it('GET /booth returns scene_pick with scenes after session start', async () => {
    await request(app.getHttpServer()).post('/sessions/start').expect(200);

    const res = await request(app.getHttpServer()).get('/booth').expect(200);
    const body = res.body as BoothResponseBody;

    expect(body.phase).toBe('scene_pick');
    expect(body.scenes).toHaveLength(3);
    expect(body.session).toMatchObject({
      sceneId: null,
      sceneName: null,
    });
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

  it('GET /booth returns capture_ready with sceneName after scene select', async () => {
    await request(app.getHttpServer()).post('/sessions/start').expect(200);
    await request(app.getHttpServer())
      .post('/sessions/current/scene')
      .send({ sceneId: 'beach' })
      .expect(200);

    const res = await request(app.getHttpServer()).get('/booth').expect(200);
    const body = res.body as BoothResponseBody;

    expect(body.phase).toBe('capture_ready');
    expect(body.session).toMatchObject({
      sceneId: 'beach',
      sceneName: 'Praia',
    });
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

    return request(app.getHttpServer())
      .post('/sessions/current/back')
      .expect(409);
  });

  it('operator theme switch and guest scene pick flow', async () => {
    const token = await loginAsOperator(app);

    await request(app.getHttpServer())
      .post('/operator/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ themeId: 'stub-b' })
      .expect(200);

    await request(app.getHttpServer()).post('/sessions/start').expect(200);

    const scenePick = await request(app.getHttpServer())
      .get('/booth')
      .expect(200);
    const scenePickBody = scenePick.body as BoothResponseBody;
    expect(scenePickBody.phase).toBe('scene_pick');
    expect(scenePickBody.theme.id).toBe('stub-b');
    expect(scenePickBody.scenes).toHaveLength(3);
    expect(scenePickBody.scenes[0]).toMatchObject({
      id: 'castle',
      exampleUrl: '/themes/stub-b/scenes/castle/example',
    });

    await request(app.getHttpServer())
      .post('/sessions/current/scene')
      .send({ sceneId: 'castle' })
      .expect(200);

    const captureReady = await request(app.getHttpServer())
      .get('/booth')
      .expect(200);
    const captureReadyBody = captureReady.body as BoothResponseBody;
    expect(captureReadyBody.phase).toBe('capture_ready');
    expect(captureReadyBody.session).toMatchObject({
      sceneId: 'castle',
      sceneName: 'Castelo',
    });
  });

  it('POST /sessions/current/capture moves to processing and saves crops', async () => {
    await goToCaptureReady(app);

    const body = await submitCaptureFixture(app, 2);

    expect(body.session.phase).toBe('processing');
    expect(body.session.sceneId).toBe('beach');

    const sessionDir = join(process.cwd(), 'data', 'tmp', body.session.id);
    const files = await readdir(sessionDir);
    expect(files).toEqual(['crop-1.jpg', 'crop-2.jpg']);
  });

  it('POST /sessions/current/capture returns 400 for zero crops', async () => {
    await goToCaptureReady(app);

    return request(app.getHttpServer())
      .post('/sessions/current/capture')
      .expect(400);
  });

  it('POST /sessions/current/capture returns 400 for more than four crops', async () => {
    await goToCaptureReady(app);

    const req = request(app.getHttpServer()).post('/sessions/current/capture');
    for (let index = 0; index < 5; index += 1) {
      req.attach('crops', cropFixturePath, {
        filename: `crop-${index + 1}.jpg`,
      });
    }

    return req.expect(400);
  });

  it('POST /sessions/current/capture returns 409 from scene_pick', async () => {
    await request(app.getHttpServer()).post('/sessions/start').expect(200);

    const req = request(app.getHttpServer()).post('/sessions/current/capture');
    req.attach('crops', cropFixturePath, { filename: 'crop-1.jpg' });

    return req.expect(409);
  });

  it('POST /sessions/current/capture returns 404 when no session exists', () => {
    const req = request(app.getHttpServer()).post('/sessions/current/capture');
    req.attach('crops', cropFixturePath, { filename: 'crop-1.jpg' });

    return req.expect(404);
  });

  it('guest flow chain: scene pick → capture → processing booth snapshot', async () => {
    await goToCaptureReady(app);

    const captureBody = await submitCaptureFixture(app);
    expect(captureBody.session.phase).toBe('processing');

    const booth = await request(app.getHttpServer()).get('/booth').expect(200);
    const boothBody = booth.body as BoothResponseBody;

    expect(boothBody.phase).toBe('processing');
    expect(boothBody.session).toMatchObject({
      id: captureBody.session.id,
      sceneId: 'beach',
      sceneName: 'Praia',
    });
    expect(boothBody.config).toEqual({
      captureCountdownSeconds: 3,
      expectedFaceCount: 1,
    });

    const sessionDir = join(
      process.cwd(),
      'data',
      'tmp',
      captureBody.session.id,
    );
    const files = await readdir(sessionDir);
    expect(files).toEqual(['crop-1.jpg']);
  });
});
