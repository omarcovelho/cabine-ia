import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBooth } from './boothClient';
import { mockBoothSnapshot } from '../test/fixtures/boothSnapshots';

describe('fetchBooth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses booth snapshot from API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBoothSnapshot),
      }),
    );

    const snapshot = await fetchBooth();
    expect(snapshot.phase).toBe('attract');
    expect(snapshot.theme.id).toBe('stub-a');
  });

  it('throws when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(fetchBooth()).rejects.toThrow('Failed to fetch booth: 500');
  });
});
