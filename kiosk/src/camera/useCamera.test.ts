import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCamera } from './useCamera';

describe('useCamera', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts a media stream from getUserMedia', async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }],
    } as unknown as MediaStream;

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });

    const { result } = renderHook(() => useCamera());

    await result.current.start();

    await waitFor(() => {
      expect(result.current.stream).toBe(mockStream);
      expect(result.current.error).toBeNull();
    });
  });

  it('stores an error when getUserMedia fails', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('denied')),
      },
    });

    const { result } = renderHook(() => useCamera());

    await result.current.start();

    await waitFor(() => {
      expect(result.current.stream).toBeNull();
      expect(result.current.error?.message).toBe('denied');
    });
  });
});
