import { afterEach, describe, expect, it, vi } from 'vitest';
import { goBack, selectScene, startSession } from './sessionClient';

describe('sessionClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('startSession posts to /api/sessions/start', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          session: {
            id: 's1',
            phase: 'scene_pick',
            sceneId: null,
            eventId: 'e1',
          },
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const session = await startSession();

    expect(fetchMock).toHaveBeenCalledWith('/api/sessions/start', { method: 'POST' });
    expect(session.phase).toBe('scene_pick');
  });

  it('selectScene posts sceneId', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          session: {
            id: 's1',
            phase: 'capture_ready',
            sceneId: 'beach',
            eventId: 'e1',
          },
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const session = await selectScene('beach');

    expect(fetchMock).toHaveBeenCalledWith('/api/sessions/current/scene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sceneId: 'beach' }),
    });
    expect(session.sceneId).toBe('beach');
  });

  it('goBack posts to /api/sessions/current/back', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          session: {
            id: 's1',
            phase: 'scene_pick',
            sceneId: null,
            eventId: 'e1',
          },
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const session = await goBack();

    expect(fetchMock).toHaveBeenCalledWith('/api/sessions/current/back', {
      method: 'POST',
    });
    expect(session.phase).toBe('scene_pick');
  });
});
