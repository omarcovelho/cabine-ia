import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FaceDetector } from './useFaceDetection';
import { useFaceDetection } from './useFaceDetection';

describe('useFaceDetection', () => {
  it('returns detected face boxes from the detector', async () => {
    const detector: FaceDetector = {
      detect: vi.fn().mockResolvedValue({
        faces: [{ x: 1, y: 2, width: 100, height: 120 }],
      }),
    };

    const canvas = document.createElement('canvas');
    const { result } = renderHook(() => useFaceDetection(detector));

    const faces = await result.current.detect(canvas, 640, 480);

    await waitFor(() => {
      expect(faces).toEqual([{ x: 1, y: 2, width: 100, height: 120 }]);
      expect(result.current.faces).toEqual(faces);
      expect(result.current.isDetecting).toBe(false);
    });
  });
});
