import { useCallback, useState } from 'react';
import type { FaceBox } from './extractFaceCrops';

export type FaceDetectionResult = {
  faces: FaceBox[];
};

export type FaceDetector = {
  detect: (
    source: CanvasImageSource,
    width: number,
    height: number,
  ) => Promise<FaceDetectionResult>;
};

export function useFaceDetection(detector: FaceDetector) {
  const [faces, setFaces] = useState<FaceBox[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const detect = useCallback(
    async (source: CanvasImageSource, width: number, height: number) => {
      setIsDetecting(true);
      setError(null);
      try {
        const result = await detector.detect(source, width, height);
        setFaces(result.faces);
        return result.faces;
      } catch (caught) {
        const nextError =
          caught instanceof Error ? caught : new Error(String(caught));
        setError(nextError);
        setFaces([]);
        return [];
      } finally {
        setIsDetecting(false);
      }
    },
    [detector],
  );

  return { faces, error, isDetecting, detect };
}
