import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchBooth } from '../api/boothClient';
import type { BoothSnapshot } from '../types/booth';
import { useBoothPolling } from './useBoothPolling';

const mockSnapshot = {
  phase: 'attract',
  event: { id: 'event-1', name: 'Default Event' },
  theme: { id: 'stub-a', name: 'Festa Cartoon' },
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
    vi.useRealTimers();
  });

  it('loads snapshot on mount', async () => {
    const { result } = renderHook(() => useBoothPolling());

    await waitFor(() => {
      expect(result.current.snapshot).toEqual(mockSnapshot);
    });
    expect(fetchBooth).toHaveBeenCalledTimes(1);
  });

  it('does not surface error on initial fetch failure while retrying', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchBooth)
      .mockRejectedValueOnce(new Error('Failed to fetch booth: 502'))
      .mockResolvedValue(mockSnapshot);

    const { result, unmount } = renderHook(() => useBoothPolling());

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.snapshot).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(result.current.snapshot).toEqual(mockSnapshot);
    expect(result.current.error).toBeNull();
    unmount();
  });

  it('surfaces error after a successful load when polling fails', async () => {
    vi.mocked(fetchBooth)
      .mockResolvedValueOnce(mockSnapshot)
      .mockRejectedValueOnce(new Error('Failed to fetch booth: 502'));

    const { result } = renderHook(() => useBoothPolling());

    await waitFor(() => {
      expect(result.current.snapshot).toEqual(mockSnapshot);
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe('Failed to fetch booth: 502');
    });
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
  });
});
