import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBooth } from './boothClient';

const mockSnapshot = {
  phase: 'attract' as const,
  theme: null,
  scenes: [],
  config: {},
  session: null,
};

describe('fetchBooth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses booth snapshot from API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSnapshot),
      }),
    );

    const snapshot = await fetchBooth();
    expect(snapshot.phase).toBe('attract');
  });

  it('throws when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(fetchBooth()).rejects.toThrow('Failed to fetch booth');
  });
});
