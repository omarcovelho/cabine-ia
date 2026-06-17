import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { SessionsService } from '../sessions/sessions.service';
import { ThemeService } from '../themes/theme.service';
import { BoothConfigService } from './booth-config.service';
import { BoothService } from './booth.service';

describe('BoothService', () => {
  let service: BoothService;

  const boothConfigService = {
    getBoothConfig: jest.fn(),
  };
  const sessionsService = {
    getOpenSession: jest.fn(),
  };
  const themeService = {
    loadPack: jest.fn(),
    toThemeSummary: jest.fn(),
    toGuestScenes: jest.fn(),
  };
  const prisma = {
    event: {
      findUniqueOrThrow: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoothService,
        { provide: PrismaService, useValue: prisma },
        { provide: BoothConfigService, useValue: boothConfigService },
        { provide: SessionsService, useValue: sessionsService },
        { provide: ThemeService, useValue: themeService },
      ],
    }).compile();

    service = module.get(BoothService);

    boothConfigService.getBoothConfig.mockResolvedValue({
      activeThemeId: 'stub-a',
      captureCountdownSeconds: 3,
      expectedFaceCount: 1,
      activeEvent: { id: 'event-1', name: 'Default Event' },
    });
    themeService.loadPack.mockReturnValue({
      id: 'stub-a',
      name: 'Festa Cartoon',
      scenes: [
        { id: 'beach', name: 'Praia' },
        { id: 'city', name: 'Cidade' },
      ],
    });
    themeService.toThemeSummary.mockReturnValue({
      id: 'stub-a',
      name: 'Festa Cartoon',
    });
    themeService.toGuestScenes.mockReturnValue([
      {
        id: 'beach',
        name: 'Praia',
        tagline: null,
        exampleUrl: '/themes/stub-a/scenes/beach/example',
      },
    ]);
    sessionsService.getOpenSession.mockResolvedValue(null);
  });

  it('returns attract snapshot with event and theme when idle', async () => {
    const snapshot = await service.getSnapshot();

    expect(snapshot.phase).toBe('attract');
    expect(snapshot.event).toEqual({ id: 'event-1', name: 'Default Event' });
    expect(snapshot.theme).toEqual({ id: 'stub-a', name: 'Festa Cartoon' });
    expect(snapshot.scenes).toEqual([]);
    expect(snapshot.config).toEqual({
      captureCountdownSeconds: 3,
      expectedFaceCount: 1,
    });
    expect(snapshot.session).toBeNull();
  });

  it('returns scene_pick snapshot with scenes when session is open', async () => {
    sessionsService.getOpenSession.mockResolvedValue({
      id: 'session-1',
      eventId: 'event-1',
      sceneId: null,
      phase: 'scene_pick',
    });
    prisma.event.findUniqueOrThrow.mockResolvedValue({
      id: 'event-1',
      name: 'Default Event',
    });

    const snapshot = await service.getSnapshot();

    expect(snapshot.phase).toBe('scene_pick');
    expect(snapshot.scenes).toHaveLength(1);
    expect(snapshot.session).toEqual({
      id: 'session-1',
      sceneId: null,
      sceneName: null,
    });
  });

  it('returns capture_ready snapshot with sceneName', async () => {
    sessionsService.getOpenSession.mockResolvedValue({
      id: 'session-1',
      eventId: 'event-1',
      sceneId: 'beach',
      phase: 'capture_ready',
    });
    prisma.event.findUniqueOrThrow.mockResolvedValue({
      id: 'event-1',
      name: 'Default Event',
    });

    const snapshot = await service.getSnapshot();

    expect(snapshot.phase).toBe('capture_ready');
    expect(snapshot.session).toEqual({
      id: 'session-1',
      sceneId: 'beach',
      sceneName: 'Praia',
    });
  });

  it('returns processing snapshot with sceneName and config', async () => {
    sessionsService.getOpenSession.mockResolvedValue({
      id: 'session-1',
      eventId: 'event-1',
      sceneId: 'beach',
      phase: 'processing',
    });
    prisma.event.findUniqueOrThrow.mockResolvedValue({
      id: 'event-1',
      name: 'Default Event',
    });

    const snapshot = await service.getSnapshot();

    expect(snapshot.phase).toBe('processing');
    expect(snapshot.scenes).toHaveLength(1);
    expect(snapshot.config).toEqual({
      captureCountdownSeconds: 3,
      expectedFaceCount: 1,
    });
    expect(snapshot.session).toEqual({
      id: 'session-1',
      sceneId: 'beach',
      sceneName: 'Praia',
    });
  });
});
