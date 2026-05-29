import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchBooth } from '../api/boothClient';
import type { BoothSnapshot } from '../types/booth';
import { useBoothPolling } from './useBoothPolling';

const mockSnapshot = {
  phase: 'attract',
  theme: null,
  scenes: [],
  config: {},
  session: null,
} satisfies BoothSnapshot;

vi.mock('../api/boothClient', () => ({
  fetchBooth: vi.fn(),
}));

describe('useBoothPolling', () => {
  beforeEach(() => {
    vi.mocked(fetchBooth).mockResolvedValue(mockSnapshot);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads snapshot on mount', async () => {
    const { result } = renderHook(() => useBoothPolling());

    await waitFor(() => {
      expect(result.current.snapshot).toEqual(mockSnapshot);
    });
    expect(fetchBooth).toHaveBeenCalledTimes(1);
  });

  it('polls every 1000ms', async () => {
    vi.useFakeTimers();

    const { unmount } = renderHook(() => useBoothPolling());

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchBooth).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(fetchBooth).toHaveBeenCalledTimes(2);
    unmount();
    vi.useRealTimers();
  });
});
